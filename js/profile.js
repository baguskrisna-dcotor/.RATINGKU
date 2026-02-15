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
            if (referrer.includes('index.html') || referrer.includes('index.html')) {
                window.location.href = 'index.html';
            } else if (referrer.includes('explore.html') || referrer.includes('explore.html')) {
                window.location.href = 'explore.html';
            } else if (referrer.includes('myReview.html') || referrer.includes('myReview.html')) {
                window.location.href = 'myReview.html';
            } else if (referrer.includes('detail.html') || referrer.includes('detail.html')) {
                window.location.href = 'detail.html';
            } else {
                // Fallback ke history back jika ada
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            }
        } else {
            // Default ke index jika tidak ada referrer
            window.location.href = 'index.html';
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
            window.location.href = 'index.html';
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
                content_duplicate (
                    id,
                    title,
                    type,
                    url_path
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
        const contentTitle = rating.content_duplicate?.title || 'Unknown';
    const contentImage = rating.content_duplicate?.url_path || 'img/placeholder.jpg';
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
// TOGGLE SETTING MENU
// ========================================
function setupSettingToggle() {
    const review_menu = document.querySelector(".ratings-section");
    const setting_menu = document.querySelector(".setting-container");
    const setting_button = document.querySelector(".edit-button");

    console.log('Setup toggle - Review menu:', review_menu);
    console.log('Setup toggle - Setting menu:', setting_menu);
    console.log('Setup toggle - Setting button:', setting_button);

    if (!setting_button || !review_menu || !setting_menu) {
        console.error('Setting toggle elements not found');
        return;
    }

    // Set default: tampilkan review, sembunyikan setting
    review_menu.classList.add('active');
    setting_menu.classList.remove('active');

    // Event listener untuk tombol setting
    setting_button.addEventListener('click', () => {
        console.log('Button clicked!');
        console.log('Setting menu has active?', setting_menu.classList.contains('active'));
        
        if (setting_menu.classList.contains('active')) {
            // Tutup setting, buka review
            setting_menu.classList.remove('active');
            review_menu.classList.add('active');
            console.log('Switching to review');
        } else {
            // Buka setting, tutup review
            setting_menu.classList.add('active');
            review_menu.classList.remove('active');
            console.log('Switching to setting');
        }
    });
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
        
        // Setup setting toggle SETELAH semua elemen di-render
        setupSettingToggle();
        
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
// LOAD PHOTO PROFILES
// ========================================
async function loadPhotoProfiles() {
    try {
        const { data, error } = await supabase
            .from('photo_profiles')
            .select('id_pp, url')
            .order('id_pp', { ascending: true });
        
        if (error) {
            console.error('Error loading photo profiles:', error);
            return;
        }
        
        console.log('Photo profiles loaded:', data);
        renderPhotoProfiles(data);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function untuk render photo profiles ke HTML
function renderPhotoProfiles(profiles) {
    const container = document.querySelector('.pp-chooser-grid');
    
    if (!container) {
        console.error('Container .pp-chooser-grid tidak ditemukan');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render setiap profile
    profiles.forEach(profile => {
        const label = document.createElement('label');
        label.className = 'pp-option';
        
        label.innerHTML = `
            <input type="radio" name="avatar" value="${profile.id_pp}">
            <img src="${profile.url}" alt="Avatar ${profile.id_pp} loading="lazy"">
        `;
        
        container.appendChild(label);
    });
}

// ========================================
// START
// ========================================
document.addEventListener('DOMContentLoaded', async() => {
    // Initialize page first
    await initPage();
    
    // Load photo profiles
    await loadPhotoProfiles();

    const user = await getCurrentUser();
    if (!user) return;

    const {data, error} = await supabase
        .from('profiles')
        .select('username, pp')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Profile data:', data);

    const pfp_radio = document.querySelectorAll('input[name="avatar"]');
    const username_input = document.querySelector('.username-type');
    const username = document.querySelector('.username');
    const confirm_button = document.querySelector('.pp-confirm-button');

    if (!username_input || !confirm_button) {
        console.log('Setting elements not found');
        return;
    }

    const localUsername = data.username;
    const alphanumeric = /^[a-zA-Z0-9_-]*$/;

    username.textContent = localUsername;
    username_input.value = localUsername;
    
    const username_old = username_input.value;
    let pfpChange = false;
    let selectedAvatar = data.pp;

    pfp_radio.forEach(radio => {
        if (radio.value == data.pp) {
            radio.checked = true;
        }
    });

    pfp_radio.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedAvatar = radio.value;
            pfpChange = true;
            confirm_button.classList.add('active');
        });
    });

    username_input.addEventListener('input', () => {
        if (username_old != username_input.value || pfpChange == true) {
            confirm_button.classList.add('active');
        } else {
            confirm_button.classList.remove('active');
        }
    });

    confirm_button.addEventListener('click', async () => {
        if (!confirm_button.classList.contains('active')) return;
        
        const new_username = username_input.value.trim();
        
        if (!new_username) {
            alert('Username tidak boleh kosong');
            return;
        }
        
        if (!alphanumeric.test(new_username)) {
            alert('Username hanya boleh mengandung huruf, angka, underscore, dan dash');
            return;
        }

        if (new_username.length < 3) {
            alert('Username minimal 3 karakter');
            return;
        }

        try {
            const updateData = {
                username: new_username,
                pp: selectedAvatar
            };

            const { data, error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id)
                .select();
            
            if (error) {
                console.error('Error updating:', error);
                alert('Gagal memperbarui profil: ' + error.message);
                return;
            }
            
            console.log('Update berhasil:', data);
            window.location.reload();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        }
    });
});