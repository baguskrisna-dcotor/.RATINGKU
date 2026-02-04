if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const sliderTrack = document.getElementById("sliderTrack");
const sliders = document.querySelector(".movie-slider");
const slidertrackanime = document.getElementById("animesliderTrack")
const slidersanime = document.querySelector(".anime-slider");


function horizontalScroll(container) {
  container.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

horizontalScroll(sliders);
horizontalScroll(slidersanime);

const titlesanime = [
  "Neon Horizon",
  "Silent Galaxy",
  "Quantum Dream",
  "Last Signal",
  "Crimson Sky",
  "Future Protocol",
  "Eclipse Void",
  "Midnight AI"
];

const titles = [
  "Neon Horizon",
  "Silent Galaxy",
  "Quantum Dream",
  "Last Signal",
  "Crimson Sky",
  "Future Protocol",
  "Eclipse Void",
  "Midnight AI"
];

function randomImage() {
  return `https://picsum.photos/400/600?random=${Math.floor(Math.random()*1000)}`;
}

titles.forEach(title => {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.innerHTML = `
    <img src="${randomImage()}">
    <div class="movie-info">
      <div class="movie-title">${title}</div>
    </div>
  `;
  sliderTrack.appendChild(card);
});

titlesanime.forEach (title => {
    const card = document.createElement("div");
    card.className = "anime-card";
    card.innerHTML = `
    <img src="${randomImage()}">
    <div class="anime-info">
      <div class="anime-title">${title}</div>
    </div>`;
    slidertrackanime.appendChild(card);
});






class InfiniteSlider {
    constructor() {
        this.track = document.getElementById("infoSlider");
        this.container = document.querySelector(".slider-container");
        this.originalSlides = [...document.querySelectorAll(".info-slider .slide")];
        this.slideCount = this.originalSlides.length;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.duration = 5000;
        this.isTransitioning = false;
        this.isPaused = false;
        this.clonesCount = 3;

        this.init();
    }

    init() {
        this.cloneSlides();
        this.createDots();
        this.setupEventListeners();
        
        // Tunggu DOM siap lalu posisikan
        requestAnimationFrame(() => {
            this.currentIndex = this.clonesCount;
            this.updateSlider(false);
            this.startAutoPlay();
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.updateSlider(false);
        });
    }

    cloneSlides() {
        // Clone untuk bagian akhir
        for (let i = 0; i < this.clonesCount; i++) {
            const clone = this.originalSlides[i % this.slideCount].cloneNode(true);
            clone.classList.add('clone');
            this.track.appendChild(clone);
        }
        
        // Clone untuk bagian awal
        for (let i = this.slideCount - 1; i >= this.slideCount - this.clonesCount; i--) {
            const clone = this.originalSlides[i].cloneNode(true);
            clone.classList.add('clone');
            this.track.insertBefore(clone, this.track.firstChild);
        }

        this.slides = document.querySelectorAll(".info-slider .slide");
    }

    createDots() {
        const dotsContainer = document.getElementById("dotsContainer");
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            dot.dataset.index = i;
            dot.addEventListener("click", () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        
        this.dots = document.querySelectorAll(".dot");
    }

    setupEventListeners() {
        document.getElementById("prevBtn").addEventListener("click", () => {
            this.navigate(-1);
        });

        document.getElementById("nextBtn").addEventListener("click", () => {
            this.navigate(1);
        });

        this.track.addEventListener("mouseenter", () => {
            this.isPaused = true;
            this.pauseProgress();
        });

        this.track.addEventListener("mouseleave", () => {
            this.isPaused = false;
            this.resumeProgress();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") this.navigate(-1);
            if (e.key === "ArrowRight") this.navigate(1);
        });

        // Touch support
        let startX = 0;
        this.track.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                this.navigate(diff > 0 ? 1 : -1);
            }
        }, { passive: true });

        this.track.addEventListener("transitionend", () => {
            this.handleTransitionEnd();
        });
    }

    // FUNGSI UTAMA UNTUK CENTERING
    calculateOffset() {
        const activeSlide = this.slides[this.currentIndex];
        if (!activeSlide) return 0;

        const containerWidth = this.container.offsetWidth;
        const slideWidth = activeSlide.offsetWidth;
        const slideMargin = 20; // margin-left dan margin-right masing-masing 20px
        const totalSlideWidth = slideWidth + (slideMargin * 2);

        // Hitung posisi slide dari kiri track
        let slidePosition = 0;
        for (let i = 0; i < this.currentIndex; i++) {
            slidePosition += totalSlideWidth;
        }

        // Hitung offset agar slide aktif di tengah
        const centerOffset = (containerWidth / 2) - (slideWidth / 2) - slideMargin;
        const translateX = centerOffset - slidePosition;

        return translateX;
    }

    navigate(direction) {
        if (this.isTransitioning) return;
        
        this.resetProgress();
        this.currentIndex += direction;
        this.updateSlider(true);
    }

    goToSlide(targetIndex) {
        if (this.isTransitioning) return;
        
        this.resetProgress();
        this.currentIndex = targetIndex + this.clonesCount;
        this.updateSlider(true);
    }

    updateSlider(animate = true) {
        this.isTransitioning = animate;

        const translateX = this.calculateOffset();

        this.track.style.transition = animate 
            ? "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)" 
            : "none";
        this.track.style.transform = `translateX(${translateX}px)`;

        this.updateSlideClasses();
        this.updateDots();
    }

    updateSlideClasses() {
        this.slides.forEach((slide, index) => {
            slide.classList.remove("active", "prev", "next");
            
            if (index === this.currentIndex) {
                slide.classList.add("active");
            } else if (index === this.currentIndex - 1) {
                slide.classList.add("prev");
            } else if (index === this.currentIndex + 1) {
                slide.classList.add("next");
            }
        });
    }

    updateDots() {
        let realIndex = (this.currentIndex - this.clonesCount) % this.slideCount;
        if (realIndex < 0) realIndex += this.slideCount;
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === realIndex);
        });
    }

    handleTransitionEnd() {
        this.isTransitioning = false;
        
        // Seamless jump
        if (this.currentIndex >= this.slideCount + this.clonesCount) {
            this.currentIndex = this.clonesCount;
            this.updateSlider(false);
        }
        
        if (this.currentIndex < this.clonesCount) {
            this.currentIndex = this.slideCount + this.clonesCount - 1;
            this.updateSlider(false);
        }
    }

    startAutoPlay() {
        this.resetProgress();
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.navigate(1);
            }
        }, this.duration);
    }

    resetProgress() {
        const progressBar = document.getElementById("progressBar");
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        
        setTimeout(() => {
            progressBar.style.transition = `width ${this.duration}ms linear`;
            progressBar.style.width = "100%";
        }, 50);
    }

    pauseProgress() {
        const progressBar = document.getElementById("progressBar");
        const computedWidth = getComputedStyle(progressBar).width;
        progressBar.style.transition = "none";
        progressBar.style.width = computedWidth;
    }

    resumeProgress() {
        const progressBar = document.getElementById("progressBar");
        progressBar.style.transition = `width ${this.duration}ms linear`;
        progressBar.style.width = "100%";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new InfiniteSlider();
});
