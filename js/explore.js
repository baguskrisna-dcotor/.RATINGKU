// ========================================
// EXPLORE PAGE - CONTENT LOADER
// ========================================
import msgBox from "./component/alert.js"
import { supabase } from "./supabase-client.js";

const parent = document.querySelector(".content-container");

// ✅ GLOBAL FLAGS untuk prevent multiple execution
const SCRIPT_ID = 'explore-content-loader';
if (window[SCRIPT_ID]) {
    console.warn('⚠️ Script already loaded, skipping initialization');
    throw new Error('Script already initialized');
}
window[SCRIPT_ID] = true;

// ========================================
// CARD BUILDER
// ========================================

function makeCard(id, urlImage, title, description, rating, categories = null){
    const escapedTitle = escapeHtml(title);
    const escapedDesc = escapeHtml(limitWords(description, 30));
    
    const card = `<div class="review-card" data-id="${id}" style="--image-url: url(${urlImage})">
                    <div class="content-card">
                        <div class="darken-card"></div>
                        <h1 class="rating">${rating}/5.0 ★</h1>
                        <p class="deskripsi">${escapedDesc}</p>
                        <h2 class="judul">${escapedTitle}</h2>   
                        <div class="open">
                            <button class="button-open" onclick="goToDetail(${id},'${categories}')">Lihat</button>
                        </div>
                    </div>
                </div>`;
    return card;
}

function limitWords(str, limit){
    const words = str.split(" ");
    if (words.length <= limit) return str;
    return words.slice(0, limit).join(" ") + "...";
}

function renderCard(fullCard, category){
    // ✅ Double check: apakah kategori sudah ada
    const existingCategory = parent.querySelector(`[data-category="${category}"]`);
    
    if (existingCategory) {
        console.warn(`⚠️ Category "${category}" already rendered, skipping...`);
        return;
    }
    
    const content = `<div class="content" data-category="${category}">
                    <h1>${category}</h1>
                    <div class="review-container">
                        ${fullCard}
                    </div>
                </div>`;
    
    parent.insertAdjacentHTML('beforeend', content);
    console.log(`✅ Rendered category: ${category}`);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// CONSTANTS
// ========================================

const SEMENTARAIMG = "banner.png";
const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    loadedCategories: new Set(),
    isInitialized: false,
    isFetching: false
};

// ========================================
// TOP RATED CONTENT
// ========================================

async function fetchTopRatedContent() {
    const category = "Rating Tertinggi";
    
    if (state.loadedCategories.has(category)) {
        console.log(`✅ Category "${category}" already loaded`);
        return;
    }
    
    state.loadedCategories.add(category);
    
    try {
        console.log(`📥 Fetching top rated content...`);
        
        // ✅ FIXED: pakai url_path langsung dari content_duplicate, tidak pakai images(image_url)
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content_duplicate?select=id,title,description,type,url_path,tmdb_id`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        
        const allContent = await contentRes.json();
        
        if (!allContent || allContent.length === 0) {
            console.log(`⚠️ No content found`);
            state.loadedCategories.delete(category);
            return;
        }
        
        // Fetch ratings untuk semua content dan hitung rata-rata
        const contentWithAvgRatings = await Promise.all(allContent.map(async item => {
            try {
                const ratingRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/rating?content_id=eq.${item.id}&select=rating`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );
                
                const ratings = await ratingRes.json();
                
                if (ratings && ratings.length > 0) {
                    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                    const avgRating = sum / ratings.length;
                    
                    return {
                        ...item,
                        avgRating: avgRating,
                        ratingCount: ratings.length
                    };
                }
                
                return null; // Skip content tanpa rating
                
            } catch (error) {
                console.error(`Error fetching rating for content ${item.id}:`, error);
                return null;
            }
        }));
        
        // Filter content yang punya rating dan sort by rating tertinggi
        const topRatedContent = contentWithAvgRatings
            .filter(item => item !== null && item.avgRating !== undefined)
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 10);
        
        if (topRatedContent.length === 0) {
            state.loadedCategories.delete(category);
            return;
        }
        
        
        // Build cards
        let fullCard = "";
        topRatedContent.forEach(item => {
            // ✅ FIXED: pakai url_path langsung, fallback ke SEMENTARAIMG
            const img = item.url_path || SEMENTARAIMG;
            const desc = item.description ?? "No description yet...";
            const rating = item.avgRating.toFixed(1);
            
            fullCard += makeCard(item.tmdb_id, img, item.title, desc, rating);
        });
        
        renderTopRatedCard(fullCard, category);
        
    } catch (error) {
        console.error(`❌ Error fetching top rated content:`, error);
        state.loadedCategories.delete(category);
    }
}

