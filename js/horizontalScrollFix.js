// ========================================
// ULTRA SMOOTH HORIZONTAL SCROLL
// ========================================

const reviewContainers = document.querySelectorAll('.review-container');

reviewContainers.forEach(container => {
    
    // === 1. SMOOTH MOUSE WHEEL SCROLL ===
    let isScrolling = false;
    let scrollTarget = container.scrollLeft;
    
    container.addEventListener('wheel', (e) => {
        if (container.scrollWidth > container.clientWidth) {
            e.preventDefault();
            
            // Smooth scroll dengan easing
            scrollTarget += e.deltaY;
            
            // Batasi scroll target
            scrollTarget = Math.max(0, Math.min(scrollTarget, container.scrollWidth - container.clientWidth));
            
            if (!isScrolling) {
                isScrolling = true;
                smoothScroll();
            }
        }
    }, { passive: false });
    
    // Smooth scroll animation dengan easing
    function smoothScroll() {
        const diff = scrollTarget - container.scrollLeft;
        const delta = diff * 0.15; // Easing factor (lebih kecil = lebih smooth)
        
        if (Math.abs(delta) > 0.5) {
            container.scrollLeft += delta;
            requestAnimationFrame(smoothScroll);
        } else {
            container.scrollLeft = scrollTarget;
            isScrolling = false;
        }
    }
    
    
    // === 2. BUTTERY SMOOTH DRAG TO SCROLL ===
    // let isDown = false;
    // let startX;
    // let scrollLeft;
    // let velocity = 0;
    // let lastX = 0;
    // let lastTime = Date.now();
    // let momentumInterval;

    // container.addEventListener('mousedown', (e) => {
    //     isDown = true;
    //     container.classList.add('active');
    //     container.style.cursor = 'grabbing';
    //     container.style.userSelect = 'none';
        
    //     startX = e.pageX - container.offsetLeft;
    //     scrollLeft = container.scrollLeft;
    //     lastX = e.pageX;
    //     lastTime = Date.now();
    //     velocity = 0;
        
    //     // Stop momentum
    //     if (momentumInterval) {
    //         cancelAnimationFrame(momentumInterval);
    //     }
    // });

    // container.addEventListener('mouseleave', () => {
    //     if (isDown) {
    //         isDown = false;
    //         container.classList.remove('active');
    //         container.style.cursor = 'grab';
    //         applyMomentum();
    //     }
    // });

    // container.addEventListener('mouseup', () => {
    //     if (isDown) {
    //         isDown = false;
    //         container.classList.remove('active');
    //         container.style.cursor = 'grab';
    //         applyMomentum();
    //     }
    // });

    // container.addEventListener('mousemove', (e) => {
    //     if (!isDown) return;
    //     e.preventDefault();
        
    //     const x = e.pageX - container.offsetLeft;
    //     const walk = (x - startX) * 1.5; // Drag sensitivity
    //     const now = Date.now();
    //     const dt = now - lastTime;
        
    //     // Calculate velocity untuk momentum
    //     if (dt > 0) {
    //         velocity = (e.pageX - lastX) / dt * 10;
    //     }
        
    //     container.scrollLeft = scrollLeft - walk;
    //     lastX = e.pageX;
    //     lastTime = now;
    // });
    
    // // Momentum scrolling setelah drag
    // function applyMomentum() {
    //     if (Math.abs(velocity) > 0.5) {
    //         container.scrollLeft -= velocity * 10;
    //         velocity *= 0.92; // Friction/deceleration
    //         momentumInterval = requestAnimationFrame(applyMomentum);
    //     }
    // }
    
    
    // === 3. SMOOTH KEYBOARD NAVIGATION ===
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            const cardWidth = 250; // var(--width-item)
            const gap = 10;
            const scrollAmount = (cardWidth + gap) * direction;
            
            // Smooth scroll ke posisi target
            container.scrollBy({ 
                left: scrollAmount, 
                behavior: 'smooth' 
            });
        }
    });
    
    // Make focusable
    if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '0');
    }
    
    
    // === 4. AUTO-HIDE SCROLLBAR (Muncul saat hover) ===
    let hideScrollbarTimeout;
    
    container.addEventListener('mouseenter', () => {
        container.classList.add('show-scrollbar');
        clearTimeout(hideScrollbarTimeout);
    });
    
    container.addEventListener('mouseleave', () => {
        hideScrollbarTimeout = setTimeout(() => {
            container.classList.remove('show-scrollbar');
        }, 1000);
    });
    
    container.addEventListener('scroll', () => {
        container.classList.add('show-scrollbar');
        clearTimeout(hideScrollbarTimeout);
        
        hideScrollbarTimeout = setTimeout(() => {
            container.classList.remove('show-scrollbar');
        }, 1000);
    });
});

// === 5. SNAP TO CARD (Optional - Uncomment jika mau) ===

reviewContainers.forEach(container => {
    let scrollTimeout;
    
    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const cardWidth = 220 + 10; // width + gap
            const scrollPos = container.scrollLeft;
            const targetCard = Math.round(scrollPos / cardWidth);
            const targetScroll = targetCard * cardWidth;
            
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }, 150);
    });
});


console.log('✅ Ultra smooth scroll enabled!');