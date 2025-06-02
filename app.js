document.addEventListener('DOMContentLoaded', function() {
    console.log("APP.JS: DOMContentLoaded event fired. Script starting."); // For debugging

    // Statistics Animation
    function animateCounters() {
        console.log("APP.JS: animateCounters() function called."); // For debugging
        const statNumbers = document.querySelectorAll('.stat__number');
        const observerOptions = {
            threshold: 0,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            // console.log("APP.JS: IntersectionObserver callback fired. Entries:", entries); // For debugging
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    // console.log("APP.JS: Element is intersecting and not animated:", entry.target); // For debugging
                    entry.target.classList.add('animated');
                    animateCounter(entry.target);
                }
            });
        }, observerOptions);

        statNumbers.forEach(counter => {
            observer.observe(counter);
        });
    }

    function animateCounter(element) {
        // console.log("APP.JS: animateCounter() called for element:", element); // For debugging
        const target = parseFloat(element.getAttribute('data-target'));
        // console.log("APP.JS: Target for this element is:", target); // For debugging
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // Aim for roughly 16ms per step (60fps)
        let current = 0;

        element.classList.add('animate'); // Make sure this class is used if your CSS relies on it for initial state

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (target >= 1000) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                if (Number.isInteger(target)) {
                    if (current >= target) {
                        element.textContent = target.toString();
                    } else {
                        element.textContent = Math.round(current).toString();
                    }
                } else {
                    element.textContent = current.toFixed(1);
                }
            }
        }, 16);
    }

    // Smooth scroll for hero CTA button
    function initSmoothScroll() {
        const heroBtn = document.querySelector('.hero__cta');
        if (heroBtn) {
            heroBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const contactSection = document.querySelector('.contact'); // Ensure your contact section has class="contact" or id="contact"
                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    // Notification system (Your existing function)
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white; padding: 16px 20px; border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); z-index: 1000;
            max-width: 400px; animation: slideIn 0.3s ease;
        `;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .notification__content { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .notification__close { background: none; border: none; color: white; cursor: pointer; padding: 0; display: flex; align-items: center; opacity: 0.8; }
            .notification__close:hover { opacity: 1; }
        `;
        document.head.appendChild(style); // Appending style to head is fine
        document.body.appendChild(notification);
        setTimeout(() => { if (notification.parentElement) notification.remove(); }, 5000);
    }

    // Contact Form Handling - REVISED AND COMPLETE FOR FORMSPREE
    function initContactForm() {
        console.log("APP.JS: initContactForm() function called."); // For debugging
        const form = document.getElementById('contactForm');
        if (!form) {
            console.warn('Contact form with id "contactForm" not found. Form submission will not work.');
            return;
        }

        const formButton = form.querySelector('button[type="submit"]');
        if (!formButton) {
            console.error('Submit button not found in the contact form. Form submission will not work.');
            return;
        }
        const originalButtonText = formButton.textContent;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validation logic (from your original function)
            const requiredFields = ['name', 'email', 'company', 'propertyType'];
            let isValid = true;
            let firstInvalidField = null;

            requiredFields.forEach(field => {
                const input = form.querySelector(`[name="${field}"]`);
                if (input && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#dc2626';
                    if (!firstInvalidField) firstInvalidField = input;
                } else if (input) {
                    input.style.borderColor = '';
                }
            });

            const emailInput = form.querySelector('[name="email"]');
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value && !emailRegex.test(emailInput.value)) {
                    isValid = false;
                    emailInput.style.borderColor = '#dc2626';
                    if (!firstInvalidField) firstInvalidField = emailInput;
                }
            }

            if (!isValid) {
                if (firstInvalidField) firstInvalidField.focus();
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }

            // Formspree submission
            const formDataForSpree = new FormData(form);
            const actionUrl = form.action; // Should be your Formspree URL from index.html

            formButton.textContent = 'Submitting...';
            formButton.disabled = true;

            fetch(actionUrl, {
                method: 'POST',
                body: formDataForSpree,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    return response.json().catch(() => ({ ok: true }));
                } else {
                    return response.json().catch(() => ({ error: 'Form submission failed with no specific error details.' }))
                        .then(errData => {
                            const errorMessage = errData.errors && errData.errors.map(err => err.message).join(', ');
                            throw new Error(errorMessage || errData.error || 'Form submission to Formspree failed.');
                        });
                }
            })
            .then(responseData => {
                form.reset();
                const allInputs = form.querySelectorAll('input, select, textarea');
                allInputs.forEach(input => { if (input) input.style.borderColor = ''; });
                showNotification('Thank you! We\'ll contact you within 24 hours to schedule your free site assessment.', 'success');
                console.log('Formspree success:', responseData);
                formButton.textContent = originalButtonText;
                formButton.disabled = false;
            })
            .catch(error => {
                console.error('Formspree submission error:', error);
                showNotification('Sorry, there was an error submitting your form. ' + error.message, 'error');
                formButton.textContent = originalButtonText;
                formButton.disabled = false;
            });
        });

        // Real-time validation feedback (from your original function)
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#dc2626';
                } else if (this.type === 'email' && this.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    this.style.borderColor = emailRegex.test(this.value) ? '' : '#dc2626';
                } else {
                    this.style.borderColor = '';
                }
            });
            input.addEventListener('focus', function() {
                this.style.borderColor = 'var(--color-primary)'; // Using CSS variable for consistency
            });
        });
    }

    // Scroll animations for cards (Your existing function)
    function initScrollAnimations() {
        const cards = document.querySelectorAll('.benefit__card, .property__card, .safety__feature, .process__step');
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }

    // Enhanced hover effects (Your existing function)
    function initHoverEffects() {
        const cards = document.querySelectorAll('.benefit__card, .property__card, .safety__feature');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-8px) scale(1.02)'; });
            card.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0) scale(1)'; });
        });
    }

    // Parallax effect for hero section (Your existing function)
    function initParallaxEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        // Debounce the scroll event for parallax for better performance
        window.addEventListener('scroll', debounce(function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.2; // Adjusted rate slightly, can be tweaked
            if (scrolled < window.innerHeight) { // Apply only when hero is somewhat in view
                hero.style.backgroundPositionY = `${rate}px`; // Changed to backgroundPositionY for typical parallax
            }
        }, 10)); // Debounce wait time in ms
    }

    // Initialize all functionality
    function init() {
        console.log("APP.JS: init() function called."); // For debugging
        animateCounters();
        initSmoothScroll();
        initContactForm(); // This will now be the Formspree version
        initScrollAnimations();
        initHoverEffects();
        initParallaxEffect();
    }

    // Run initialization
    init();

    // Performance optimization: debounce scroll events (Your existing function)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add smooth loading animation (Your existing function)
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.3s ease';
    });

    // Handle page visibility for performance (Your existing function)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.documentElement.style.animationPlayState = 'paused';
        } else {
            document.documentElement.style.animationPlayState = 'running';
        }
    });

}); // <<< THIS IS THE SINGLE, CLOSING BRACE FOR THE MAIN DOMContentLoaded LISTENER