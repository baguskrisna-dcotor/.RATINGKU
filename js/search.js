// ========================================
// SEARCH FEATURE - INTEGRATED WITH EXPLORE
// ========================================

const SCRIPT_ID = 'search-feature';
if (window[SCRIPT_ID]) {
    console.warn('⚠️ Search script already loaded');
    throw new Error('Search script already initialized');
}
window[SCRIPT_ID] = true;

// ========================================
// CONSTANTS
// ========================================

const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";
const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";
const API_TMDB_READ = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhODI2ODQ3ZjhiYThmMzY2MWM5ZDhiM2QzYmMwOTQ2OSIsIm5iZiI6MTc3MTExNTI4NC44NTYsInN1YiI6IjY5OTExMzE0M2ZiYWUxNWRmMzJhZTljYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OJvv5g-gxdECtrP_ZZ_9foQipmPPw-1HUn05zIh7pmQ';

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    searchResults: [],
    isLoading: false,
    isInitialized: false,
    currentQuery: '',
    debounceTimer: null
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    clearButton: document.getElementById('clearButton'),
    searchInfo: document.getElementById('searchInfo'),
    loadingSearch: document.getElementById('loadingSearch'),
    searchResults: document.getElementById('searchResults'),
    searchResultsContainer: document.getElementById('searchResultsContainer'),
    allContent: document.getElementById('allContent')
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function normalizeString(str) {
    return str.toLowerCase().trim();
}

function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: #ffd700; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

function limitWords(str, limit) {
    if (!str) return '';
    const words = str.split(' ');
    if (words.length <= limit) return str;
    return words.slice(0, limit).join(' ') + '...';
}

// ========================================
// CARD BUILDER
// ========================================

function makeCard(content, query = '') {
    const img = content.url_path || SEMENTARAIMG;
    const desc = limitWords(content.description ?? "No description yet...", 20);
    const rating = content.avgRating ?? "?";
    const title = query ? highlightText(content.title, query) : escapeHtml(content.title);
    const description = query ? highlightText(desc, query) : escapeHtml(desc);
    const typeBadge = content.type === 'movie' ? '🎬 Movie' : content.type === 'tv' ? '📺 TV' : content.type || '';

    return `<div class="review-card" data-id="${content.id}" style="--image-url: url(${img})">
                <div class="content-card">
                    <div class="darken-card"></div>
                    <h1 class="rating">${rating}/5.0 ★</h1>
                    <p class="deskripsi">${description}</p>
                    <p style="font-size:0.75em; color:#aaa; margin: 4px 0 0 0;">${escapeHtml(typeBadge)}</p>
                    <h2 class="judul">${title}</h2>
                    <div class="open">
                        <button class="button-open" onclick="goToDetail(${content.id}, '${content.type}')">Lihat</button>
                    </div>
                </div>
            </div>`;
}

// ========================================
// FETCH RATINGS DARI DB (BATCH)
// ========================================

async function fetchRatingsForTmdbIds(tmdbIds) {
    if (!tmdbIds || tmdbIds.length === 0) return {};

    try {
        // ✅ 1 request: cari content_duplicate berdasarkan tmdb_id
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content_duplicate?tmdb_id=in.(${tmdbIds.join(',')})&select=id,tmdb_id`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const contentData = await contentRes.json();

        if (!contentData || contentData.length === 0) return {};

        const tmdbToDbId = {};
        contentData.forEach(c => { tmdbToDbId[c.tmdb_id] = c.id; });

        // ✅ 1 request: fetch semua rating sekaligus
        const dbIds = contentData.map(c => c.id).join(',');
        const ratingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/rating?content_id=in.(${dbIds})&select=content_id,rating`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const ratingData = await ratingRes.json();

        // Hitung avg per content_id
        const ratingGroups = {};
        ratingData.forEach(r => {
            if (!ratingGroups[r.content_id]) ratingGroups[r.content_id] = [];
            ratingGroups[r.content_id].push(r.rating);
        });

        // Map tmdb_id -> avgRating
        const tmdbToRating = {};
        Object.entries(tmdbToDbId).forEach(([tmdbId, dbId]) => {
            const ratings = ratingGroups[dbId];
            if (ratings && ratings.length > 0) {
                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                tmdbToRating[tmdbId] = avg.toFixed(1);
            }
        });

        return tmdbToRating;

    } catch (error) {
        console.error('Error fetching ratings:', error);
        return {};
    }
}

