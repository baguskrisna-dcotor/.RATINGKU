// ========================================
// LOGIN & REGISTER MODAL SYSTEM
// ========================================
import { supabase } from './supabase-client.js';

const loginModal = `
<!-- Login Modal -->
<div id="loginModal" class="modal">
  <div class="modal-content">
    <span class="close-login">&times;</span>
    <h2>Login</h2>
    <input type="email" id="loginEmail" placeholder="Email">
    <input type="password" id="loginPassword" placeholder="Password">
    <button id="submitLogin">Masuk</button>
    <button id="loginGoogle" class="google-btn">
    <img src="img/google.png" alt="Google Logo" style="width:20px; height:20px; vertical-align:middle; margin-right:8px;">
    Login dengan Google
    </button>
    <p id="loginError" class="error-message"></p>
    <p class="modal-footer">
      Belum punya akun? <a href="#" id="switchToRegister">Daftar di sini</a>
    </p>
  </div>
</div>
`;

const registerModal = `
<!-- Register Modal -->
<div id="registerModal" class="modal">
  <div class="modal-content">
    <span class="close-register">&times;</span>
    <h2>Register</h2>
    <input type="text" id="username" placeholder="Username">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    <input type="password" id="confirmPassword" placeholder="Confirm Password">
    <button id="submitRegister">Daftar</button>
    <p id="registerError" class="error-message"></p>
    <p class="modal-footer">
      Sudah punya akun? <a href="#" id="switchToLogin">Login di sini</a>
    </p>
  </div>
</div>
`;

// ========================================
// INJECT MODALS KE BODY
// ========================================

function initModals() {
    const body = document.querySelector("body");
    
    // Inject kedua modal ke body
    body.insertAdjacentHTML("beforeend", loginModal);
    body.insertAdjacentHTML("beforeend", registerModal);
    
    // Setup event listeners
    setupModalEvents();
    
    // Check if user is already logged in
    checkAuthState();
}

// ========================================
// CHECK AUTH STATE
// ========================================

async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // User is logged in
        await loadUserProfile(session.user.id);
        updateUIForLoggedInUser(session.user);
    } else {
        // User is not logged in
        updateUIForLoggedOutUser();
    }
}

// Load user profile from profiles table
async function loadUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
    
    if (data) {
        localStorage.setItem('username', data.username);
    }
}

// Update UI untuk user yang sudah login
function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector(".login");
    if (loginBtn) {
        const username = localStorage.getItem('username') || user.email.split('@')[0];
        loginBtn.textContent = `👤 ${username}`;
        loginBtn.style.cursor = 'default';
        
        // Tambahkan logout functionality
        loginBtn.addEventListener('click', showLogoutMenu);
    }
}

// Update UI untuk user yang belum login
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector(".login");
    if (loginBtn) {
        loginBtn.textContent = "Login";
    }
}

// Show logout menu
function showLogoutMenu(e) {
    e.preventDefault();
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
    const registerModalEl = document.getElementById("registerModal");
    
    // Get buttons
    const loginBtn = document.querySelector(".login");
    const closeLoginBtn = document.querySelector(".close-login");
    const closeRegisterBtn = document.querySelector(".close-register");
    
    const switchToRegisterLink = document.getElementById("switchToRegister");
    const switchToLoginLink = document.getElementById("switchToLogin");
    
    const submitLoginBtn = document.getElementById("submitLogin");
    const submitRegisterBtn = document.getElementById("submitRegister");
    
    // ===== OPEN MODALS =====
    if (loginBtn) {
        loginBtn.addEventListener("click", async (e) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                loginModalEl.style.display = "flex";
            }
        });
    }
    
    // ===== CLOSE MODALS =====
    closeLoginBtn.addEventListener("click", () => {
        loginModalEl.style.display = "none";
    });
    
    closeRegisterBtn.addEventListener("click", () => {
        registerModalEl.style.display = "none";
    });
    
    // Close when clicking outside modal
    window.addEventListener("click", (e) => {
        if (e.target === loginModalEl) {
            loginModalEl.style.display = "none";
        }
        if (e.target === registerModalEl) {
            registerModalEl.style.display = "none";
        }
    });
    
    // ===== SWITCH BETWEEN MODALS =====
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginModalEl.style.display = "none";
        registerModalEl.style.display = "flex";
    });
    
    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        registerModalEl.style.display = "none";
        loginModalEl.style.display = "flex";
    });
    
    // ===== SUBMIT HANDLERS =====
    submitLoginBtn.addEventListener("click", handleLogin);
    submitRegisterBtn.addEventListener("click", handleRegister);

    const googleLoginBtn = document.getElementById("loginGoogle");
    googleLoginBtn.addEventListener("click", handleGoogleLogin);

    
    // Enter key support
    document.getElementById("loginPassword").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleLogin();
    });
    
    document.getElementById("confirmPassword").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
    });
}

