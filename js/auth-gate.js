(function () {
  var path = window.location.pathname || "";
  var file = path.split("/").pop() || "index.html";
  if (!file || file.indexOf(".") === -1) file = "index.html";
  var isLogin = /login\.html$/i.test(file);

  function hasSessionHint() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || key.indexOf("sb-") !== 0 || key.indexOf("-auth-token") === -1) {
          continue;
        }
        var raw = localStorage.getItem(key);
        if (!raw || raw === "null") continue;
        var data = JSON.parse(raw);
        if (!data) continue;
        if (data.access_token || data.refresh_token || data.currentSession) return true;
        if (data.user) return true;
      }
    } catch (_) {
      /* ignore */
    }
    return false;
  }

  var hinted = hasSessionHint();

  if (!isLogin && !hinted) {
    var next = encodeURIComponent(file + window.location.search);
    window.location.replace("login.html?next=" + next);
    return;
  }

  if (isLogin && hinted) {
    document.documentElement.classList.add("auth-pending");
    return;
  }

  if (!isLogin) {
    document.documentElement.classList.add("auth-pending");
  }
})();
