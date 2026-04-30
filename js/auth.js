// ==========================================
// Auth — Login, Logout, Route Protection
// Using Supabase Auth
// ==========================================

import { supabase } from "./supabase-config.js";
import { showToast, showSpinner, hideSpinner } from "./ui.js";

// ---- Protect dashboard routes ----
// Call this at the top of dashboard.html
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }
  // Show admin email if element exists
  const nameEl = document.getElementById("adminName");
  if (nameEl) nameEl.textContent = session.user.email;

  // Listen for sign-out events
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "login.html";
    }
  });
}

// ---- Redirect logged-in users away from login page ----
export async function redirectIfLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = "dashboard.html";
  }
}

// ---- Login Handler ----
export async function loginAdmin(email, password) {
  showSpinner();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  hideSpinner();

  if (error) {
    const messages = {
      "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      "Email not confirmed": "لم يتم تأكيد البريد الإلكتروني بعد",
      "Too many requests": "تم تجاوز عدد المحاولات، حاول لاحقاً",
    };
    const msg = messages[error.message] || "حدث خطأ أثناء تسجيل الدخول";
    showToast(msg, "danger");
    return;
  }

  window.location.href = "dashboard.html";
}

// ---- Logout Handler ----
export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast("حدث خطأ أثناء تسجيل الخروج", "danger");
    return;
  }
  window.location.href = "login.html";
}
