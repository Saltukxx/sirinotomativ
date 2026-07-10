let vehicles = [];
let filter = "all";
let query = "";

function renderStats(list) {
  const stats = portfolioStats(list);
  const profitClass =
    stats.totalProfit > 0
      ? "text-profit"
      : stats.totalProfit < 0
        ? "text-loss"
        : "";

  qs("stats").innerHTML = `
    <div class="stat">
      <p class="stat-label">Toplam araç</p>
      <p class="stat-value">${stats.totalVehicles}</p>
      <p class="stat-hint">${stats.inStock} stokta · ${stats.sold} satıldı</p>
    </div>
    <div class="stat">
      <p class="stat-label">Toplam yatırım</p>
      <p class="stat-value">${formatCurrency(stats.totalInvested)}</p>
      <p class="stat-hint">Alış + masraf + komisyon + KDV</p>
    </div>
    <div class="stat">
      <p class="stat-label">Satış geliri</p>
      <p class="stat-value">${formatCurrency(stats.totalRevenue)}</p>
      <p class="stat-hint">Satılan araçlar</p>
    </div>
    <div class="stat">
      <p class="stat-label">Toplam kar</p>
      <p class="stat-value ${profitClass}">${formatCurrency(stats.totalProfit)}</p>
      <p class="stat-hint">${
        stats.averageMargin != null
          ? `Ort. marj ${formatPercent(stats.averageMargin)}`
          : "Henüz satış yok"
      }</p>
    </div>
  `;

  renderAlerts(stats.stockAlerts);
}

function renderAlerts(alerts) {
  const root = qs("alerts");
  if (!root) return;

  if (!alerts.length) {
    root.innerHTML = "";
    hide(root);
    return;
  }

  show(root);
  root.innerHTML = `
    <div class="alerts-card">
      <div class="alerts-head">
        <h2>Stok uyarıları</h2>
        <p>${alerts.length} araç uzun süredir stokta</p>
      </div>
      <ul class="alerts-list">
        ${alerts
          .map((v) => {
            const level = stockAlertLevel(v);
            const days = daysInStock(v);
            return `
              <li>
                <a class="alert-item alert-${level}" href="arac.html?id=${v.id}">
                  <div class="alert-item-main">
                    ${
                      v.photo_url
                        ? `<img src="${escapeHtml(v.photo_url)}" alt="" class="alert-thumb" />`
                        : `<div class="alert-thumb placeholder">Araç</div>`
                    }
                    <div>
                      <strong>${escapeHtml(v.brand)} ${escapeHtml(v.model)}</strong>
                      <p>${v.year}${v.plate ? ` · ${escapeHtml(v.plate)}` : ""} · ${formatCurrency(v.purchase_price)}</p>
                    </div>
                  </div>
                  <span class="alert-chip alert-chip-${level}">${days} gün · ${stockAlertLabel(level)}</span>
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `;
}

function marginHtml(vehicle) {
  const p = profit(vehicle);
  const m = profitMargin(vehicle);
  if (p == null || m == null) {
    return `<span style="color:var(--steel)">—</span>`;
  }
  const cls = p >= 0 ? "text-profit" : "text-loss";
  return `
    <div class="${cls}">
      <strong>${formatCurrency(p)}</strong>
      <div style="font-size:0.75rem;opacity:0.85;margin-top:0.1rem">${formatPercent(m)}</div>
    </div>
  `;
}

function renderList(list) {
  const root = qs("list-root");

  if (list.length === 0) {
    root.innerHTML = `
      <div class="empty">
        <h2>Henüz araç yok</h2>
        <p>İlk aracınızı ekleyerek alış, masraf ve satış takibine başlayın.</p>
        <a href="yeni.html" class="btn btn-primary">İlk aracı ekle</a>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="panel">
      <div class="table-head">
        <span>Araç</span>
        <span>Durum</span>
        <span>Alış</span>
        <span>Masraf</span>
        <span>Satış</span>
        <span>Kar / Marj</span>
      </div>
      <ul class="vehicle-list">
        ${list
          .map((v) => {
            const level = stockAlertLevel(v);
            const badge =
              v.status === "satildi"
                ? `<span class="badge badge-sold">Satıldı</span>`
                : `<span class="badge badge-stock">Stokta</span>`;
            const stockChip = level
              ? `<span class="stock-chip stock-chip-${level}">${daysInStock(v)}g</span>`
              : "";
            return `
              <li class="vehicle-row" data-id="${v.id}">
                <div class="vehicle-row-top">
                  <div class="vehicle-identity">
                    ${
                      v.photo_url
                        ? `<img class="vehicle-thumb" src="${escapeHtml(v.photo_url)}" alt="" />`
                        : `<div class="vehicle-thumb placeholder">Araç</div>`
                    }
                    <div>
                      <p class="vehicle-title">${escapeHtml(v.brand)} ${escapeHtml(v.model)} ${stockChip}</p>
                      <p class="vehicle-meta">${v.year}${v.plate ? ` · ${escapeHtml(v.plate)}` : ""}${
                        v.seller_name ? ` · Satıcı: ${escapeHtml(v.seller_name)}` : ""
                      }</p>
                    </div>
                  </div>
                  ${badge}
                </div>
                <div class="vehicle-metrics">
                  <div class="metric">
                    <span class="metric-label">Alış</span>
                    <span class="metric-value">${formatCurrency(v.purchase_price)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Masraf</span>
                    <span class="metric-value">${formatCurrency(totalExpenses(v.expenses))}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Satış</span>
                    <span class="metric-value">${
                      v.sale_price != null ? formatCurrency(v.sale_price) : "—"
                    }</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Kar</span>
                    <span class="metric-value">${marginHtml(v)}</span>
                  </div>
                </div>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `;

  root.querySelectorAll(".vehicle-row").forEach((row) => {
    row.addEventListener("click", () => {
      window.location.href = `arac.html?id=${row.dataset.id}`;
    });
  });
}

function applyFilters() {
  const q = query.trim().toLowerCase();
  const filtered = vehicles.filter((v) => {
    if (filter === "uyari") return Boolean(stockAlertLevel(v));
    if (filter !== "all" && v.status !== filter) return false;
    if (!q) return true;
    const hay =
      `${v.brand} ${v.model} ${v.plate} ${v.year} ${v.seller_name} ${v.buyer_name}`.toLowerCase();
    return hay.includes(q);
  });
  renderStats(vehicles);
  renderList(filtered);
}

async function boot() {
  if (!db.init()) {
    show(qs("config-warning"));
    hide(qs("loading"));
    return;
  }

  const session = await auth.requireAuth();
  if (!session) return;
  await auth.renderHeaderUser();

  try {
    vehicles = await db.listVehicles();
    hide(qs("loading"));
    applyFilters();
  } catch (err) {
    hide(qs("loading"));
    const error = qs("error");
    error.textContent = err.message || "Veriler yüklenemedi.";
    show(error);
  }
}

qs("filters").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  qs("filters").querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
  applyFilters();
});

qs("search").addEventListener("input", (e) => {
  query = e.target.value;
  applyFilters();
});

boot();