// ========================================
// SEARCH VIA TMDB API
// ========================================

async function searchTMDB(query) {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`,
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${API_TMDB_READ}`
                }
            }
        );

        if (!res.ok) throw new Error('TMDB search failed');

        const data = await res.json();

        // ✅ Filter: hanya movie/tv, harus ada poster dan overview
        const results = data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .filter(item => item.poster_path && item.overview && item.overview.trim() !== '');

        if (results.length === 0) return [];

        // Fetch rating dari DB
        const tmdbIds = results.map(r => r.id);
        const ratingMap = await fetchRatingsForTmdbIds(tmdbIds);

        return results.map(item => ({
            id: item.id,
            title: item.title || item.name,
            description: item.overview,
            type: item.media_type,
            url_path: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            avgRating: ratingMap[item.id] || null,
            hasRating: !!ratingMap[item.id]
        }));

    } catch (error) {
        console.error('TMDB search error:', error);
        return [];
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

async function performSearch(query) {
    if (!query || query.length < 2) {
        clearSearch();
        return;
    }

    state.currentQuery = query;
    state.isLoading = true;
    showLoading(true);

    console.log(`🔍 Searching for: "${query}"`);

    try {
        const results = await searchTMDB(query);

        // Sort: yang punya rating dulu, lalu by rating tertinggi
        results.sort((a, b) => {
            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;
            if (a.hasRating && b.hasRating) {
                return parseFloat(b.avgRating) - parseFloat(a.avgRating);
            }
            return 0;
        });

        state.searchResults = results;
        console.log(`📊 Found ${results.length} results`);

        renderSearchResults();
        updateSearchInfo();

    } catch (error) {
        console.error('Search error:', error);
        showError();
    } finally {
        state.isLoading = false;
        showLoading(false);
    }
}

function clearSearch() {
    state.currentQuery = '';
    state.searchResults = [];
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.clearButton) elements.clearButton.style.display = 'none';
    if (elements.searchResults) elements.searchResults.style.display = 'none';
    if (elements.allContent) elements.allContent.style.display = 'block';
    updateSearchInfo();
}

// ========================================
// RENDER FUNCTIONS
// ========================================

function renderSearchResults() {
    if (state.searchResults.length === 0) {
        elements.searchResultsContainer.innerHTML = `
            <div class="no-results">
                <h3>Tidak ada hasil ditemukan</h3>
                <p>Coba kata kunci lain atau periksa ejaan Anda</p>
            </div>
        `;
    } else {
        elements.searchResultsContainer.innerHTML = state.searchResults
            .map(item => makeCard(item, state.currentQuery))
            .join('');
    }

    elements.searchResults.style.display = 'block';
    elements.allContent.style.display = 'none';
    elements.searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// UI FUNCTIONS
// ========================================

function showLoading(show) {
    if (elements.loadingSearch) {
        elements.loadingSearch.style.display = show ? 'block' : 'none';
    }
}

function showError() {
    if (elements.allContent) {
        elements.allContent.innerHTML = `
            <div style="background: rgba(255,255,255,0.9); padding: 50px; border-radius: 15px; text-align: center;">
                <h3 style="color: #ff4757;">Gagal memuat konten</h3>
                <p style="color: #666;">Silakan refresh halaman atau coba lagi nanti.</p>
            </div>
        `;
    }
}

function updateSearchInfo() {
    if (!elements.searchInfo) return;
    if (!state.currentQuery) {
        elements.searchInfo.textContent = 'Cari film, series, atau anime...';
        elements.searchInfo.classList.remove('active');
    } else {
        elements.searchInfo.textContent = `Ditemukan ${state.searchResults.length} hasil untuk "${state.currentQuery}"`;
        elements.searchInfo.classList.add('active');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            if (elements.clearButton) {
                elements.clearButton.style.display = value ? 'block' : 'none';
            }

            // ✅ Debounce 500ms
            clearTimeout(state.debounceTimer);

            if (value.length === 0) {
                clearSearch();
                return;
            }

            if (value.length >= 2) {
                state.debounceTimer = setTimeout(() => {
                    performSearch(value);
                }, 500);
            }
        });

        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                clearTimeout(state.debounceTimer);
                if (value.length >= 2) performSearch(value);
            }
        });
    }

    if (elements.searchButton) {
        elements.searchButton.addEventListener('click', () => {
            const value = elements.searchInput?.value.trim();
            clearTimeout(state.debounceTimer);
            if (value && value.length >= 2) performSearch(value);
        });
    }

    if (elements.clearButton) {
        elements.clearButton.addEventListener('click', () => {
            clearSearch();
            elements.searchInput?.focus();
        });
    }

    console.log('✅ Event listeners setup complete');
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

