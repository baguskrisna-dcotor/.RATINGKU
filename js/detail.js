const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";

// Ambil data dari URL parameter
const urlParams = new URLSearchParams(window.location.search);
const contentId = urlParams.get('id');

// Load content detail
async function loadContentDetail() {
    if (!contentId) {
        window.location.href = 'explore.php';
        return;
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/content?id=eq.${contentId}&select=*,images(image_url)`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        const data = await response.json();
        
        if (data.length > 0) {
            const content = data[0];
            displayContent(content);
            loadRatings(contentId);
        } else {
            alert('Konten tidak ditemukan');
            window.location.href = 'explore.php`';
        }
    } catch (error) {
        console.error('Error loading content:', error);
        alert('Gagal memuat konten');
    }
}

// Display content
function displayContent(content) {
    const imageUrl = content.images && content.images.length > 0 
        ? content.images[0].image_url 
        : "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";

    // Set hero background
    document.getElementById('heroSection').style.backgroundImage = `url(${imageUrl})`;
    
    // Set poster
    document.getElementById('posterImage').src = imageUrl;
    
    // Set title and description
    document.getElementById('contentTitle').textContent = content.title;
    document.getElementById('contentDescription').textContent = 
        content.description || "Tidak ada deskripsi tersedia.";
    
    // Set type
    document.getElementById('contentType').textContent = content.type || "Unknown";
}

// Load ratings
async function loadRatings(contentId) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/ratings?content_id=eq.${contentId}`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        const ratings = await response.json();
        
        if (ratings.length > 0) {
            const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            document.querySelector('.rating-number').textContent = average.toFixed(1);
            document.getElementById('totalRatings').textContent = `${ratings.length} ratings`;
        }
    } catch (error) {
        console.error('Error loading ratings:', error);
    }
}

// Submit rating
document.getElementById('submitRating').addEventListener('click', async () => {
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    
    if (!selectedRating) {
        showMessage('Pilih rating terlebih dahulu!', 'error');
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ratings`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                content_id: parseInt(contentId),
                rating: parseInt(selectedRating.value)
            })
        });

        if (response.ok) {
            showMessage('Rating berhasil dikirim!', 'success');
            setTimeout(() => {
                loadRatings(contentId);
                // Reset rating
                document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
            }, 1500);
        } else {
            showMessage('Gagal mengirim rating', 'error');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showMessage('Terjadi kesalahan', 'error');
    }
});

function showMessage(message, type) {
    const messageEl = document.getElementById('ratingMessage');
    messageEl.textContent = message;
    messageEl.className = `rating-message ${type}`;
    
    setTimeout(() => {
        messageEl.className = 'rating-message';
    }, 3000);
}

function goBack() {
    window.history.back();
}

// Load content on page load
loadContentDetail();