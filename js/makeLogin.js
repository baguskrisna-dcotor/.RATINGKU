// ========================================
// LOGIN & REGISTER MODAL SYSTEM
// ========================================
import { supabase, initSupabase } from "./supabase-client.js";
import msgBox from "./component/alert.js";

const loginModal = `
<style>
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.close-login {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 28px;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
}

.close-login:hover {
  color: #000;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #333;
}

.google-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.google-btn:hover {
  background-color: #f5f5f5;
}
</style>

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
// GLOBAL STATE
// ========================================
let authStateListener = null;
let isSupabaseReady = false;
let defaultAvatarUrl = null;

// ========================================
// INJECT MODALS KE BODY
// ========================================

function initModals() {
  const body = document.querySelector("body");
  body.insertAdjacentHTML("beforeend", loginModal);
  setupModalEvents();
}

// ========================================
// WAIT FOR SUPABASE READY
// ========================================

async function ensureSupabaseReady() {
  if (isSupabaseReady) return true;

  try {
    await initSupabase();
    isSupabaseReady = true;
    
    // Load default avatar URL saat init
    await loadDefaultAvatar();
    
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return false;
  }
}

// ========================================
// LOAD DEFAULT AVATAR
// ========================================

async function loadDefaultAvatar() {
  try {
    const { data, error } = await supabase
      .from("photo_profiles")
      .select("url")
      .eq("id_pp", 1)
      .single();

    if (!error && data?.url) {
      defaultAvatarUrl = data.url;
    }
  } catch (error) {
    console.log("Error loading default avatar:", error);
  }
}

// ========================================
// CHECK AUTH STATE
// ========================================

async function checkAuthState() {
  try {

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      updateUIForLoggedOutUser();
      return;
    }

    if (session && session.user) {
      await loadUserProfile(session.user.id);
      updateUIForLoggedInUser(session.user);
    } else {
      updateUIForLoggedOutUser();
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
    updateUIForLoggedOutUser();
  }
}

// ========================================
// LOAD USER PROFILE
// ========================================

async function loadUserProfile(userId) {
  try {
    // 1️⃣ Ambil profile dulu
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, pp")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return;
    }

    if (!profile) {
      console.log("No profile found");
      return;
    }

    // Simpan username
    if (profile.username) {
      localStorage.setItem("username", profile.username);
    }

    // 2️⃣ Ambil URL dari photo_profiles pakai pp
    if (profile.pp) {
      const { data: photo, error: photoError } = await supabase
        .from("photo_profiles")
        .select("url")
        .eq("id_pp", profile.pp)
        .single();

      if (!photoError && photo?.url) {
        localStorage.setItem("userPP", photo.url);
      }
    }

  } catch (error) {
    console.error("Error loading profile:", error);
  }
}


// ========================================
// UPDATE UI
// ========================================

function updateUIForLoggedInUser(user) {
  const loginBtn = document.querySelector(".login");
  if (!loginBtn) {
    console.warn("Login button not found");
    return;
  }


  const username =
    localStorage.getItem("username") ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  // Hanya pakai localStorage atau default dari photo_profiles ID 1
  const userPP = localStorage.getItem("userPP") || defaultAvatarUrl;

  loginBtn.innerHTML = `<img src="${userPP}" alt="Profile" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #fff;">`;
  loginBtn.style.cursor = "pointer";
  loginBtn.style.padding = "0";
  loginBtn.style.background = "transparent";
  loginBtn.style.border = "none";

  const newLoginBtn = loginBtn.cloneNode(true);
  loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

  newLoginBtn.onclick = function (e) {
    e.preventDefault();
    showLogoutMenu();
  };
}

function updateUIForLoggedOutUser() {
  const loginBtn = document.querySelector(".login");
  if (!loginBtn) {
    console.warn("Login button not found");
    return;
  }


  loginBtn.textContent = "Login";
  loginBtn.style.cursor = "pointer";
  loginBtn.style.padding = "";
  loginBtn.style.background = "";
  loginBtn.style.border = "";

  const newLoginBtn = loginBtn.cloneNode(true);
  loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

  newLoginBtn.onclick = function (e) {
    e.preventDefault();
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      loginModalEl.style.display = "flex";
    }
  };

}

function showLogoutMenu() {
  if (confirm("Apakah Anda ingin logout?")) {
    handleLogout();
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupModalEvents() {
  const loginModalEl = document.getElementById("loginModal");
  const closeLoginBtn = document.querySelector(".close-login");
  const googleLoginBtn = document.getElementById("loginGoogle");

  if (closeLoginBtn) {
    closeLoginBtn.addEventListener("click", () => {
      loginModalEl.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === loginModalEl) {
      loginModalEl.style.display = "none";
    }
  });

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", handleGoogleLogin);
  }
}

// ========================================
// GOOGLE LOGIN
// ========================================

async function handleGoogleLogin() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;

    if (typeof msgBox !== "undefined") {
      msgBox.info("Mengalihkan ke Google...");
    }
  } catch (error) {
    if (typeof msgBox !== "undefined") {
      msgBox.error("Gagal login dengan Google.");
    }
    console.error("Google login error:", error);
  }
}

