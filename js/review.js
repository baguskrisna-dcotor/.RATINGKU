// ========================================
// ALL RATINGS - JAVASCRIPT WITH SUPABASE
// ========================================

import { supabase } from './supabase-client.js';

// Global Variables
let allRatings = [];
let allUsers = [];
let filteredRatings = [];
let currentFilter = 'recent';
let currentRatingFilter = 'all';
let searchQuery = '';

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const usersList = document.getElementById('usersList');
const ratingsContainer = document.getElementById('ratingsContainer');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const ratingFilter = document.getElementById('ratingFilter');
const btnRefresh = document.getElementById('btnRefresh');
const userModal = document.getElementById('userModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const toast = document.getElementById('toast');

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        showLoading(true);
        await fetchAllData();
        renderUsers();
        filterAndRenderRatings();
        updateStats();
        showLoading(false);
        showToast('Data loaded successfully!');
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        showToast('Error loading data. Please try again.', 'error');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRenderRatings();
        }, 300);
    });

    sortFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        filterAndRenderRatings();
    });

    ratingFilter.addEventListener('change', (e) => {
        currentRatingFilter = e.target.value;
        filterAndRenderRatings();
    });

    btnRefresh.addEventListener('click', async () => {
        showLoading(true);
        await initializeApp();
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ========================================
// DATA FETCHING FROM SUPABASE
// ========================================

async function fetchAllData() {
    try {
        // ✅ FIXED: join ke content_duplicate, bukan content
        const { data: ratingsData, error: ratingsError } = await supabase
            .from('rating')
            .select(`
                id,
                user_id,
                content_id,
                rating,
                review,
                created_at,
                profiles (
                    username,
                    photo_profiles (url)
                ),
                content_duplicate (title)
            `)
            .order('created_at', { ascending: false });

        if (ratingsError) {
            console.error('Supabase fetch error:', ratingsError);
            throw new Error('Failed to fetch ratings from Supabase');
        }

        allRatings = ratingsData.map(rating => ({
            id: rating.id,
            user_id: rating.user_id,
            user_name: rating.profiles?.username || 'Unknown User',
            user_photo: rating.profiles?.photo_profiles?.url || null,
            content_id: rating.content_id,
            // ✅ FIXED: ambil title dari content_duplicate
            content_title: rating.content_duplicate?.title || 'Unknown Content',
            rating: rating.rating,
            review: rating.review || '',
            created_at: rating.created_at
        }));

        // Group ratings by user
        const usersMap = new Map();
        allRatings.forEach(rating => {
            if (!usersMap.has(rating.user_id)) {
                usersMap.set(rating.user_id, {
                    user_id: rating.user_id,
                    user_name: rating.user_name,
                    user_photo: rating.user_photo,
                    ratings: []
                });
            }
            usersMap.get(rating.user_id).ratings.push(rating);
        });

        allUsers = Array.from(usersMap.values()).map(user => ({
            ...user,
            totalRatings: user.ratings.length,
            avgRating: (user.ratings.reduce((sum, r) => sum + r.rating, 0) / user.ratings.length).toFixed(1)
        }));

        filteredRatings = [...allRatings];

    } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data from database', 'error');
        throw error;
    }
}

// ========================================
// RENDER FUNCTIONS
// ========================================

function renderUsers() {
    usersList.innerHTML = '';
    
    const sortedUsers = [...allUsers].sort((a, b) => b.totalRatings - a.totalRatings);

    sortedUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        
        const avatarHTML = user.user_photo 
            ? `<div class="user-avatar" style="background-image: url('${user.user_photo}'); background-size: cover; background-position: center;"></div>`
            : `<div class="user-avatar"><i class="fas fa-user"></i></div>`;
        
        userCard.innerHTML = `
            ${avatarHTML}
            <div class="user-details">
                <div class="user-name">${escapeHtml(user.user_name)}</div>
                <div class="user-stats-inline">
                    ${user.totalRatings} rating${user.totalRatings > 1 ? 's' : ''}
                    <span class="rating-badge">
                        <i class="fas fa-star"></i>
                        ${user.avgRating}
                    </span>
                </div>
            </div>
        `;

        userCard.addEventListener('click', () => showUserModal(user));
        usersList.appendChild(userCard);
    });

    document.getElementById('userCount').textContent = `${allUsers.length} user${allUsers.length > 1 ? 's' : ''}`;
}