// Fungsi khusus untuk render kategori "Rating Tertinggi" di paling atas
function renderTopRatedCard(fullCard, category) {
    const existingCategory = parent.querySelector(`[data-category="${category}"]`);
    
    if (existingCategory) {
        return;
    }
    
    const content = `<div class="content top-rated" data-category="${category}" style="
    margin-top: 80px; 
    margin-bottom: 50px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    padding :10px 20px 30px 10px;
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2), 
                0 0 60px rgba(255, 215, 0, 0.1) inset;
    position: relative;
    overflow: hidden;
">
    <div style="
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, 
            transparent 30%, 
            rgba(255, 215, 0, 0.05) 50%, 
            transparent 70%);
        pointer-events: none;
        animation: shine 3s infinite;
    "></div>
    
    <div style="
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 40px;
        opacity: 0.3;
        animation: pulse-star 2s ease-in-out infinite;
    ">⭐</div>
    
    <div style="position: relative; z-index: 1;">
        <h1 style="
            font-size: 2.5em;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
            margin-bottom: 15px;
            font-weight: 800;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 15px;
        ">
            <span style="font-size: 1.2em; animation: rotate-star 4s linear infinite;">⭐</span>
            ${category}
            <span style="
                font-size: 0.4em;
                background: rgba(255, 215, 0, 0.2);
                padding: 5px 15px;
                border-radius: 20px;
                border: 1px solid rgba(255, 215, 0, 0.4);
                -webkit-text-fill-color: #FFD700;
                text-shadow: none;
                letter-spacing: 0;
                font-weight: 600;
            ">TOP 10</span>
        </h1>
        
        <p style="
            font-size: 20px;
            color: #bee3ff;
            font-family: var(--font-default);
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            line-height: 1.6;
            margin-bottom: 25px;
        ">
            Deretan konten paling top di <span class="title" style="
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 700;
            ">RATINGKU</span> saat ini nih, konten kesukaan kamu ada ga ya? 🔥
        </p>
    </div>
    
    <div class="review-container" style="position: relative; z-index: 1; padding-left: 10px;">
        ${fullCard}
    </div>
</div>

<style>
@keyframes shine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
@keyframes pulse-star {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.2); opacity: 0.6; }
}
@keyframes rotate-star {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.top-rated .review-card {
    border: 1px solid rgba(255, 215, 0, 0.2);
    transition: all 0.3s ease;
}
.top-rated .review-card:hover {
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
    transform: translateY(-5px) scale(1.02);
}
.top-rated .review-card .rating {
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    font-weight: 700;
}
</style>`;
    
    const firstCategory = parent.querySelector('[data-category]');
    if (firstCategory) {
        firstCategory.insertAdjacentHTML('beforebegin', content);
    } else {
        parent.insertAdjacentHTML('beforeend', content);
    }
    
}

// ========================================
// FETCH DATA
// ========================================

async function fetchData(category){
    if (state.loadedCategories.has(category)) {
        console.log(`✅ Category "${category}" already loaded`);
        return;
    }
    
    state.loadedCategories.add(category);
    
    try {
        console.log(`📥 Fetching category: ${category}`);
        
        // ✅ FIXED: pakai url_path langsung, tidak pakai images(image_url)
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content_duplicate?type=eq.${category}&select=id,title,description,url_path`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        
        const data = await contentRes.json();
        
        if (!data || data.length === 0) {
            console.log(`⚠️ No content found for category: ${category}`);
            state.loadedCategories.delete(category);
            return;
        }
        
        // Fetch ratings untuk setiap content
        const contentWithRatings = await Promise.all(data.map(async item => {
            try {
                const ratingRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/rating?content_id=eq.${item.id}&select=rating`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );
                
                const ratings = await ratingRes.json();
                
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
            } catch (error) {
                console.error(`Error fetching rating for content ${item.id}:`, error);
                return {
                    ...item,
                    avgRating: null,
                    hasRating: false
                };
            }
        }));
        
        // Sort: yang punya rating dulu
        contentWithRatings.sort((a, b) => {
            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;
            return Math.random() - 0.5;
        });
        
        // Build cards
        let fullCard = "";
        contentWithRatings.forEach(item => {
            // ✅ FIXED: pakai url_path langsung
            const img = item.url_path || SEMENTARAIMG;
            const desc = item.description ?? "No description yet...";
            const rating = item.avgRating ?? "?";
            fullCard += makeCard(item.id, img, item.title, desc, rating);
        });
        
        renderCard(fullCard, category);
        
    } catch (error) {
        console.error(`❌ Error fetching ${category}:`, error);
        state.loadedCategories.delete(category);
    }
}