import { supabase } from './supabase-client.js';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.goToDetail = async function(contentId, type = 'movie') {
    try {
        // Cek apakah konten sudah ada di content_duplicate
        const { data, error } = await supabase
            .from('content_duplicate')
            .select('*')
            .eq('tmdb_id', contentId);

        if (data && data.length > 0) {
            // Sudah ada, langsung redirect
            await delay(300);
            window.location.href = `detail.html?id=${contentId}`;
            return;
        }

        // Belum ada, fetch dari TMDB lalu insert
        try {
            let dataContent, dataTitle, year;

            if (type.toLowerCase() === 'movie') {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${contentId}?api_key=a826847f8ba8f3661c9d8b3d3bc09469&language=en-US`
                );
                dataContent = await res.json();
                dataTitle = dataContent.title;
                year = dataContent.release_date;
            } else if (type.toLowerCase() === 'tv') {
                const res = await fetch(
                    `https://api.themoviedb.org/3/tv/${contentId}?api_key=a826847f8ba8f3661c9d8b3d3bc09469&language=en-US`
                );
                dataContent = await res.json();
                dataTitle = dataContent.name;
                year = dataContent.first_air_date;
            } else {
                // Tipe tidak dikenal, langsung redirect
                window.location.href = `detail.html?id=${contentId}`;
                return;
            }

            const urlIMG = 'https://image.tmdb.org/t/p/w500' + dataContent.poster_path;
            const urlBackdrop = dataContent.backdrop_path
                ? 'https://image.tmdb.org/t/p/original' + dataContent.backdrop_path
                : urlIMG;

            const dataToInsert = {
                tmdb_id: dataContent.id,
                title: dataTitle,
                description: dataContent.overview,
                release_year: year ? year.split('-')[0] : null,
                url_path: urlIMG,
                url_backdrop_path: urlBackdrop,
                type: type,
            };

            const { error: insertError } = await supabase
                .from('content_duplicate')
                .insert([dataToInsert]);

            if (insertError) {
                console.error('Gagal insert:', insertError);
                // Tetap redirect meskipun insert gagal
            }

        } catch (fetchError) {
            console.error('Gagal fetch dari TMDB:', fetchError);
        }

        await delay(300);
        window.location.href = `detail.html?id=${contentId}`;

    } catch (error) {
        console.error('goToDetail error:', error);
        window.location.href = `detail.html?id=${contentId}`;
    }
};

// ========================================
// INITIALIZATION
// ========================================

async function initialize() {
    if (state.isInitialized) {
        console.warn('⚠️ Already initialized');
        return;
    }

    console.log('🚀 Initializing search feature...');
    state.isInitialized = true;

    setupEventListeners();
    updateSearchInfo();

    // ✅ Cek URL query parameter langsung search via TMDB
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');

    if (queryParam) {
        if (elements.searchInput) elements.searchInput.value = queryParam;
        if (elements.clearButton) elements.clearButton.style.display = 'block';
        await performSearch(queryParam);
    }

    console.log('✅ Search feature ready!');
}

// ========================================
// START
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

// ========================================
// DEBUG
// ========================================

window.debugSearch = function() {
    console.log('=== SEARCH DEBUG INFO ===');
    console.log('Search results:', state.searchResults.length);
    console.log('Current query:', state.currentQuery);
    console.log('Is loading:', state.isLoading);
};