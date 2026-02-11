const parent = document.querySelector(".content-container");

function makeCrad(id, urlImage, title, description, rating){
    let card = `<div class="review-card" data-id="${id}" style="--image-url: url(${urlImage})">
                    <div class="content-card">
                        <div class="darken-card"></div>
                        <h1 class="rating">${rating}/5.0 ★</h1>
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
    // PERBAIKAN: Deklarasi variable dengan 'const'
    const content = `<div class="content ">
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
    .then(async data => {
        // Fetch ratings untuk setiap content
        const contentWithRatings = await Promise.all(data.map(async item => {
            // Get ratings untuk content ini
            const ratingRes = await fetch(`${SUPABASE_URL}/rest/v1/rating?content_id=eq.${item.id}&select=rating`, {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            });
            const ratings = await ratingRes.json();
            
            // Calculate average rating
            let avgRating = null;
            if (ratings && ratings.length > 0) {
                const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                avgRating = (sum / ratings.length).toFixed(1);
            }
            
            return {
                ...item,
                avgRating: avgRating,
                hasRating: avgRating !== null
            };
        }));
        
        // Sort: yang punya rating dulu, tapi tidak berdasarkan nilai tertinggi
        // Gunakan random order untuk yang sudah ada rating agar tidak monoton
        contentWithRatings.sort((a, b) => {
            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;
            // Jika sama-sama punya rating atau sama-sama tidak punya, random order
            return Math.random() - 0.5;
        });
        
        let fullCard = "";
        contentWithRatings.forEach(item => {
            const id = item.id;
            const title = item.title;
            const desc = item.description ?? "No description yet...";
            const rating = item.avgRating ?? "?";
            let img = SEMENTARAIMG;

            if(item.images && item.images.length > 0) {
                // img = item.images[0].image_url;
            }
            fullCard += makeCrad(id, img, title, desc, rating);
        });
        renderCard(fullCard, category);
    })
    .catch(error => {
        console.error(`Error fetching ${category}:`, error);
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
    // Sembunyikan loading gif
    const loadingGif = document.querySelector('.loading-gif');
    if (loadingGif) {
        loadingGif.style.display = 'none';
    }
    
    if (typeof initSmoothScroll === 'function') {
        initSmoothScroll();
    }
    console.log('✅ All categories loaded and scroll initialized!');
})
.catch(error => {
    console.error('Error loading categories:', error);
    
    // Sembunyikan loading gif meskipun error
    const loadingGif = document.querySelector('.loading-gif');
    if (loadingGif) {
        loadingGif.style.display = 'none';
    }
    
    // Tampilkan pesan error ke user (opsional)
    parent.innerHTML = '<div style="text-align: center; padding: 50px; color: #fff;">Failed to load content. Please refresh the page.</div>';
});

// Make function global agar bisa dipanggil dari onclick
window.goToDetail = function(contentId) {
    window.location.href = `detail.php?id=${contentId}`;
}