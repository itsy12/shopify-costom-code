/**
 * LUXE BODYSUITS - Main JavaScript
 * Handles navigation, interactions, and performance optimizations
 */

(function() {
    'use strict';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Debounce function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} target - Target element to scroll to
     */
    function smoothScrollTo(target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition - 60; // Account for fixed header
        const duration = 1000;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (navToggle && navMenu) {
        /**
         * Toggle mobile navigation menu
         */
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        /**
         * Close mobile menu when clicking on a link
         */
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        /**
         * Close mobile menu when clicking outside
         */
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(event.target) && 
                !navToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Don't prevent default for links that just go to #
            if (href === '#' || href === '#cart') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                smoothScrollTo(target);
                
                // Update URL without jumping
                history.pushState(null, null, href);
                
                // Set focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });

    // ============================================
    // HEADER SCROLL BEHAVIOR
    // ============================================
    
    const header = document.querySelector('.header');
    let lastScrollY = window.pageYOffset;

    /**
     * Hide header on scroll down, show on scroll up
     */
    const handleScroll = debounce(function() {
        const currentScrollY = window.pageYOffset;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ============================================
    // PRODUCT CARD INTERACTIONS
    // ============================================
    
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const addToCartBtn = card.querySelector('.add-to-cart');
        const quickViewBtn = card.querySelector('.quick-view');
        const productName = card.querySelector('.product-name').textContent;

        /**
         * Add to cart functionality
         */
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = 'Added!';
                this.style.backgroundColor = '#4CAF50';
                
                // Announce to screen readers
                announceToScreenReader(`${productName} added to cart`);
                
                // Update cart count (simplified version)
                updateCartCount();
                
                // Reset button after delay
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 2000);
            });
        }

        /**
         * Quick view functionality
         */
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                announceToScreenReader(`Opening quick view for ${productName}`);
                // In a real implementation, this would open a modal
                console.log('Quick view for:', productName);
            });
        }

        /**
         * Keyboard navigation for product cards
         */
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                quickViewBtn?.click();
            }
        });
    });

    /**
     * Update cart count (simplified)
     */
    let cartCount = 0;
    function updateCartCount() {
        cartCount++;
        const cartLink = document.querySelector('a[href="#cart"]');
        if (cartLink) {
            cartLink.textContent = `Cart (${cartCount})`;
        }
    }

    // ============================================
    // NEWSLETTER FORM
    // ============================================
    
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = emailInput.value;

            // Basic email validation
            if (!email || !isValidEmail(email)) {
                announceToScreenReader('Please enter a valid email address');
                emailInput.focus();
                return;
            }

            // Visual feedback
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribed!';
            submitBtn.style.backgroundColor = '#4CAF50';
            emailInput.value = '';

            announceToScreenReader('Successfully subscribed to newsletter');

            // Reset after delay
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.style.backgroundColor = '';
            }, 3000);

            // In a real implementation, this would send data to a server
            console.log('Newsletter subscription:', email);
        });
    }

    /**
     * Email validation
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ============================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================
    
    /**
     * Fade in elements on scroll using Intersection Observer
     */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe product cards and sections for scroll animations
    const animatedElements = document.querySelectorAll('.product-card, .featured-item, .about-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ============================================
    // ACCESSIBILITY UTILITIES
    // ============================================
    
    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ============================================
    // LAZY LOADING OPTIMIZATION
    // ============================================
    
    /**
     * Lazy load background images for better performance
     */
    if ('IntersectionObserver' in window) {
        const lazyBackgrounds = document.querySelectorAll('.product-image, .hero-image, .about-image');
        
        const lazyBackgroundObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    lazyBackgroundObserver.unobserve(entry.target);
                }
            });
        });

        lazyBackgrounds.forEach(bg => {
            lazyBackgroundObserver.observe(bg);
        });
    }

    // ============================================
    // PERFORMANCE MONITORING
    // ============================================
    
    /**
     * Log performance metrics for optimization
     */
    window.addEventListener('load', function() {
        if ('performance' in window && 'timing' in window.performance) {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                console.log('Performance Metrics:');
                console.log(`Page Load Time: ${pageLoadTime}ms`);
                console.log(`Server Response Time: ${connectTime}ms`);
                console.log(`DOM Render Time: ${renderTime}ms`);
            }, 0);
        }
    });

    // ============================================
    // ESCAPE KEY HANDLER
    // ============================================
    
    /**
     * Close mobile menu with Escape key
     */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        }
    });

    // ============================================
    // FOCUS TRAP FOR MOBILE MENU
    // ============================================
    
    /**
     * Trap focus within mobile menu when open
     */
    if (navMenu) {
        const focusableElements = navMenu.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        navMenu.addEventListener('keydown', function(e) {
            if (!navMenu.classList.contains('active')) return;

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    
    console.log('%c LUXE BODYSUITS ', 'background: #1a1a1a; color: #d4a574; font-size: 16px; padding: 10px;');
    console.log('%c Premium Women\'s Bodywear - Built with Performance & Accessibility ', 'color: #6b6b6b; font-size: 12px;');

})();
