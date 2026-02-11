<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Konten</title>
    <link rel="stylesheet" href="css/detail.css">
</head>
<body>
    <div class="detail-container">
        <!-- Hero Section dengan Background Image -->
        <div class="hero-section" id="heroSection">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <button class="back-button" onclick="location.href='explore.php'">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Kembali
                </button>
            </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
            <div class="content-wrapper">
                <!-- Poster Image -->
                <div class="poster-container">
                    <img id="posterImage" src="" alt="Poster">
                    <div class="rating-badge" id="averageRating">
                        <span class="rating-number">0.0</span>
                        <span class="rating-star">★</span>
                    </div>
                </div>

                <!-- Info Section -->
                <div class="info-section">
                    <h1 class="title" id="contentTitle">Loading...</h1>
                    
                    <div class="meta-info">
                        <span class="meta-item" id="contentType">-</span>
                        <span class="meta-divider">•</span>
                        <span class="meta-item" id="totalRatings">0 ratings</span>
                    </div>

                    <div class="description">
                        <h3>Sinopsis</h3>
                        <p id="contentDescription">Loading description...</p>
                    </div>

                    <!-- Rating Section -->
                    <div class="rating-section">
                        <h3>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Berikan Rating Anda
                        </h3>
                        
                        <!-- User Info Display -->
                        <div class="user-rating-info">
                            <div class="user-avatar" id="userAvatar">?</div>
                            <div class="user-details">
                                <span class="user-name" id="userName">Loading...</span>
                                <span class="user-hint" id="userHint">Berikan penilaian Anda</span>
                            </div>
                        </div>

                        <!-- Star Rating -->
                        <div class="star-rating">
                            <input type="radio" name="rating" id="star5" value="5">
                            <label for="star5">★</label>
                            <input type="radio" name="rating" id="star4" value="4">
                            <label for="star4">★</label>
                            <input type="radio" name="rating" id="star3" value="3">
                            <label for="star3">★</label>
                            <input type="radio" name="rating" id="star2" value="2">
                            <label for="star2">★</label>
                            <input type="radio" name="rating" id="star1" value="1">
                            <label for="star1">★</label>
                        </div>

                        <!-- Review Text (Optional) -->
                        <div class="review-input-section" id="reviewInputSection" style="display: none;">
                            <label for="userReview">Review Anda (Opsional)</label>
                            <textarea id="userReview" rows="4" maxlength="500" placeholder="Bagikan pendapat Anda tentang konten ini... (opsional)"></textarea>
                            <div class="character-count">
                                <span id="charCount">0</span>/500 karakter
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="rating-actions">
                            <button class="submit-rating" id="submitRating">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Kirim Rating
                            </button>
                            <button class="cancel-rating" id="cancelRating" style="display: none;">Batal</button>
                        </div>
                        
                        <p class="rating-message" id="ratingMessage"></p>
                    </div>

                    <!-- Reviews List -->
                    <div class="reviews-list-section">
                        <div class="reviews-header">
                            <h3>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Review Pengguna
                            </h3>
                            <span class="review-count" id="reviewCount">0 review</span>
                        </div>
                        
                        <div id="reviewsList" class="reviews-list">
                            <div class="loading-reviews">
                                <div class="spinner"></div>
                                <p>Memuat review...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Review Modal -->
    <div id="editReviewModal" class="modal">
        <div class="modal-content edit-modal">
            <span class="close-edit">&times;</span>
            <h2>Edit Rating & Review</h2>
            
            <div class="edit-rating-section">
                <label>Rating:</label>
                <div class="star-rating edit-star-rating">
                    <input type="radio" name="editRating" id="editStar5" value="5">
                    <label for="editStar5">★</label>
                    <input type="radio" name="editRating" id="editStar4" value="4">
                    <label for="editStar4">★</label>
                    <input type="radio" name="editRating" id="editStar3" value="3">
                    <label for="editStar3">★</label>
                    <input type="radio" name="editRating" id="editStar2" value="2">
                    <label for="editStar2">★</label>
                    <input type="radio" name="editRating" id="editStar1" value="1">
                    <label for="editStar1">★</label>
                </div>
            </div>

            <div class="edit-review-section">
                <label for="editReviewText">Review (Opsional):</label>
                <textarea id="editReviewText" rows="4" maxlength="500" placeholder="Bagikan pendapat Anda..."></textarea>
                <div class="character-count">
                    <span id="editCharCount">0</span>/500 karakter
                </div>
            </div>

            <div class="edit-actions">
                <button class="btn-save" id="saveEditRating">Simpan</button>
                <button class="btn-cancel" id="cancelEdit">Batal</button>
            </div>
            
            <p class="edit-message" id="editMessage"></p>
        </div>
    </div>

    <script type="module" src="js/detail.js"></script>
</body>
</html>