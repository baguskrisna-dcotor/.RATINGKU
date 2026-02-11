<!DOCTYPE html>
<html class="no-copy">

<head>
    <title>Ratingku</title>
    <link rel="stylesheet" href="css/universal.css">
    <link rel="stylesheet" href="css/styleIndex.css">
    <link rel="stylesheet" href="css/homepage_section.css">
    <link rel="stylesheet" href="css/nav.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/modalLogin.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Custom CSS -->


</head>

<body>

    <div class="rotate-warning">
        Putar perangkat anda untuk melanjutkan
        <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2k5azR4ZHVoaDQ2emJ4Y3JqanRkZHZic2lucGwyc2FxdDl2bW9taCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1DtYcLp3GDlY2RsVXd/giphy.gif"
            alt="" width="250px" height="250px">
    </div>
    <div>
        <nav class="mainnavbar">
            <div class="logo">
                <img src="img/logog3.png" width="20px" height="20px">
                <h1 class="title shine-effect">RATINGKU</h1>
            </div>
            <ul>
                <li><a href="#hero-section">Profile</a></li>
                <li><a href="myReview.php">Your Review</a></li>
                <li class=" kategori"><a href="">Categories</a></li>
                <li><a href="search.php">Search</a></li>
                <button class="login"> Login </button>
                <script type="module" src="js/supabase-client.js"></script>
                <script type="module" src="js/makeLogin.js"></script>
                <button class="premium">Premium
                    <img src="img/crown.png" width="15px" height="15px">
                </button>
            </ul>
        </nav>
        <div class="container">
            <div class="sidebars">
                <aside class="sidebar">
                    <div class="left">
                        <img src="img/menu.png" alt="Profile Picture" class="main-image">
                        <img src="img/right-arrow.png" alt="" class="hover-img">
                        <button class="setting"><i class="home"></i>
                            <img src="img/setting.png">
                        </button>
                        <button class="home"><i class="home"></i>
                            <img src="img/crown.png">
                        </button>
                    </div>
                    <div class="right">
                        <div class="button-container">
                            <h3>Categories</h3>
                            <nav class="button-row-1">
                                <button class="category-1">
                                    <i class="dashboard"></i>
                                    <span> Film</span>
                                </button>
                                <button class="category-2">
                                    <i class="dashboard"></i>
                                    <span> Animation</span>
                                </button>
                                <button class="category-3">
                                    <i class="dashboard"></i>
                                    <span> Music</span>
                                </button>
                                <button class="category-4">
                                    <i class="dashboard"></i>
                                    <span> Game</span>
                                </button>
                            </nav>
                            <nav class="button-row-2">
                                <button class="category-5">
                                    <i class="dashboard"></i>
                                    <span> Comic</span>
                                </button>
                                <button class="category-6">
                                    <i class="dashboard"></i>
                                    <span> Novel</span>
                                </button>
                                <button class="category-7">
                                    <i class="dashboard"></i>
                                    <span> TV Series</span>
                                </button>
                                <button class="category-8">
                                    <i class="dashboard"></i>
                                    <span> Minecraft ARG</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </aside>
            </div>
            <!--              
             <div class="background-slider no-copy" id="backgroundSlider"></div>
             <script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> -->

            <script src="js/imageslider.js" defer></script>


            <section class="content-container" id="hero-section">
                <div class="content-container-child">

                    <!-- TEXT -->
                    <div class="content">
                        <div class="textcontent">
                            <h1 class="title">RATINGKU</h1>
                            <p class="sub-title">
                                Temukan film & anime terbaik berdasarkan rating komunitas
                            </p>

                            <div class="create-review-button" onclick="location.href='explore.php'">
                                <span>Explore</span>
                                <img src="img/right-arrow.png" width="10">
                            </div>
                        </div>
                    </div>

                    <!-- IMAGE SLIDER -->
                    <div class="horizontal-slider">
                        <div class="slider-track">
                            <img src="img/slide1.jpg">
                            <img src="img/slide2.jpg">
                            <img src="img/slide3.jpg">
                            <img src="img/slide4.jpg">
                            <img src="img/slide5.jpg">

                            <!-- duplikat untuk loop halus -->
                            <img src="img/slide1.jpg">
                            <img src="img/slide2.jpg">
                            <img src="img/slide3.jpg">
                        </div>
                    </div>

                </div>
                <div class="section-move">
                    <button class="web-information" onclick="location.href='#info-slider'" id="button-section-info">
                        <img class="web-information-image" src="img/star.png" width="15px" height="15px">
                        <span class="span-web-information">Web Information</span>
                    </button>
                    <button class="best-film" onclick="location.href='#section-film'" id="button-section-film">
                        <img class="best-film-image" src="img/star.png" width="15px" height="15px">
                        <span class="-span-best-film">Best Film</span>
                    </button>
                    <button class="best-anime shine-effect" style="--duration: 0.2"
                        onclick="location.href='#section-anime'" id="button-section-anime">
                        <img class="best-anime-image" src="img/star.png" width="15px" height="15px">
                        <span class="-span-best-anime">Best Anime</span>
                    </button>
                </div>

        </div>


        </section>

    </div>


    <div class="container-music-slider">
        <link rel="stylesheet" href="css/homepage_section.css">

        <div class="running-text">
            <div class="text-list"></div>
        </div>
    </div>


    </div>


    <section class="info-slider" id="info-slider">
        <h2>Informasi Website</h2>

        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <div class="slider-container">
            <!-- Floating Particles -->
            <div class="particles">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
            </div>

            <div class="slider-info" id="infoSlider">
                <!-- Slides akan di-clone oleh JavaScript -->
                <div class="slide" data-index="0">
                    <div class="slide-icon">🎯</div>
                    <h3>Tujuan</h3>
                    <p>
                        Website ini dibuat untuk menjadi platform rating dan ulasan
                        film, animasi, komik, dan game agar pengguna dapat menemukan
                        konten terbaik dengan mudah.
                    </p>
                </div>

                <div class="slide" data-index="1">
                    <div class="slide-icon">🌟</div>
                    <h3>Manfaat</h3>
                    <p>
                        Membantu pengguna memilih tontonan atau bacaan berkualitas,
                        berbagi opini, serta membangun komunitas pecinta hiburan.
                    </p>
                </div>

                <div class="slide" data-index="2">
                    <div class="slide-icon">🙏</div>
                    <h3>Ucapan Terima Kasih</h3>
                    <p>
                        Terima kasih kepada seluruh pengguna yang telah memberikan
                        rating, ulasan, dan dukungan untuk pengembangan website ini.
                    </p>
                </div>

                <div class="slide" data-index="3">
                    <div class="slide-icon">💬</div>
                    <h3>Testimoni</h3>
                    <p>
                        "Website ini sangat membantu saya menemukan film bagus!
                        Tampilannya modern dan mudah digunakan."
                    </p>
                </div>
            </div>
        </div>

        <!-- Dots Indicator -->
        <div class="dots-container" id="dotsContainer"></div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
            <button class="nav-btn prev-btn" id="prevBtn">❮</button>
            <button class="nav-btn next-btn" id="nextBtn">❯</button>
        </div>
    </section>

    <div class="section-container">
        <section class="best-movies-sec" id="section-film">
            <h2>🎬 Film Terbaik 2026</h2>
            <h3>Deretan Film terbaik tahun ini yang disarankan untukmu dan disiap diberi rating</h3>
            <div class="movie-slider" id="movieSlider">
                <div class="slider-track" id="sliderTrack"></div>
            </div>
        </section>

        <section class="best-anime-sec" id="section-anime">
            <h2>🎬 Anime Terbaik 2026</h2>
            <h3>Deretan Anime terbaik tahun ini yang disarankan untukmu dan disiap diberi rating</h3>
            <div class="anime-slider" id="animeSlider">
                <div class="anime-slider-track" id="animesliderTrack"></div>

            </div>
        </section>
    </div>
    <script src="js/homepage-section.js"></script>
    <script defer src="js/homePage.js"></script>






    <!-- ===== FOOTER TEMPLATE ===== -->
    <footer>
        <div class="footer-container">

            <!-- Main Footer Content -->
            <div class="footer-main">

                <!-- Brand & Contact Section -->
                <div class="footer-brand">
                    <div class="footer-logo">
                        <div class="logo-icon">🚀</div>
                        <span class="logo-text">NamaBrand</span>
                    </div>
                    <p class="footer-description">
                        Deskripsi singkat tentang perusahaan atau website Anda. Jelaskan value proposition dan apa yang
                        membuat Anda berbeda dari kompetitor.
                    </p>
                    <div class="footer-contact">
                        <div class="footer-contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Jl. Contoh No. 123, Jakarta, Indonesia</span>
                        </div>
                        <div class="footer-contact-item">
                            <i class="fas fa-phone"></i>
                            <span>+62 812-3456-7890</span>
                        </div>
                        <div class="footer-contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>info@namabrand.com</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Links Column -->
                <div class="footer-column">
                    <h3 class="footer-title">Tautan Cepat</h3>
                    <ul class="footer-links">
                        <li><a href="#tentang">Tentang Kami</a></li>
                        <li><a href="#layanan">Layanan</a></li>
                        <li><a href="#portfolio">Portfolio</a></li>
                        <li><a href="#tim">Tim Kami</a></li>
                        <li><a href="#karir">Karir</a></li>
                    </ul>
                </div>

                <!-- Resources Column -->
                <div class="footer-column">
                    <h3 class="footer-title">Sumber Daya</h3>
                    <ul class="footer-links">
                        <li><a href="#blog">Blog</a></li>
                        <li><a href="#bantuan">Pusat Bantuan</a></li>
                        <li><a href="#dokumentasi">Dokumentasi</a></li>
                        <li><a href="#faq">FAQ</a></li>
                        <li><a href="#kontak">Hubungi Kami</a></li>
                    </ul>
                </div>

                <!-- Social Media Column -->
                <div class="footer-column">
                    <h3 class="footer-title">Ikuti Kami</h3>
                    <div class="social-links">
                        <!-- TEMPLATE: Ganti # dengan link sosial media Anda -->
                        <a href="#" class="social-link" aria-label="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="LinkedIn">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="YouTube">
                            <i class="fab fa-youtube"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Footer Bottom -->
            <div class="footer-bottom">
                <p class="footer-copyright">
                    © 2024 <strong>NamaBrand</strong>. All rights reserved.
                </p>
                <div class="footer-bottom-links">
                    <a href="#privasi">Kebijakan Privasi</a>
                    <a href="#syarat">Syarat & Ketentuan</a>
                    <a href="#cookies">Cookies</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Back to Top Button -->
    <div class="back-to-top" id="backToTop">
        <i class="fas fa-arrow-up"></i>
    </div>

    <!-- Custom JavaScript -->
    <script src="js/footer.js"></script>

    <script src="js/makeLogin.js"></script>

</body>

</html>