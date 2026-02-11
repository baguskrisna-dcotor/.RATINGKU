// profile.js
import { 
    supabase, 
    getCurrentUser, 
    getUserProfile, 
    getUserRatings, 
    updateUserProfile,
    signOut 
} from './supabase-client.js';

let currentUser = null;
let currentProfile = null;
let currentRatings = [];

// Initialize profile page
async function initProfile() {
    showLoading();
    
    // Check if user is logged in
    currentUser = await getCurrentUser();
    
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    // Load user data
    await loadUserData();
}

// Show loading state
function showLoading() {
    const container = document.getElementById('mainContainer');
    container.innerHTML = `
        <div class="profile-card">
            <div class="loading">Loading your profile...</div>
        </div>
    `;
}

// Show login prompt
function showLoginPrompt() {
    const container = document.getElementById('mainContainer');
    container.innerHTML = `
        <div class="profile-card">
            <div class="login-prompt">
                <h2>Please Login to View Your Profile</h2>
                <p style="color: white; margin-bottom: 20px;">You need to be logged in to access this page.</p>
                <a href="login.html" class="btn">Go to Login</a>
            </div>
        </div>
    `;
}

// Load user data
async function loadUserData() {
    try {
        // Get profile
        currentProfile = await getUserProfile(currentUser.id);
        
        // Get ratings
        currentRatings = await getUserRatings(currentUser.id);
        
        // Render profile
        renderProfile();
        
        // Render ratings
        renderRatings();
        
    } catch (error) {
        showError('Failed to load user data');
        console.error(error);
    }
}

// Render profile section
function renderProfile() {
    const profileCard = document.getElementById('profileCard');
    
    const totalRatings = currentRatings.length;
    const avgRating = totalRatings > 0 
        ? (currentRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        : '0.0';
    const totalReviews = currentRatings.filter(r => r.review && r.review.trim() !== '').length;
    
    const memberSince = currentProfile?.created_at 
        ? new Date(currentProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'Unknown';
    
    profileCard.innerHTML = `
        <div id="viewMode" class="view-mode">
            <div class="profile-header">
                <img src="${currentProfile?.pp || 'https://aervhwynaxjyzqeiijca.supabase.co/storage/v1/object/public/photoprofile/pp.webp'}" 
                     alt="Profile Picture" 
                     class="profile-image"
                     id="profileImage">
                <div class="profile-info">
                    <h1 id="displayUsername">${currentProfile?.username || 'No username'}</h1>
                    <p>${currentUser?.email || ''}</p>
                    <p class="member-since">Member since: ${memberSince}</p>
                    <button class="btn btn-success" onclick="toggleEditMode()">Edit Profile</button>
                    <button class="btn btn-danger" onclick="handleSignOut()">Sign Out</button>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-box">
                    <h3>${totalRatings}</h3>
                    <p>Total Ratings</p>
                </div>
                <div class="stat-box">
                    <h3>${avgRating}</h3>
                    <p>Average Rating</p>
                </div>
                <div class="stat-box">
                    <h3>${totalReviews}</h3>
                    <p>Reviews Written</p>
                </div>
            </div>
        </div>
        
        <div id="editMode" class="edit-mode">
            <h2 style="margin-bottom: 20px; color: #333;">Edit Profile</h2>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="editUsername">Username</label>
                    <input type="text" 
                           id="editUsername" 
                           name="username" 
                           value="${currentProfile?.username || ''}" 
                           required>
                </div>
                
                <div class="form-group">
                    <label for="editPp">Profile Picture URL</label>
                    <input type="url" 
                           id="editPp" 
                           name="pp" 
                           value="${currentProfile?.pp || ''}">
                </div>
                
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" class="btn btn-secondary" onclick="toggleEditMode()">Cancel</button>
            </form>
        </div>
    `;
    
    // Add event listener for form
    document.getElementById('editProfileForm').addEventListener('submit', handleUpdateProfile);
}

// Render ratings section
function renderRatings() {
    const ratingsSection = document.getElementById('ratingsSection');
    
    if (!currentRatings || currentRatings.length === 0) {
        ratingsSection.innerHTML = `
            <div class="ratings-section">
                <h2>Your Ratings & Reviews</h2>
                <div class="no-ratings">You haven't rated any content yet.</div>
            </div>
        `;
        return;
    }
    
    const ratingsHTML = currentRatings.map(rating => {
        const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        const reviewText = rating.review && rating.review.trim() !== '' 
            ? `<p style="margin-top: 10px; color: #555;">"${escapeHtml(rating.review)}"</p>`
            : '';
        
        const createdDate = new Date(rating.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="rating-item">
                <h3>${escapeHtml(rating.content?.title || 'Unknown')}</h3>
                <div class="rating-meta">
                    <span class="stars">${stars}</span>
                    <span>${escapeHtml(rating.content?.type || 'Unknown')}</span>
                    <span>${escapeHtml(rating.content?.genre || 'Unknown')}</span>
                    <span>${rating.content?.release_year || 'N/A'}</span>
                    <span>${createdDate}</span>
                </div>
                ${reviewText}
            </div>
        `;
    }).join('');
    
    ratingsSection.innerHTML = `
        <div class="ratings-section">
            <h2>Your Ratings & Reviews</h2>
            ${ratingsHTML}
        </div>
    `;
}

// Toggle edit mode
window.toggleEditMode = function() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    viewMode.classList.toggle('hidden');
    editMode.classList.toggle('active');
}

// Handle profile update
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const username = document.getElementById('editUsername').value;
    const pp = document.getElementById('editPp').value;
    
    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Update profile
        await updateUserProfile(currentUser.id, {
            username: username,
            pp: pp || currentProfile.pp
        });
        
        // Reload data
        await loadUserData();
        
        // Show success message
        showSuccess('Profile updated successfully!');
        
        // Close edit mode
        toggleEditMode();
        
    } catch (error) {
        showError('Failed to update profile');
        console.error(error);
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// Handle sign out
window.handleSignOut = async function() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            await signOut();
            window.location.href = 'login.html';
        } catch (error) {
            showError('Failed to sign out');
            console.error(error);
        }
    }
}

// Show success message
function showSuccess(message) {
    showAlert(message, 'success');
}

// Show error message
function showError(message) {
    showAlert(message, 'error');
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);