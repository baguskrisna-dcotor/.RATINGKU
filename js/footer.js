// ================================================
// FOOTER TEMPLATE - SEDERHANA & PROFESIONAL
// ================================================

// ===== INITIALIZE ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initSmoothAnimations();
    initHoverEffects();
    updateCopyrightYear();
});

// ===== BACK TO TOP BUTTON =====
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    backToTop.addEventListener('click', function() {
        scrollToTop();
    });
}

// Smooth scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== SMOOTH ANIMATIONS =====
function initSmoothAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe footer elements
    const footerElements = document.querySelectorAll('.footer-column, .footer-brand');
    footerElements.forEach(function(element) {
        observer.observe(element);
    });
}

// ===== HOVER EFFECTS =====
function initHoverEffects() {
    // Add smooth transition to all interactive elements
    const interactiveElements = document.querySelectorAll('.footer-links a, .social-link');
    
    interactiveElements.forEach(function(element) {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if href is just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== UTILITY FUNCTIONS =====

// Get current year for copyright
function getCurrentYear() {
    return new Date().getFullYear();
}

// Update copyright year automatically
function updateCopyrightYear() {
    const copyrightElement = document.querySelector('.footer-copyright');
    if (copyrightElement) {
        const year = getCurrentYear();
        copyrightElement.innerHTML = copyrightElement.innerHTML.replace(/\d{4}/, year);
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====

// Add keyboard navigation for social links
document.querySelectorAll('.social-link').forEach(function(link) {
    link.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
});

// ===== CONSOLE MESSAGE =====
console.log('%c🚀 Footer Template Loaded Successfully!', 'color: #0EA5E9; font-size: 16px; font-weight: bold;');
console.log('%cCustomize this template by editing the CSS variables and content.', 'color: #94A3B8; font-size: 12px;');