// ========================================
// ENSURE USER PROFILE
// ========================================

async function ensureUserProfile(user) {
  try {

    const { data, error: selectError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        pp,
        photo_profiles(url)
      `)
      .eq("id", user.id)

    if (!data) {
      console.log("Creating new profile");

      const username =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      console.log("Attempting insert with:", { id: user.id, username, pp: 1 });

      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username: username,
          pp: 1,
        },
      ]);

      if (insertError) {
        console.error("❌ Error creating profile:", insertError);
        console.error("❌ Error code:", insertError.code);
        console.error("❌ Error message:", insertError.message);
        return;
      }

      console.log("Profile created");
      localStorage.setItem("username", username);

      // Load URL dari photo_profiles ID 1 (default)
      const { data: photoData, error: photoError } = await supabase
        .from("photo_profiles")
        .select("url")
        .eq("id_pp", 1)
        .single();

      if (!photoError && photoData?.url) {
        localStorage.setItem("userPP", photoData.url);
      }
    } else {
      
      if (data.username) {
        localStorage.setItem("username", data.username);
      }
      
      if (data.photo_profiles?.url) {
        localStorage.setItem("userPP", data.photo_profiles.url);
      }
    }
  } catch (error) {
    console.error("Error ensuring profile:", error);
  }
}

// ========================================
// CHANGE PROFILE PICTURE
// ========================================

async function changeProfilePicture(newPpId) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Validasi bahwa PP ID tersedia (1-10)
    if (newPpId < 1 || newPpId > 10) {
      throw new Error("Invalid profile picture ID");
    }

    // Update pp di tabel profiles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ pp: newPpId })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Load URL foto baru
    const { data: photoData, error: photoError } = await supabase
      .from("photo_profiles")
      .select("url")
      .eq("id_pp", newPpId)
      .single();

    if (photoError) throw photoError;

    // Update localStorage dan UI
    if (photoData?.url) {
      localStorage.setItem("userPP", photoData.url);
      updateUIForLoggedInUser(user);

      if (typeof msgBox !== "undefined") {
        msgBox.success("Profile picture berhasil diubah!");
      }
    }

  } catch (error) {
    console.error("Error changing profile picture:", error);

    if (typeof msgBox !== "undefined") {
      msgBox.error("Gagal mengubah profile picture.");
    }
  }
}

// ========================================
// LOGOUT
// ========================================

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      localStorage.removeItem("username");
      localStorage.removeItem("userPP");

      if (typeof msgBox !== "undefined") {
        msgBox.success("Berhasil logout.");
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw error;
    }
  } catch (error) {
    console.error("Logout error:", error);

    if (typeof msgBox !== "undefined") {
      msgBox.error("Gagal logout.");
    }
  }
}

// ========================================
// INITIALIZE
// ========================================

async function initialize() {

  // 1. Initialize modals
  initModals();

  // 2. Wait for Supabase to be fully ready
  const ready = await ensureSupabaseReady();
  if (!ready) {
    console.error("❌ Failed to initialize Supabase");
    updateUIForLoggedOutUser();
    return;
  }

  // 3. Check current auth state
  await checkAuthState();

  // 4. Setup auth state listener (only once)
  if (!authStateListener) {
    authStateListener = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {

          console.log("Sign in detected");
          await ensureUserProfile(session.user);
          await loadUserProfile(session.user.id);
          updateUIForLoggedInUser(session.user);

          // Show success message (only for new logins, not initial page load)
          if (typeof msgBox !== "undefined" && event === "SIGNED_IN") {
            msgBox.success("Login berhasil!");
          }

          // Clean URL if has OAuth params
          const url = new URL(window.location);
          if (
            url.hash.includes("access_token") ||
            url.search.includes("code")
          ) {
            window.history.replaceState({}, document.title, url.pathname);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("Sign out detected");
          updateUIForLoggedOutUser();
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed");
        }
      },
    );
  }

}

// ========================================
// START
// ========================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  // DOM already loaded
  initialize();
}

// Cleanup
window.addEventListener("beforeunload", () => {
  if (authStateListener) {
    authStateListener.subscription.unsubscribe();
  }
});

// Export
export {
  checkAuthState,
  updateUIForLoggedInUser,
  updateUIForLoggedOutUser,
  changeProfilePicture,
};