function renderRatings() {
    ratingsContainer.innerHTML = '';

    if (filteredRatings.length === 0) {
        const emptyStateHTML = searchQuery || currentRatingFilter !== 'all'
            ? `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No ratings found</h3>
                    <p>No results match your search or filter criteria</p>
                    <button onclick="clearFilters()" style="
                        margin-top: 16px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `
            : `
                <div class="empty-state">
                    <i class="fas fa-star" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No ratings yet</h3>
                    <p>Be the first to rate some content!</p>
                </div>
            `;
        
        ratingsContainer.innerHTML = emptyStateHTML;
        return;
    }

    filteredRatings.forEach(rating => {
        const ratingCard = document.createElement('div');
        ratingCard.className = 'rating-card';
        
        const avatarHTML = rating.user_photo 
            ? `<div class="rating-avatar" style="background-image: url('${rating.user_photo}'); background-size: cover; background-position: center;"></div>`
            : `<div class="rating-avatar"><i class="fas fa-user"></i></div>`;
        
        ratingCard.innerHTML = `
            <div class="rating-header">
                <div class="rating-user-info" data-user-id="${rating.user_id}">
                    ${avatarHTML}
                    <div class="rating-username">${escapeHtml(rating.user_name)}</div>
                </div>
                <div class="rating-stars">
                    ${generateStars(rating.rating)}
                </div>
            </div>
            <div class="rating-content">
                <div class="rating-content-title">
                    <i class="fas fa-film"></i>
                    ${escapeHtml(rating.content_title)}
                </div>
                ${rating.review ? `<div class="rating-review">${escapeHtml(rating.review)}</div>` : ''}
            </div>
            <div class="rating-footer">
                <div class="rating-date">
                    <i class="far fa-clock"></i>
                    ${formatDate(rating.created_at)}
                </div>
            </div>
        `;

        const userInfo = ratingCard.querySelector('.rating-user-info');
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = allUsers.find(u => u.user_id === rating.user_id);
            if (user) showUserModal(user);
        });

        ratingsContainer.appendChild(ratingCard);
    });
}

// ========================================
// FILTER AND RENDER
// ========================================

