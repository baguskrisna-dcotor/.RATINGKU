function initSmoothScroll() {
    const reviewContainers = document.querySelectorAll('.review-container');
    
    reviewContainers.forEach(container => {
        // Skip jika sudah di-init (cek flag)
        if (container.dataset.scrollInit) return;
        container.dataset.scrollInit = 'true';
        
        // === 1. SMOOTH MOUSE WHEEL SCROLL ===
        let isScrolling = false;
        let scrollTarget = container.scrollLeft;
        
        container.addEventListener('wheel', (e) => {
            if (container.scrollWidth > container.clientWidth) {
                e.preventDefault();
                
                scrollTarget += e.deltaY;
                scrollTarget = Math.max(0, Math.min(scrollTarget, container.scrollWidth - container.clientWidth));
                
                if (!isScrolling) {
                    isScrolling = true;
                    smoothScroll();
                }
            }
        }, { passive: false });
        
        function smoothScroll() {
            const diff = scrollTarget - container.scrollLeft;
            const delta = diff * 0.15;
            
            if (Math.abs(delta) > 0.5) {
                container.scrollLeft += delta;
                requestAnimationFrame(smoothScroll);
            } else {
                container.scrollLeft = scrollTarget;
                isScrolling = false;
            }
        }
        
        // === 3. KEYBOARD NAVIGATION ===
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                
                const direction = e.key === 'ArrowLeft' ? -1 : 1;
                const cardWidth = 270; 
                const gap = 10;
                const scrollAmount = (cardWidth + gap) * direction;
                
                container.scrollBy({ 
                    left: scrollAmount, 
                    behavior: 'smooth' 
                });
            }
        });
        
        if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '0');
        }
        
        // === 4. AUTO-HIDE SCROLLBAR ===
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
        
        // === 5. SNAP TO CARD ===
        let scrollTimeout;
        
        container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const cardWidth = 270 + 10;
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
}