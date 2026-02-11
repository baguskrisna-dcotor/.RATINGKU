// ========================================
// PROFILE PAGE - USER RATINGS
// ========================================
import { supabase } from './supabase-client.js';


// ========================================
// BACK NAVIGATION
// ========================================
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    
    backButton.addEventListener('click', () => {
        // Ambil referrer dari sessionStorage atau URL parameter
        const referrer = sessionStorage.getItem('profileReferrer') || 
                        new URLSearchParams(window.location.search).get('from') ||
                        document.referrer;
        
        // Cek dari mana user datang
        if (referrer) {
            if (referrer.includes('index.php') || referrer.includes('index.html')) {
                window.location.href = 'index.php';
            } else if (referrer.includes('explore.php') || referrer.includes('explore.html')) {
                window.location.href = 'explore.php';
            } else if (referrer.includes('myReview.php') || referrer.includes('myReview.html')) {
                window.location.href = 'myReview.php';
            } else if (referrer.includes('detail.php') || referrer.includes('detail.html')) {
                window.location.href = 'detail.php';
            } else {
                // Fallback ke history back jika ada
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.php';
                }
            }
        } else {
            // Default ke index jika tidak ada referrer
            window.location.href = 'index.php';
        }
    });
}

// ========================================
// GET CURRENT USER
// ========================================
async function getCurrentUser() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            // Redirect to login if not authenticated
            window.location.href = 'index.php';
            return null;
        }
        
        return session.user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// ========================================
// LOAD USER PROFILE
// ========================================
async function loadUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, photo_profiles(url)')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

// ========================================
// LOAD USER RATINGS
// ========================================
async function loadUserRatings(userId) {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select(`
                id,
                rating,
                review,
                created_at,
                content:content_id (
                    id,
                    title,
                    type,
                    images (
                        image_url,
                        is_primary
                    )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading ratings:', error);
        return [];
    }
}

// ========================================
// FORMAT TIME AGO
// ========================================
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        tahun: 31536000,
        bulan: 2592000,
        minggu: 604800,
        hari: 86400,
        jam: 3600,
        menit: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit} yang lalu`;
        }
    }
    
    return 'Baru saja';
}

// ========================================
// RENDER STARS
// ========================================
function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    return starsHTML;
}

// ========================================
// GET PRIMARY IMAGE
// ========================================
function getPrimaryImage(images) {
    if (!images || images.length === 0) {
        return 'img/placeholder.jpg'; // Fallback image
    }
    
    // Cari image yang is_primary = true
    const primaryImage = images.find(img => img.is_primary);
    
    // Jika ada, return URL-nya
    if (primaryImage) {
        return primaryImage.image_url;
    }
    
    // Jika tidak ada, return image pertama
    return images[0].image_url;
}

// ========================================
// RENDER RATINGS
// ========================================
function renderRatings(ratings, username, userPP) {
    const container = document.getElementById('ratingsContainer');
    
    if (!ratings || ratings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Belum Ada Rating</h3>
                <p>Kamu belum memberikan rating pada konten apapun.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ratings.map(rating => {
        const contentTitle = rating.content?.title || 'Unknown';
        const contentImage = getPrimaryImage(rating.content?.images);
        const timeAgoText = timeAgo(rating.created_at);
        
        return `
            <div class="rating-card">
                <div class="rating-content">
                    <div class="rating-header">
                        <div class="rating-avatar">
                            <img src="${userPP}" alt="${username}">
                        </div>
                        <div class="rating-user-info">
                            <h3>${username}</h3>
                            <span class="rating-time">${timeAgoText}</span>
                        </div>
                    </div>
                    <div class="rating-stars">
                        ${renderStars(rating.rating)}
                    </div>
                    ${rating.review ? `<p class="rating-review">${rating.review}</p>` : ''}
                </div>
                <div class="rating-image">
                    <img src="${contentImage}" alt="${contentTitle}">
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// UPDATE UI WITH USER DATA
// ========================================
function updateUI(user, profile) {
    // Update username
    const username = profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    document.getElementById('userName').textContent = username;
    
    // Update email
    document.getElementById('userEmail').textContent = user.email;
    
    // Update avatar
    const avatarURL = profile?.photo_profiles?.url;
    document.getElementById('userAvatar').src = avatarURL;
    
    return { username, avatarURL };
}

// ========================================
// INITIALIZE PAGE
// ========================================
async function initPage() {
    try {
        // Setup back button
        setupBackButton();
        
        // Get current user
        const user = await getCurrentUser();
        if (!user) return;
        
        // Load user profile
        const profile = await loadUserProfile(user.id);
        
        // Update UI
        const { username, avatarURL } = updateUI(user, profile);
        
        // Load and render ratings
        const ratings = await loadUserRatings(user.id);
        renderRatings(ratings, username, avatarURL);
        
    } catch (error) {
        console.error('Error initializing page:', error);
        document.getElementById('ratingsContainer').innerHTML = `
            <div class="empty-state">
                <h3>Terjadi Kesalahan</h3>
                <p>Gagal memuat data profil. Silakan refresh halaman.</p>
            </div>
        `;
    }
}

// ========================================
// START
// ========================================
document.addEventListener('DOMContentLoaded', initPage);