// ========================================
// INITIALIZE
// ========================================

async function initializeContent() {
    if (state.isInitialized) {
        console.warn('⚠️ Content already initialized');
        return;
    }
    
    if (state.isFetching) {
        console.warn('⚠️ Fetch already in progress');
        return;
    }
    
    state.isInitialized = true;
    state.isFetching = true;
    
    try {
        console.log('🚀 Initializing content loader...');
        
        if (parent) {
            const categories = parent.querySelectorAll('[data-category]');
            categories.forEach(cat => cat.remove());
        } else {
            console.error('❌ .content-container not found!');
            return;
        }
        
        state.loadedCategories.clear();

        await fetchTopRatedContent();
        await Promise.all(["movie", "tv", "anime"].map(type => getTrending(type)));
        
        const loadingGif = document.querySelector('.loading-gif');
        if (loadingGif) loadingGif.style.display = 'none';
        
        if (typeof initSmoothScroll === 'function') initSmoothScroll();
        
        console.log('✅ All categories loaded!');
    } catch (error) {
        console.error('❌ Error loading content:', error);
        
        const loadingGif = document.querySelector('.loading-gif');
        if (loadingGif) loadingGif.style.display = 'none';
        
        if (parent) {
            parent.insertAdjacentHTML('beforeend', '<div style="text-align: center; padding: 50px; color: #fff;">Failed to load content. Please refresh the page.</div>');
        }
        
        state.isInitialized = false;
        
    } finally {
        state.isFetching = false;
    }
}

