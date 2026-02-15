// ========================================
// QUICK SEARCH - EXPLORE PAGE
// ========================================

const QUICK_SEARCH_SCRIPT_ID = 'quick-search-explore';
if (window[QUICK_SEARCH_SCRIPT_ID]) {
    console.warn('⚠️ Quick search already loaded');
} else {
    window[QUICK_SEARCH_SCRIPT_ID] = true;

    // ========================================
    // CONSTANTS
    // ========================================

    const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";
    const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";
    const API_TMDB_READ = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhODI2ODQ3ZjhiYThmMzY2MWM5ZDhiM2QzYmMwOTQ2OSIsIm5iZiI6MTc3MTExNTI4NC44NTYsInN1YiI6IjY5OTExMzE0M2ZiYWUxNWRmMzJhZTljYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OJvv5g-gxdECtrP_ZZ_9foQipmPPw-1HUn05zIh7pmQ';

    // ========================================
    // STATE
    // ========================================

    const quickSearchState = {
        isLoading: false,
        debounceTimer: null,
        lastQuery: ''
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================

    const quickSearchInput = document.getElementById('quickSearchInput');
    const quickSearchResults = document.getElementById('quickSearchResults');

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function highlightText(text, query) {
        if (!query) return escapeHtml(text);
        const escapedText = escapeHtml(text);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return escapedText.replace(regex, '<span class="search-highlight-text">$1</span>');
    }

    function limitWords(str, limit) {
        if (!str) return '';
        const words = str.split(' ');
        if (words.length <= limit) return str;
        return words.slice(0, limit).join(' ') + '...';
    }

    // ========================================
    // FETCH RATINGS DARI DB (BATCH)
    // ========================================

    async function fetchRatingsForTmdbIds(tmdbIds) {
        if (!tmdbIds || tmdbIds.length === 0) return {};

        try {
            // Cari content_duplicate yang tmdb_id-nya cocok (1 request)
            const contentRes = await fetch(
                `${SUPABASE_URL}/rest/v1/content_duplicate?tmdb_id=in.(${tmdbIds.join(',')})&select=id,tmdb_id`,
                { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
            );
            const contentData = await contentRes.json();

            if (!contentData || contentData.length === 0) return {};

            // Map tmdb_id -> db id
            const tmdbToDbId = {};
            contentData.forEach(c => { tmdbToDbId[c.tmdb_id] = c.id; });

            // Fetch semua rating sekaligus (1 request)
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
            // Search multi (movie + tv sekaligus)
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

            // Filter hanya movie dan tv, skip person
            // Filter hanya movie dan tv, skip person
            const results = data.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                // ✅ Tambah ini — skip item yang tidak punya poster atau overview
                .filter(item => item.poster_path && item.overview && item.overview.trim() !== '')
                .slice(0, 5);

            if (results.length === 0) return [];

            // Fetch rating dari DB untuk hasil TMDB
            const tmdbIds = results.map(r => r.id);
            const ratingMap = await fetchRatingsForTmdbIds(tmdbIds);

            // Format hasil
            return results.map(item => ({
                id: item.id,
                title: item.title || item.name,
                description: item.overview,
                type: item.media_type,
                url_path: item.poster_path
                    ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                    : SEMENTARAIMG,
                avgRating: ratingMap[item.id] || null
            }));

        } catch (error) {
            console.error('TMDB search error:', error);
            return [];
        }
    }

    // ========================================
    // RENDER RESULTS
    // ========================================

    function renderQuickResults(results, query) {
        if (results.length === 0) {
            quickSearchResults.innerHTML = `
                <div class="quick-no-results">
                    <h4>Tidak ada hasil untuk "${escapeHtml(query)}"</h4>
                    <p>Coba kata kunci lain</p>
                </div>
            `;
        } else {
            const resultsHtml = results.map(item => {
                const rating = item.avgRating ?? "?";
                const title = highlightText(item.title, query);
                const desc = highlightText(limitWords(item.description, 12) || 'No description', query);
                const typeBadge = item.type === 'movie' ? '🎬 Movie' : '📺 TV';

                return `
                    <div class="quick-result-item" onclick="goToDetail(${item.id}, '${item.type}')">
                        <img 
                            src="${item.url_path}" 
                            alt="${escapeHtml(item.title)}" 
                            class="quick-result-img"
                            onerror="this.src='${SEMENTARAIMG}'"
                        >
                        <div class="quick-result-info">
                            <div class="quick-result-title">${title}</div>
                            <div class="quick-result-type">${typeBadge}</div>
                            <div class="quick-result-desc">${desc}</div>
                        </div>
                        <div class="quick-result-rating">${rating}/5.0 ★</div>
                    </div>
                `;
            }).join('');

            quickSearchResults.innerHTML = resultsHtml;
        }

        quickSearchResults.style.display = 'block';
    }

    function showQuickLoading() {
        quickSearchResults.innerHTML = `
            <div class="quick-search-loading">
                <div class="quick-search-spinner"></div>
                <p>Mencari...</p>
            </div>
        `;
        quickSearchResults.style.display = 'block';
    }

    function hideResults() {
        quickSearchResults.style.display = 'none';
        quickSearchResults.innerHTML = '';
    }

    // ========================================
    // MAIN SEARCH WITH DEBOUNCE
    // ========================================

    async function performQuickSearch(query) {
        if (!query || query.length < 2) {
            hideResults();
            return;
        }

        // Jangan re-search kalau query sama
        if (query === quickSearchState.lastQuery && quickSearchState.isFetched) return;

        quickSearchState.lastQuery = query;
        quickSearchState.isLoading = true;

        showQuickLoading();

        try {
            const results = await searchTMDB(query);
            renderQuickResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            quickSearchResults.innerHTML = `<div class="quick-no-results"><p>Terjadi kesalahan, coba lagi.</p></div>`;
            quickSearchResults.style.display = 'block';
        } finally {
            quickSearchState.isLoading = false;
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    if (quickSearchInput) {
        quickSearchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            // ✅ Clear debounce timer setiap ketikan
            clearTimeout(quickSearchState.debounceTimer);

            if (value.length < 2) {
                hideResults();
                return;
            }

            // ✅ Debounce 500ms — request baru hanya dikirim setelah user berhenti mengetik
            quickSearchState.debounceTimer = setTimeout(() => {
                performQuickSearch(value);
            }, 500);
        });

        quickSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                clearTimeout(quickSearchState.debounceTimer);
                if (value.length >= 2) performQuickSearch(value);
            }
        });

        // Tutup hasil saat klik di luar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-header')) {
                hideResults();
            }
        });

        // Tampilkan lagi saat fokus kalau ada query
        quickSearchInput.addEventListener('focus', () => {
            const value = quickSearchInput.value.trim();
            if (value.length >= 2 && quickSearchState.lastQuery === value) {
                quickSearchResults.style.display = 'block';
            }
        });
    }

    // ========================================
    // GLOBAL FUNCTION
    // ========================================

    window.goToDetail = function(contentId, category = 'movie') {
        window.location.href = `detail.html?id=${contentId}&type=${category}`;
    };

    console.log('✅ Quick search initialized');
}