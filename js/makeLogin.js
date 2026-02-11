// ========================================
// LOGIN & REGISTER MODAL SYSTEM
// ========================================
import { supabase } from './supabase-client.js';
import msgBox from './component/alert.js';

const loginModal = `
<link rel="stylesheet" href="modalLogin.css">

<div id="loginModal" class="modal">
  <div class="modal-content">
    <span class="close-login">&times;</span>
    <h2>Login</h2>
    <button id="loginGoogle" class="google-btn">
      <img src="img/google.png" alt="Google Logo" style="width:20px; height:20px; vertical-align:middle; margin-right:8px;">
      Login dengan Google
    </button>
  </div>
</div>
`;

// ========================================
// INJECT MODALS KE BODY
// ========================================

function initModals() {
    const body = document.querySelector("body");
    
    // Inject modal ke body
    body.insertAdjacentHTML("beforeend", loginModal);
    
    // Setup event listeners
    setupModalEvents();
}

// ========================================
// CHECK AUTH STATE
// ========================================

async function checkAuthState() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // User is logged in
            await loadUserProfile(session.user.id);
            updateUIForLoggedInUser(session.user);
        } else {
            // User is not logged in
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
        updateUIForLoggedOutUser();
    }
}

// Load user profile from profiles table
async function loadUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, pp')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error loading profile:', error);
            return;
        }
        
        if (data) {
            if (data.username) {
                localStorage.setItem('username', data.username);
            }
            if (data.pp) {
                localStorage.setItem('userPP', data.pp);
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector(".login");
    if (!loginBtn) {
        console.warn('Login button not found');
        return;
    }

    // Ambil username untuk fallback
    const username = localStorage.getItem('username') ||
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    'User';

    // Ambil PP dari localStorage atau gunakan default
    const userPP = localStorage.getItem('userPP') || 
                   user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=4f46e5&color=fff&size=128`;

    // Ganti button text dengan image PP
    loginBtn.innerHTML = `<img src="${userPP}" alt="Profile" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #fff;">`;
    loginBtn.style.cursor = 'pointer';
    loginBtn.style.padding = '0';
    loginBtn.style.background = 'transparent';
    loginBtn.style.border = 'none';
    
    // Remove old event listener dan tambah yang baru
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    
    newLoginBtn.onclick = function(e) {
        e.preventDefault();
        // Langsung panggil logout dengan konfirmasi
        showLogoutMenu();
    };
}

// Update UI untuk user yang belum login
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector(".login");
    if (!loginBtn) {
        console.warn('Login button not found');
        return;
    }
    
    loginBtn.textContent = "Login";
    loginBtn.style.cursor = 'pointer';
    
    // Remove old event listener
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    
    newLoginBtn.onclick = async function(e) {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const loginModalEl = document.getElementById("loginModal");
            if (loginModalEl) {
                loginModalEl.style.display = "flex";
            }
        }
    };
}

// Show logout menu
function showLogoutMenu() {
    if (confirm('Apakah Anda ingin logout?')) {
        handleLogout();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupModalEvents() {
    // Get modal elements
    const loginModalEl = document.getElementById("loginModal");
    
    // Get buttons
    const closeLoginBtn = document.querySelector(".close-login");
    const googleLoginBtn = document.getElementById("loginGoogle");
    
    // ===== CLOSE MODALS =====
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener("click", () => {
            loginModalEl.style.display = "none";
        });
    }
    
    // Close when clicking outside modal
    window.addEventListener("click", (e) => {
        if (e.target === loginModalEl) {
            loginModalEl.style.display = "none";
        }
    });
    
    // ===== GOOGLE LOGIN =====
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", handleGoogleLogin);
    }
}

// ========================================
// GOOGLE LOGIN HANDLER
// ========================================

async function handleGoogleLogin() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
        
        // Gunakan msgBox yang sudah diimport
        if (typeof msgBox !== 'undefined') {
            msgBox.info('Mengalihkan ke Google...');
        }
        
    } catch (error) {
        // Gunakan msgBox yang sudah diimport
        if (typeof msgBox !== 'undefined') {
            msgBox.error('Gagal login dengan Google.');
        }
        console.error('Google login error:', error);
    }
}

// ========================================
// ENSURE USER PROFILE
// ========================================

async function ensureUserProfile(user) {
    try {
        const { data, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = row not found, yang berarti kita perlu insert
            console.error('Error checking profile:', selectError);
            return;
        }

        if (!data) {
            const username = user.user_metadata?.full_name || 
                            user.user_metadata?.name || 
                            user.email?.split('@')[0] || 
                            'User';
            
            const pp = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      null;
            
            const { error: insertError } = await supabase.from('profiles').insert([
                {
                    id: user.id,
                    username: username,
                    pp: pp
                }
            ]);

            if (insertError) {
                console.error('Error inserting profile:', insertError);
            }
        }
    } catch (error) {
        console.error('Error ensuring user profile:', error);
    }
}

// ========================================
// LOGOUT HANDLER
// ========================================

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (!error) {
            // Clear localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('userPP');
            
            // Gunakan msgBox yang sudah diimport
            if (typeof msgBox !== 'undefined') {
                msgBox.success('Berhasil logout.');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw error;
        }
    } catch (error) {
        console.error('Logout error:', error);
        
        // Gunakan msgBox yang sudah diimport
        if (typeof msgBox !== 'undefined') {
            msgBox.error('Gagal logout. Silakan coba lagi.');
        }
    }
}

// ========================================
// INITIALIZE
// ========================================

// Flag untuk tracking apakah ini initial load atau bukan
let isInitialLoad = true;

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize modals first
    initModals();
    
    // Then check auth state
    await checkAuthState();
    
    // Set flag setelah initial load selesai
    setTimeout(() => {
        isInitialLoad = false;
    }, 1000);
    
    // Listen untuk perubahan auth state
    supabase.auth.onAuthStateChange(async (event, session) => {
        
        if (event === 'SIGNED_IN' && session) {
            // Hanya tampilkan pesan sukses jika bukan initial load
            // (artinya ini adalah login yang baru saja terjadi)
            if (!isInitialLoad && typeof msgBox !== 'undefined') {
                msgBox.success('Login berhasil!');
            }
            
            await ensureUserProfile(session.user);
            await loadUserProfile(session.user.id);
            updateUIForLoggedInUser(session.user);
        } else if (event === 'SIGNED_OUT') {
            updateUIForLoggedOutUser();
        }
    });
});

// Export functions if needed
export { checkAuthState, updateUIForLoggedInUser, updateUIForLoggedOutUser };