// ========================================
// START
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContent, { once: true });
} else {
    initializeContent();
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.goToDetail = async function(contentId, categories) {
    try {
        // ✅ FIXED: cek di content_duplicate
        const { data, error } = await supabase
            .from("content_duplicate")
            .select("*")
            .eq("tmdb_id", contentId);

        if (data && data.length > 0) {
            // Konten sudah ada, langsung redirect
            console.log("Konten sudah ada di DB:", data);
            await delay(500);
            window.location.href = `detail.html?id=${contentId}`;
            return;
        }

        // Konten belum ada, fetch dari TMDB lalu insert
        try {
            let dataContent, dataTitle, year;

            if (categories.toLowerCase() === "movie") {
                const url = `https://api.themoviedb.org/3/movie/${contentId}?api_key=${API_TMDB}&language=en-US`;
                const res = await fetch(url);
                dataContent = await res.json();
                dataTitle = dataContent.title;
                year = dataContent.release_date;
            } else if (categories.toLowerCase() === "tv") {
                const url = `https://api.themoviedb.org/3/tv/${contentId}?api_key=${API_TMDB}&language=en-US`;
                const res = await fetch(url);
                dataContent = await res.json();
                dataTitle = dataContent.name;
                year = dataContent.first_air_date;
            } else {
                // Kategori tidak dikenal, langsung redirect saja
                await delay(500);
                window.location.href = `detail.html?id=${contentId}`;
                return;
            }

            const urlIMG = "https://image.tmdb.org/t/p/w500" + dataContent.poster_path;
            const urlBackdrop = dataContent.backdrop_path
                ? "https://image.tmdb.org/t/p/original" + dataContent.backdrop_path
                : urlIMG;

            const dataToInsert = {
                tmdb_id: dataContent.id,
                title: dataTitle,
                description: dataContent.overview,
                release_year: year ? year.split("-")[0] : null,
                url_path: urlIMG,
                url_backdrop_path: urlBackdrop,
                type: categories, // ✅ pakai categories (movie/tv), bukan dataContent.status
            };

            console.log("Inserting ke content_duplicate:", dataToInsert);

            // ✅ FIXED: insert ke content_duplicate
            const { error: insertError } = await supabase
                .from('content_duplicate')
                .insert([dataToInsert]);

            if (insertError) {
                msgBox.error("Gagal menyimpan konten");
                console.error(insertError);
                return; // ✅ Stop jika gagal, tidak redirect
            }

            msgBox.success('Konten berhasil disimpan!');

        } catch (fetchError) {
            msgBox.error("Gagal memuat data dari TMDB");
            console.error(fetchError);
            return; // ✅ Stop jika gagal
        }

        await delay(500);
        window.location.href = `detail.html?id=${contentId}`;

    } catch (error) {
        msgBox.error("Terjadi kesalahan");
        console.error(error);
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// DEBUG HELPERS
// ========================================

window.debugExplore = function() {
    console.log('=== DEBUG INFO ===');
    console.log('Loaded categories:', Array.from(state.loadedCategories));
    console.log('Is initialized:', state.isInitialized);
    console.log('Is fetching:', state.isFetching);
    console.log('Rendered categories:', parent.querySelectorAll('[data-category]').length);
    console.log('Total cards:', parent.querySelectorAll('.review-card').length);
};

// ========================================
// TMDB CONFIG
// ========================================

const API_TMDB = 'a826847f8ba8f3661c9d8b3d3bc09469';
const API_TMDB_READ = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhODI2ODQ3ZjhiYThmMzY2MWM5ZDhiM2QzYmMwOTQ2OSIsIm5iZiI6MTc3MTExNTI4NC44NTYsInN1YiI6IjY5OTExMzE0M2ZiYWUxNWRmMzJhZTljYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OJvv5g-gxdECtrP_ZZ_9foQipmPPw-1HUn05zIh7pmQ';

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_TMDB_READ}`
    }
};

async function getTrending(category) {
    try {
        let res;

        if (category.toLowerCase() === "anime") {
            res = await fetch(
                `https://api.themoviedb.org/3/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc`,
                options
            );
        } else {
            res = await fetch(
                `https://api.themoviedb.org/3/trending/${category}/week`,
                options
            );
        }

        if (!res.ok) throw new Error("Response not OK");

        const data = await res.json();
        const movies = data.results;
        const categoryHandler = category.toLowerCase() === "anime" ? "tv" : category;

        // ✅ 1 request: ambil semua content_duplicate yang tmdb_id-nya cocok
        const tmdbIds = movies.map(m => m.id).join(',');
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content_duplicate?tmdb_id=in.(${tmdbIds})&select=id,tmdb_id`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const contentData = await contentRes.json();

        // Map: tmdb_id -> id (dari content_duplicate)
        const tmdbToDbId = {};
        contentData.forEach(c => { tmdbToDbId[c.tmdb_id] = c.id; });

        // ✅ 1 request: ambil semua rating untuk content yang ada di DB
        const dbIds = contentData.map(c => c.id).join(',');
        let ratingMap = {}; // { dbId: avgRating }

        if (dbIds.length > 0) {
            const ratingRes = await fetch(
                `${SUPABASE_URL}/rest/v1/rating?content_id=in.(${dbIds})&select=content_id,rating`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const ratingData = await ratingRes.json();

            // Kelompokkan rating per content_id lalu hitung avg
            const ratingGroups = {};
            ratingData.forEach(r => {
                if (!ratingGroups[r.content_id]) ratingGroups[r.content_id] = [];
                ratingGroups[r.content_id].push(r.rating);
            });
            Object.entries(ratingGroups).forEach(([contentId, ratings]) => {
                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                ratingMap[contentId] = avg.toFixed(1);
            });
        }

        // Build cards
        let fullCard = "";
        movies.forEach(item => {
            const urlIMG = "https://image.tmdb.org/t/p/w500" + item.poster_path;
            const dbId = tmdbToDbId[item.id];
            const displayRating = (dbId && ratingMap[dbId]) ? ratingMap[dbId] : "?";
            fullCard += makeCard(item.id, urlIMG, item.title || item.name, item.overview, displayRating, categoryHandler);
        });

        renderCard(fullCard, `Trending ${category} di TMDb`);

    } catch (err) {
        console.error(err);
        msgBox.error("ERROR TMDB");
    }
}
