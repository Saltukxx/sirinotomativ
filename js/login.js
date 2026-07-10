(async function bootLogin() {
  try {
    const session = await auth.getSession();
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "index.html";
      window.location.href = next.includes("login.html") ? "index.html" : next;
      return;
    }
  } catch (_) {
    // stay on login
  }
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
    window.location.href = next.includes("login.html") ? "index.html" : next;
  } catch (err) {
    errorEl.textContent =
      err.message === "Invalid login credentials"
        ? "Kullanıcı adı veya şifre hatalı."
        : err.message || "Giriş başarısız.";
    show(errorEl);
    btn.disabled = false;
    btn.textContent = "Giriş yap";
  }
});
