const USERNAME_EMAILS = {
  emirhan: "emirhan@sirinotomotiv.com",
  erkan: "erkan@sirinotomotiv.com",
  ismail: "ismail@sirinotomotiv.com",
};

const auth = {
  async getSession() {
    if (!db.client && !db.init()) return null;
    const { data, error } = await db.client.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  usernameFromUser(user) {
    if (!user) return "";
    const meta = user.user_metadata || {};
    if (meta.username) return String(meta.username);
    const email = user.email || "";
    return email.split("@")[0] || "";
  },

  emailFromUsername(username) {
    const key = String(username || "")
      .trim()
      .toLowerCase();
    return USERNAME_EMAILS[key] || null;
  },

  async login(username, password) {
    if (!db.init()) throw new Error("Supabase ayarları eksik.");
    const email = this.emailFromUsername(username);
    if (!email) {
      throw new Error("Kullanıcı adı veya şifre hatalı.");
    }
    const { data, error } = await db.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.session;
  },

  async logout() {
    if (!db.client && !db.init()) return;
    const { error } = await db.client.auth.signOut();
    if (error) throw error;
  },

  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      const next = encodeURIComponent(
        window.location.pathname.split("/").pop() + window.location.search,
      );
      window.location.replace(`login.html?next=${next}`);
      return null;
    }
    document.documentElement.classList.remove("auth-pending");
    document.documentElement.classList.add("auth-ready");
    return session;
  },

  reveal() {
    document.documentElement.classList.remove("auth-pending");
    document.documentElement.classList.add("auth-ready");
  },

  async renderHeaderUser() {
    const slot = document.getElementById("user-slot");
    if (!slot) return;
    const user = await this.getUser();
    if (!user) {
      slot.innerHTML = `<a href="login.html" class="btn btn-ghost btn-sm">Giriş</a>`;
      return;
    }
    const name = this.usernameFromUser(user);
    slot.innerHTML = `
      <span class="user-chip">${escapeHtml(name)}</span>
      <button type="button" class="btn btn-ghost btn-sm" id="logout-btn">Çıkış</button>
    `;
    document.getElementById("logout-btn")?.addEventListener("click", async () => {
      try {
        await this.logout();
        window.location.href = "login.html";
      } catch (err) {
        alert(err.message || "Çıkış yapılamadı.");
      }
    });
  },
};
