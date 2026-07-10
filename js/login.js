(async function bootLogin() {
  try {
    const session = await auth.getSession();
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "index.html";
      window.location.replace(next.includes("login.html") ? "index.html" : next);
      return;
    }
  } catch (_) {
    // stay on login
  }
  auth.reveal();
})();

qs("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = qs("login-error");
  const btn = qs("login-btn");
  hide(errorEl);

  const username = qs("username").value.trim();
  const password = qs("password").value;

  btn.disabled = true;
  btn.textContent = "Giriş yapılıyor…";

  try {
    await auth.login(username, password);
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "index.html";
    window.location.replace(next.includes("login.html") ? "index.html" : next);
  } catch (err) {
    const msg = String(err.message || "");
    errorEl.textContent =
      msg === "Invalid login credentials" || /invalid/i.test(msg)
        ? "Kullanıcı adı veya şifre hatalı."
        : msg || "Giriş başarısız.";
    show(errorEl);
    btn.disabled = false;
    btn.textContent = "Giriş yap";
  }
});
