const parent = document.querySelector(".content-container");

function makeCrad(id, urlImage, title, description){
    let card = `<div class="review-card" data-id="${id}" style="--image-url: url(${urlImage})">
                    <div class="content-card">
                        <div class="darken-card"></div>
                        <h1 class="rating">?/5 ★</h1>
                        <p class="deskripsi">${description}</p>
                        <h2 class="judul">${title}</h2>   
                        <div class="open">
                            <button class="button-open" onclick="goToDetail(${id})">Lihat</button>
                        </div>
                    </div>
                </div>`
    return card;
}


function renderCard(fullCard, category){
    content = `<div class="content ">
                    <h1>${category}</h1>
                    <div class="review-container ">
                        ${fullCard}
                    </div>
                </div>`
    parent.innerHTML += content;
}

const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif"

const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";

function fetchData(category){
    return fetch(`${SUPABASE_URL}/rest/v1/content?type=eq.${category}&select=id,title,description,images(image_url)`, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
        }
    })
    .then(res => res.json())
    .then(data => {
        let fullCard = "";
        data.forEach(item => {
            const id = item.id;
            const title = item.title;
            const desc = item.description ?? "No description yet...";
            let img = SEMENTARAIMG;

            if(item.images && item.images.length > 0) {
                // img = item.images[0].image_url;
            }
            fullCard += makeCrad(id, img, title, desc);
        });
        renderCard(fullCard, category);
    });
}


// ✅ FETCH TYPES LALU INIT SCROLL SETELAH SEMUA SELESAI
fetch(`${SUPABASE_URL}/rest/v1/content?select=type`, {
    headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
    }
})
.then(res => res.json())
.then(data => { 
    const rawTypes = data.map(item => item.type);
    const types = [...new Set(rawTypes)];
    
    // Kumpulkan semua promise dari fetchData
    const fetchPromises = types.map(type => fetchData(type));
    
    return Promise.all(fetchPromises);
})
.then(() => {
    if (typeof initSmoothScroll === 'function') {
        initSmoothScroll();
    }
    console.log('✅ All categories loaded and scroll initialized!');
});

function goToDetail(contentId) {
    window.location.href = `detail.php?id=${contentId}`;
}