// ========================================
// LOGIN HANDLER
// ========================================

async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    const submitBtn = document.getElementById("submitLogin");
    
    // Validation
    if (!email || !password) {
        errorEl.textContent = "⚠️ Email dan password harus diisi!";
        return;
    }
    
    try {
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = "Loading...";
        
        // Login dengan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Load profile
        await loadUserProfile(data.user.id);
        
        errorEl.textContent = "";
        alert("✅ Login berhasil!");
        document.getElementById("loginModal").style.display = "none";
        
        // Update UI
        updateUIForLoggedInUser(data.user);
        
        // Reload page
        window.location.reload();
        
    } catch (error) {
        console.error("Login error:", error);
        errorEl.textContent = "❌ " + (error.message || "Login gagal!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Masuk";
    }
}

// ========================================
// REGISTER HANDLER
// ========================================

async function handleRegister() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorEl = document.getElementById("registerError");
    const submitBtn = document.getElementById("submitRegister");
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        errorEl.textContent = "⚠️ Semua field harus diisi!";
        return;
    }
    
    if (password !== confirmPassword) {
        errorEl.textContent = "⚠️ Password tidak cocok!";
        return;
    }
    
    if (password.length < 6) {
        errorEl.textContent = "⚠️ Password minimal 6 karakter!";
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorEl.textContent = "⚠️ Email tidak valid!";
        return;
    }
    
    try {
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = "Loading...";
        
        // 1. Register dengan Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (authError) throw authError;
        
        // 2. Insert username ke tabel profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: authData.user.id,
                    username: username 
                }
            ]);
        
        if (profileError) throw profileError;
        
        errorEl.textContent = "";
        alert("✅ Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
        
        // Switch to login modal
        document.getElementById("registerModal").style.display = "none";
        document.getElementById("loginModal").style.display = "flex";
        
        // Pre-fill email
        document.getElementById("loginEmail").value = email;
        
    } catch (error) {
        console.error("Register error:", error);
        
        if (error.message.includes('already registered')) {
            errorEl.textContent = "❌ Email sudah terdaftar!";
        } else {
            errorEl.textContent = "❌ " + (error.message || "Registrasi gagal!");
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Daftar";
    }
}

// ========================================
// LOGOUT HANDLER
// ========================================

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
        localStorage.clear();
        alert("✅ Logout berhasil!");
        window.location.reload();
    } else {
        alert("❌ Logout gagal!");
    }
}

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    initModals();
});

// Listen untuk perubahan auth state
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
        await ensureUserProfile(session.user);
        await loadUserProfile(session.user.id);
        updateUIForLoggedInUser(session.user);
    }
});


async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
    });

    if (error) {
        alert("❌ Login Google gagal");
        console.error(error);
    }
}

async function ensureUserProfile(user) {
    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (!data) {
        await supabase.from('profiles').insert([
            {
                id: user.id,
                username: user.email.split('@')[0]
            }
        ]);
    }
}
