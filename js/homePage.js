const sub_title = document.getElementById("sub-title");
let subtitles = [];

fetch("strings/sub-title.json")
    .then(res => res.json())
    .then(data => {
        subtitles = data;
        initSubtitle();
    })
    .catch(err => console.error('Failed to load subtitles:', err));

fadeIn("sub-title");

function initSubtitle() {
    if (subtitles.length === 0) return;

    const currentHour = new Date().getHours();
    const savedHour = localStorage.getItem("subtitleHour");
    const savedText = localStorage.getItem("subtitleText");

    if (savedHour == currentHour && savedText) {
        sub_title.textContent = savedText;
        return;
    }

    const rand = subtitles[Math.floor(Math.random() * subtitles.length)];
    sub_title.textContent = rand;

    localStorage.setItem("subtitleHour", currentHour);
    localStorage.setItem("subtitleText", rand);
}

// Check setiap menit
setInterval(() => {
    const currentHour = new Date().getHours();
    const savedHour = localStorage.getItem("subtitleHour");

    if (savedHour != currentHour) {
        initSubtitle();
    }
}, 60 * 1000);

// OPTIMASI: Pakai CSS transition untuk fade
function fadeIn(idElement) {
    const el = document.getElementById(idElement);
    if (!el) return;
    
    el.style.transition = 'opacity 0.5s ease';
    el.style.opacity = 0;
    
    // Force reflow
    el.offsetHeight;
    
    // Fade in
    requestAnimationFrame(() => {
        el.style.opacity = 1;
    });
}

const genre_data = ["Romance","Slice of Life","Sci-fi","Horror","Comedy","Action"]

function make_element(data, kelas, containerName){
    const container = document.querySelector(containerName)
    
    // Duplikasi 3-4x agar tidak terlihat gap
    for(let i = 0; i < 4; i++) {
        data.forEach(item => {
            const span = document.createElement("span")
            span.textContent = "#"+item;
            span.classList.add(kelas)
            container.appendChild(span)
        })
    }
}

make_element(genre_data, "genre-span", ".text-list")

