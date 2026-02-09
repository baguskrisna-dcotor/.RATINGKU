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
                <button class="back-button" onclick="goBack()">
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
                        <h3>Berikan Rating Anda</h3>
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
                        <button class="submit-rating" id="submitRating">Kirim Rating</button>
                        <p class="rating-message" id="ratingMessage"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="js/detail.js"></script>
</body>
</html>