function filterAndRenderRatings() {
    filteredRatings = [...allRatings];

    if (searchQuery && searchQuery.length > 0) {
        filteredRatings = filteredRatings.filter(rating => {
            const searchLower = searchQuery.toLowerCase();
            const matchUsername = rating.user_name && rating.user_name.toLowerCase().includes(searchLower);
            const matchContentTitle = rating.content_title && rating.content_title.toLowerCase().includes(searchLower);
            const matchReview = rating.review && rating.review.toLowerCase().includes(searchLower);
            return matchUsername || matchContentTitle || matchReview;
        });
    }

    if (currentRatingFilter !== 'all') {
        const filterValue = parseInt(currentRatingFilter);
        if (!isNaN(filterValue)) {
            filteredRatings = filteredRatings.filter(rating => rating.rating === filterValue);
        }
    }

    switch (currentFilter) {
        case 'recent':
            filteredRatings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredRatings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'highest':
            filteredRatings.sort((a, b) => b.rating !== a.rating ? b.rating - a.rating : new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'lowest':
            filteredRatings.sort((a, b) => a.rating !== b.rating ? a.rating - b.rating : new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'most-active':
            const userRatingsCount = {};
            allRatings.forEach(r => {
                userRatingsCount[r.user_id] = (userRatingsCount[r.user_id] || 0) + 1;
            });
            filteredRatings.sort((a, b) => {
                const countDiff = userRatingsCount[b.user_id] - userRatingsCount[a.user_id];
                return countDiff !== 0 ? countDiff : new Date(b.created_at) - new Date(a.created_at);
            });
            break;
        default:
            filteredRatings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    renderRatings();
    updateFilteredStats();
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showUserModal(user) {
    const modalUserName = document.getElementById('modalUserName');
    const modalUserRatings = document.getElementById('modalUserRatings');
    const modalUserAvgRating = document.getElementById('modalUserAvgRating');
    const userRatingsList = document.getElementById('userRatingsList');

    modalUserName.textContent = user.user_name;
    modalUserRatings.textContent = `${user.totalRatings} rating${user.totalRatings > 1 ? 's' : ''}`;
    modalUserAvgRating.textContent = `${user.avgRating} avg rating`;

    userRatingsList.innerHTML = '';

    const sortedUserRatings = [...user.ratings].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    sortedUserRatings.forEach(rating => {
        const ratingItem = document.createElement('div');
        ratingItem.className = 'user-rating-item';
        ratingItem.innerHTML = `
            <div class="user-rating-header">
                <div class="content-title-modal">${escapeHtml(rating.content_title)}</div>
                <div class="rating-stars">
                    ${generateStars(rating.rating)}
                </div>
            </div>
            ${rating.review ? `<div class="rating-review">${escapeHtml(rating.review)}</div>` : ''}
            <div class="rating-date-modal">
                <i class="far fa-clock"></i> ${formatDate(rating.created_at)}
            </div>
        `;
        userRatingsList.appendChild(ratingItem);
    });

    userModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    userModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// UPDATE STATS
// ========================================

function updateStats() {
    const totalUsers = allUsers.length;
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        : '0.0';

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRatings').textContent = totalRatings;
    document.getElementById('avgRating').textContent = avgRating;
}

function updateFilteredStats() {
    const filteredCount = filteredRatings.length;
    const existingBadge = document.querySelector('.filter-badge');
    if (existingBadge) existingBadge.remove();
    
    if (filteredCount !== allRatings.length && filteredCount > 0) {
        const filterBadge = document.createElement('div');
        filterBadge.className = 'filter-badge';
        filterBadge.style.cssText = `
            padding: 8px 16px;
            background: #f0f0f0;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #666;
        `;
        filterBadge.innerHTML = `
            <i class="fas fa-filter"></i>
            Showing ${filteredCount} of ${allRatings.length} ratings
            ${searchQuery ? `<span style="color: #007bff; margin-left: 8px;">Search: "${escapeHtml(searchQuery)}"</span>` : ''}
            ${currentRatingFilter !== 'all' ? `<span style="color: #007bff; margin-left: 8px;">Rating: ${currentRatingFilter} stars</span>` : ''}
        `;
        ratingsContainer.parentElement.insertBefore(filterBadge, ratingsContainer);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<i class="fas fa-star"></i>'
            : '<i class="far fa-star empty"></i>';
    }
    return stars;
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
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}

function showLoading(show) {
    show ? loadingOverlay.classList.remove('hidden') : loadingOverlay.classList.add('hidden');
}

function showToast(message, type = 'success') {
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

window.clearFilters = function() {
    searchQuery = '';
    currentRatingFilter = 'all';
    currentFilter = 'recent';
    searchInput.value = '';
    sortFilter.value = 'recent';
    ratingFilter.value = 'all';
    filterAndRenderRatings();
    showToast('Filters cleared', 'success');
};

// ========================================
// REALTIME SUBSCRIPTION (OPTIONAL)
// ========================================

function setupRealtimeSubscription() {
    return supabase
        .channel('ratings-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rating' }, (payload) => {
            console.log('Realtime change detected:', payload);
            showToast('New rating detected! Refreshing...');
            initializeApp();
        })
        .subscribe();
}

// Uncomment untuk aktifkan realtime:
// setupRealtimeSubscription();

// ========================================
// ADDITIONAL SUPABASE FUNCTIONS
// ========================================

// ✅ FIXED: fetchUserRatings juga pakai content_duplicate
async function fetchUserRatings(userId) {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select(`
                id,
                user_id,
                content_id,
                rating,
                review,
                created_at,
                profiles (
                    username,
                    photo_profiles (url)
                ),
                content_duplicate (title)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user ratings:', error);
        return [];
    }
}

async function fetchStatistics() {
    try {
        const { count: totalRatings, error: countError } = await supabase
            .from('rating')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        const { data: avgData, error: avgError } = await supabase
            .from('rating')
            .select('rating');

        if (avgError) throw avgError;

        const avgRating = avgData.length > 0
            ? (avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length).toFixed(1)
            : 0;

        const { data: usersData, error: usersError } = await supabase
            .from('rating')
            .select('user_id');

        if (usersError) throw usersError;

        const uniqueUsers = new Set(usersData.map(r => r.user_id)).size;

        return { totalRatings, avgRating, totalUsers: uniqueUsers };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return { totalRatings: 0, avgRating: 0, totalUsers: 0 };
    }
}