// ========================================
// DETAIL PAGE WITH AUTH INTEGRATION
// ========================================
import { supabase } from './supabase-client.js';

// Global variables
const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');
let currentUser = null;
let currentUserRating = null;
let isEditMode = false;

// ========================================
// INIT: CHECK AUTH & LOAD CONTENT
// ========================================

async function init() {
    // 1. Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // User not logged in - redirect to home with login modal
        alert('Silakan login terlebih dahulu untuk melihat detail konten.');
        window.location.href = 'explore.html';
        return;
    }
    
    currentUser = session.user;
    
    // 2. Load content detail
    if (!contentId) {
        alert('Content ID tidak ditemukan');
        window.location.href = 'explore.html';
        return;
    }
    
    await loadContentDetail();
    await displayUserInfo();
    await loadRatings();
    await checkUserRating();
    
    // 3. Setup event listeners
    setupEventListeners();
}

// ========================================
// LOAD CONTENT DETAIL
// ========================================

async function loadContentDetail() {
    try {
        const { data, error } = await supabase
            .from('content_duplicate')
            .select('*')
            .eq('tmdb_id', contentId)
            .single();
        
        if (error) throw error;
        
        if (data) {
            displayContent(data);
        } else {
            alert('Konten tidak ditemukan');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading content:', error);
        alert('Gagal memuat konten');
    }
}

function displayContent(content) {
    const imageUrl = content.url_path && content.url_path.length > 0 
        ? content.url_path
        : "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";

    // Set hero background
    const imageBackdropUrl = content.url_backdrop_path
    document.getElementById('heroSection').style.backgroundImage = `url(${imageBackdropUrl})`;
    
    // Set poster
    document.getElementById('posterImage').src = imageUrl;
    
    // Set title and description
    document.getElementById('contentTitle').textContent = content.title;
    document.getElementById('contentDescription').textContent = 
        content.description || "Tidak ada deskripsi tersedia.";
    
    // Set type
    document.getElementById('contentType').textContent = content.type || "Unknown";
}

// ========================================
// DISPLAY USER INFO
// ========================================

async function displayUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    try {
        // Ambil data profile dari database
        const { data, error } = await supabase
            .from("profiles")
            .select('username, photo_profiles(url)')
            .eq("id", currentUser.id)
            .single();
        
        if (error) throw error;
        
        console.log('Profile data:', data);
        
        // Set username
        const displayName = data?.username || currentUser.email.split('@')[0];
        userName.textContent = displayName;
        
        // Set avatar
        if (data?.photo_profiles?.url) {
            // Jika ada foto profil dari database
            userAvatar.style.backgroundImage = `url(${data.photo_profiles.url})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.style.backgroundPosition = 'center';
        } else {
            // Fallback ke initial jika tidak ada foto
            const initial = displayName.charAt(0).toUpperCase();
            userAvatar.style.backgroundImage = 'none';
            userAvatar.textContent = initial;
            userAvatar.style.display = 'flex';
            userAvatar.style.alignItems = 'center';
            userAvatar.style.justifyContent = 'center';
            userAvatar.style.fontSize = '1.2rem';
            userAvatar.style.fontWeight = 'bold';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        
        // Fallback jika ada error
        const displayName = currentUser.email.split('@')[0];
        const initial = displayName.charAt(0).toUpperCase();
        
        userName.textContent = displayName;
        userAvatar.style.backgroundImage = 'none';
        userAvatar.textContent = initial;
        userAvatar.style.display = 'flex';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.justifyContent = 'center';
        userAvatar.style.fontSize = '1.2rem';
        userAvatar.style.fontWeight = 'bold';
    }
}

// ========================================
// CHECK USER RATING (EXISTING REVIEW)
// ========================================

async function checkUserRating() {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select('*')
            .eq('content_id', contentId)
            .eq('user_id', currentUser.id)
            .maybeSingle(); // ✅ PENTING!
        
        if (error) throw error;
        
        if (data) {
            currentUserRating = data;
            displayExistingRating(data);
        } else {
            currentUserRating = null;
            document.getElementById('userHint').textContent = 'Berikan penilaian Anda';
        }
    } catch (error) {
        console.error('Error checking user rating:', error);
        currentUserRating = null;
    }
}
function displayExistingRating(rating) {
    // Check the appropriate star
    document.getElementById(`star${rating.rating}`).checked = true;
    
    // Show review text if exists
    if (rating.review) {
        document.getElementById('userReview').value = rating.review;
        document.getElementById('charCount').textContent = rating.review.length;
        document.getElementById('reviewInputSection').style.display = 'block';
    }
    
    // Update button text
    document.getElementById('submitRating').innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Update Rating
    `;
    
    document.getElementById('userHint').textContent = 'Edit penilaian Anda';
    document.getElementById('cancelRating').style.display = 'block';
    isEditMode = true;
}

// ========================================
// LOAD ALL RATINGS
// ========================================
async function loadRatings() {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select(`
                *,
                users:user_id(username,photo_profiles(url))
            `)
            .eq('content_id', contentId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
    
        
        // Calculate average rating and display
        if (data && data.length > 0) {
            const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            document.querySelector('.rating-number').textContent = average.toFixed(1);
            document.getElementById('totalRatings').textContent = `${data.length} rating${data.length > 1 ? 's' : ''}`;
            document.getElementById('reviewCount').textContent = `${data.length} review${data.length > 1 ? 's' : ''}`;
            
            displayReviews(data);
        } else {
            document.querySelector('.rating-number').textContent = '0.0';
            document.getElementById('totalRatings').textContent = '0 ratings';
            document.getElementById('reviewCount').textContent = '0 reviews';
            displayNoReviews();
        }
    } catch (error) {
        console.error('Error loading ratings:', error);
        displayNoReviews();
    }
}

async function displayReviews(ratings) {
    const reviewsList = document.getElementById('reviewsList');
    
    if (!ratings || ratings.length === 0) {
        displayNoReviews();
        return;
    }
      const { data, error } = await supabase
            .from("profiles")
            .select('username, photo_profiles(url)')
            .eq("id", currentUser.id)
            .single();
  
    reviewsList.innerHTML = ratings.map(rating => {
        // ✅ Akses dari relasi users
        const email = rating.users?.username || 'Unknown User';
        const displayName = email.split('@')[0];
        const initial = rating.users.photo_profiles.url;

        const date = formatDate(rating.created_at);
        const isOwnReview = rating.user_id === currentUser.id;
        
        const stars = Array.from({ length: 5 }, (_, i) => {
            const filled = i < rating.rating;
            return `<span class="star ${filled ? '' : 'empty'}">★</span>`;
        }).join('');
        
        return `
            <div class="review-card ${isOwnReview ? 'own-review' : ''}">
                <div class="review-header">
                    <div class="review-user-section">
                        <div class="review-avatar" style="
                                            background-image: url('${initial}');
                                            background-size: cover;
                                            background-position: center;
                                            background-repeat: no-repeat;
                                            "></div>
                        <div class="review-user-info">
                            <div class="review-user-name">
                                ${escapeHtml(displayName)}
                                ${isOwnReview ? '<span class="you-badge">YOU</span>' : ''}
                            </div>
                            <div class="review-date">${date}</div>
                        </div>
                    </div>
                    ${isOwnReview ? `
                        <div class="review-actions">
                            <button class="btn-edit" onclick="editReview(${rating.id}, ${rating.rating}, '${escapeHtml(rating.review || '')}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Edit
                            </button>
                            <button class="btn-delete" onclick="deleteReview(${rating.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Hapus
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="review-rating">${stars}</div>
                ${rating.review ? `<div class="review-content">${escapeHtml(rating.review)}</div>` : ''}
            </div>
        `;
    }).join('');
}
function displayNoReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = `
        <div class="no-reviews">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Belum ada review</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #666;">Jadilah yang pertama memberikan review!</p>
        </div>
    `;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Star rating click - show review input
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('reviewInputSection').style.display = 'block';
        });
    });
    
    // Character counter
    const reviewTextarea = document.getElementById('userReview');
    reviewTextarea.addEventListener('input', () => {
        const length = reviewTextarea.value.length;
        document.getElementById('charCount').textContent = length;
        
        const charCountContainer = document.querySelector('.character-count');
        if (length >= 500) {
            charCountContainer.classList.add('limit-reached');
        } else {
            charCountContainer.classList.remove('limit-reached');
        }
    });
    
    // Submit rating
    document.getElementById('submitRating').addEventListener('click', handleSubmitRating);
    
    // Cancel button
    document.getElementById('cancelRating').addEventListener('click', handleCancel);
    
    // Edit modal
    document.querySelector('.close-edit').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('saveEditRating').addEventListener('click', handleSaveEdit);
    
    // Edit review character counter
    const editReviewTextarea = document.getElementById('editReviewText');
    editReviewTextarea.addEventListener('input', () => {
        const length = editReviewTextarea.value.length;
        document.getElementById('editCharCount').textContent = length;
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editReviewModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
}

// ========================================
// SUBMIT RATING (CREATE OR UPDATE)
// ========================================

async function handleSubmitRating() {
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    const reviewText = document.getElementById('userReview').value.trim();
    const submitBtn = document.getElementById('submitRating');
    
    if (!selectedRating) {
        showMessage('Pilih rating terlebih dahulu!', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';
        
        const ratingData = {
            user_id: currentUser.id,
            content_id: parseInt(contentId),
            rating: parseInt(selectedRating.value),
            review: reviewText || null
        };
        
        console.log('Submitting rating:', ratingData);
        
        let result;
        
        if (isEditMode && currentUserRating) {
            // UPDATE existing rating
            result = await supabase
                .from('rating')
                .update({
                    rating: ratingData.rating,
                    review: ratingData.review
                })
                .eq('id', currentUserRating.id)
                .eq('user_id', currentUser.id)
                .select();
                
            console.log('Update result:', result);
        } else {
            // INSERT new rating
            result = await supabase
                .from('rating')
                .insert([ratingData])
                .select();
                
            console.log('Insert result:', result);
        }
        
        if (result.error) {
            console.error('Supabase error details:', result.error);
            throw result.error;
        }
        
        showMessage(isEditMode ? 'Rating berhasil diupdate!' : 'Rating berhasil dikirim!', 'success');
        
        // ✅ PERBAIKAN: Reload data dan update UI
        setTimeout(async () => {
            await loadRatings();
            await checkUserRating();
            
            // ✅ TAMBAHKAN: Reset message setelah reload
            setTimeout(() => {
                document.getElementById('ratingMessage').className = 'rating-message';
            }, 100);
        }, 1500);
        
    } catch (error) {
        console.error('Error submitting rating:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        if (error.code === '23505') {
            showMessage('Anda sudah memberikan rating untuk konten ini!', 'error');
        } else {
            showMessage('Gagal mengirim rating: ' + (error.message || 'Unknown error'), 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isEditMode ? `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Update Rating
        ` : `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Kirim Rating
        `;
    }
}
// ========================================
// CANCEL EDIT
// ========================================

function handleCancel() {
    // Reset form
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    document.getElementById('userReview').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('reviewInputSection').style.display = 'none';
    document.getElementById('cancelRating').style.display = 'none';
    
    // Reset button
    document.getElementById('submitRating').innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kirim Rating
    `;
    
    document.getElementById('userHint').textContent = 'Berikan penilaian Anda';
    isEditMode = false;
    
    // Reload current rating if exists
    if (currentUserRating) {
        displayExistingRating(currentUserRating);
    }
}

// ========================================
// EDIT REVIEW (MODAL)
// ========================================

window.editReview = function(ratingId, rating, review) {
    const modal = document.getElementById('editReviewModal');
    
    // Set current values
    document.getElementById(`editStar${rating}`).checked = true;
    document.getElementById('editReviewText').value = review;
    document.getElementById('editCharCount').textContent = review.length;
    
    // Store rating ID for save
    modal.dataset.ratingId = ratingId;
    
    // Show modal
    modal.style.display = 'flex';
};

async function handleSaveEdit() {
    const modal = document.getElementById('editReviewModal');
    const ratingId = modal.dataset.ratingId;
    const selectedRating = document.querySelector('input[name="editRating"]:checked');
    const reviewText = document.getElementById('editReviewText').value.trim();
    const saveBtn = document.getElementById('saveEditRating');
    
    if (!selectedRating) {
        showEditMessage('Pilih rating terlebih dahulu!', 'error');
        return;
    }
    
    try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Loading...';
        
        const { error } = await supabase
            .from('rating')
            .update({
                rating: parseInt(selectedRating.value),
                review: reviewText || null
            })
            .eq('id', ratingId)
            .eq('user_id', currentUser.id); // Security check
        
        if (error) throw error;
        
        showEditMessage('Rating berhasil diupdate!', 'success');
        
        setTimeout(async () => {
            closeEditModal();
            await loadRatings();
            await checkUserRating();
        }, 1500);
        
    } catch (error) {
        console.error('Error updating rating:', error);
        showEditMessage('Gagal update rating: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Simpan';
    }
}

function closeEditModal() {
    document.getElementById('editReviewModal').style.display = 'none';
    document.getElementById('editMessage').className = 'edit-message';
}

// ========================================
// DELETE REVIEW
// ========================================

window.deleteReview = async function(ratingId) {
    if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('rating')
            .delete()
            .eq('id', ratingId)
            .eq('user_id', currentUser.id); // Security: ensure user owns this rating
        
        if (error) throw error;
        
        showMessage('Review berhasil dihapus!', 'success');
        
        setTimeout(async () => {
            currentUserRating = null;
            isEditMode = false;
            await loadRatings();
            await checkUserRating();
            handleCancel();
            document.getElementById('ratingMessage').className = 'rating-message';
        }, 1500);
        
    } catch (error) {
        console.error('Error deleting rating:', error);
        showMessage('Gagal menghapus review: ' + error.message, 'error');
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function showMessage(message, type) {
    const messageEl = document.getElementById('ratingMessage');
    messageEl.textContent = message;
    messageEl.className = `rating-message ${type}`;
    
    setTimeout(() => {
        messageEl.className = 'rating-message';
    }, 3000);
}

function showEditMessage(message, type) {
    const messageEl = document.getElementById('editMessage');
    messageEl.textContent = message;
    messageEl.className = `edit-message ${type}`;
    
    setTimeout(() => {
        messageEl.className = 'edit-message';
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return diffMinutes <= 1 ? 'Baru saja' : `${diffMinutes} menit yang lalu`;
        }
        return diffHours === 1 ? '1 jam yang lalu' : `${diffHours} jam yang lalu`;
    } else if (diffDays === 1) {
        return 'Kemarin';
    } else if (diffDays < 7) {
        return `${diffDays} hari yang lalu`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 minggu yang lalu' : `${weeks} minggu yang lalu`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 bulan yang lalu' : `${months} bulan yang lalu`;
    } else {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function goBack() {
    window.history.back();
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', init);

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});