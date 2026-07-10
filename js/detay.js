const params = new URLSearchParams(window.location.search);
const vehicleId = params.get("id");

function expenseOptions(selected = "bakim") {
  return Object.entries(CATEGORY_LABELS)
    .map(
      ([value, label]) =>
        `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`,
    )
    .join("");
}

function sortedExpenses(expenses) {
  return [...(expenses || [])].sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    if (da === db) return (b.created_at || "").localeCompare(a.created_at || "");
    return db.localeCompare(da);
  });
}

function renderDetail(vehicle) {
  const expenses = sortedExpenses(vehicle.expenses);
  const cost = totalCost(vehicle);
  const expenseTotal = totalExpenses(expenses);
  const p = profit(vehicle);
  const m = profitMargin(vehicle);

  let profitBoxClass = "pending";
  let profitLabel = "Bekleyen kar";
  let profitAmount = "—";
  let profitColor = "var(--stock)";

  if (p != null) {
    profitBoxClass = p >= 0 ? "positive" : "negative";
    profitLabel = "Net kar";
    profitAmount = formatCurrency(p);
    profitColor = p >= 0 ? "var(--profit)" : "var(--loss)";
  }

  document.title = `${vehicle.brand} ${vehicle.model} — Şirin Otomotiv`;

  qs("detail-root").innerHTML = `
    <a href="index.html" class="back-link">← Portföye dön</a>

    <section class="detail-header">
      <div>
        <p class="section-label">
          ${vehicle.status === "satildi" ? "Satıldı" : "Stokta"}${
            vehicle.plate ? ` · ${escapeHtml(vehicle.plate)}` : ""
          }
        </p>
        <h1 class="page-title" style="margin-top:0.35rem">
          ${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}
        </h1>
        <p class="page-desc">
          ${vehicle.year} model · Alış ${formatDate(vehicle.purchase_date)}
          ${vehicle.notes ? ` · ${escapeHtml(vehicle.notes)}` : ""}
        </p>
      </div>
      <div class="detail-actions">
        <button type="button" class="btn btn-outline" id="edit-btn">Düzenle</button>
        <button type="button" class="btn btn-danger" id="delete-btn">Sil</button>
      </div>
    </section>

    <div class="detail-grid">
      <section class="card">
        <h2>Kar özeti</h2>
        <p class="card-desc">Kar = Satış − (Alış + Masraflar)</p>
        <dl style="margin:1.1rem 0 0">
          <div class="summary-row"><dt>Alış fiyatı</dt><dd>${formatCurrency(vehicle.purchase_price)}</dd></div>
          <div class="summary-row"><dt>Toplam masraf</dt><dd>${formatCurrency(expenseTotal)}</dd></div>
          <div class="summary-row"><dt>Toplam maliyet</dt><dd><strong>${formatCurrency(cost)}</strong></dd></div>
          <div class="summary-row"><dt>Satış fiyatı</dt><dd>${
            vehicle.sale_price != null ? formatCurrency(vehicle.sale_price) : "Henüz satılmadı"
          }</dd></div>
        </dl>
        <div class="profit-box ${profitBoxClass}">
          <p class="label">${profitLabel}</p>
          <p class="amount" style="color:${profitColor}">${profitAmount}</p>
          ${
            m != null
              ? `<p class="profit-meta">Satış marjı ${formatPercent(m)}</p>`
              : ""
          }
          ${
            vehicle.status === "satildi" && vehicle.sale_date
              ? `<p class="profit-date">Satış tarihi: ${formatDate(vehicle.sale_date)}</p>`
              : ""
          }
        </div>
      </section>

      <section class="card" id="expenses-card">
        <div class="card-head">
          <div>
            <h2>Masraflar</h2>
            <p class="card-desc">Bu araca yapılan tüm masrafları kaydedin</p>
          </div>
          <p class="card-total">${formatCurrency(expenseTotal)}</p>
        </div>

        <form id="expense-form" class="expense-form">
          <div class="field">
            <label for="exp-desc">Açıklama</label>
            <input id="exp-desc" required maxlength="120" placeholder="Örn. Fren balata değişimi" />
          </div>
          <div class="field">
            <label for="exp-cat">Kategori</label>
            <select id="exp-cat">${expenseOptions()}</select>
          </div>
          <div class="field">
            <label for="exp-amount">Tutar (₺)</label>
            <input id="exp-amount" type="number" min="1" step="100" required placeholder="0" inputmode="numeric" />
          </div>
          <div class="field">
            <label for="exp-date">Tarih</label>
            <input id="exp-date" type="date" required value="${todayISO()}" />
          </div>
          <button type="submit" class="btn btn-ink expense-submit" id="expense-submit">
            Masraf kaydet
          </button>
        </form>

        <div id="expense-feedback" class="alert alert-success hidden" style="margin-bottom:0.85rem"></div>

        ${
          expenses.length === 0
            ? `<div class="expense-empty">Henüz masraf yok. Yukarıdan ilk masrafı ekleyin.</div>`
            : `<ul class="expense-list">
                ${expenses
                  .map(
                    (e) => `
                  <li class="expense-item">
                    <div>
                      <h3>${escapeHtml(e.description)}</h3>
                      <p>
                        <span class="expense-cat-chip">${CATEGORY_LABELS[e.category] || e.category}</span>
                        ${formatDate(e.date)}
                      </p>
                    </div>
                    <div class="expense-right">
                      <span class="expense-amount">${formatCurrency(e.amount)}</span>
                      <button type="button" class="btn btn-danger btn-sm" data-delete-expense="${e.id}">
                        Sil
                      </button>
                    </div>
                  </li>
                `,
                  )
                  .join("")}
              </ul>`
        }
      </section>
    </div>

    <section id="edit-panel" class="panel edit-panel hidden">
      <h2>Aracı düzenle</h2>
      <form id="edit-form" class="form-grid two">
        <div class="field">
          <label for="edit-brand">Marka</label>
          <input id="edit-brand" value="${escapeHtml(vehicle.brand)}" required />
        </div>
        <div class="field">
          <label for="edit-model">Model</label>
          <input id="edit-model" value="${escapeHtml(vehicle.model)}" required />
        </div>
        <div class="field">
          <label for="edit-year">Yıl</label>
          <input id="edit-year" type="number" value="${vehicle.year}" required />
        </div>
        <div class="field">
          <label for="edit-plate">Plaka</label>
          <input id="edit-plate" value="${escapeHtml(vehicle.plate || "")}" />
        </div>
        <div class="field">
          <label for="edit-purchase-price">Alış fiyatı</label>
          <input id="edit-purchase-price" type="number" value="${vehicle.purchase_price}" required />
        </div>
        <div class="field">
          <label for="edit-purchase-date">Alış tarihi</label>
          <input id="edit-purchase-date" type="date" value="${vehicle.purchase_date}" required />
        </div>
        <div class="field">
          <label for="edit-status">Durum</label>
          <select id="edit-status">
            <option value="stokta" ${vehicle.status === "stokta" ? "selected" : ""}>Stokta</option>
            <option value="satildi" ${vehicle.status === "satildi" ? "selected" : ""}>Satıldı</option>
          </select>
        </div>
        <div class="field">
          <label for="edit-sale-price">Satış fiyatı</label>
          <input id="edit-sale-price" type="number" value="${vehicle.sale_price ?? ""}" />
        </div>
        <div class="field">
          <label for="edit-sale-date">Satış tarihi</label>
          <input id="edit-sale-date" type="date" value="${vehicle.sale_date ?? ""}" />
        </div>
        <div class="field" style="grid-column:1 / -1">
          <label for="edit-notes">Notlar</label>
          <textarea id="edit-notes" rows="3">${escapeHtml(vehicle.notes || "")}</textarea>
        </div>
        <div class="form-actions" style="grid-column:1 / -1">
          <button type="submit" class="btn btn-primary btn-block">Değişiklikleri kaydet</button>
          <button type="button" class="btn btn-ghost btn-block" id="cancel-edit">İptal</button>
        </div>
      </form>
      <div id="edit-error" class="alert alert-error hidden" style="margin-top:1rem"></div>
    </section>
  `;

  bindDetailEvents(vehicle);
}

function bindDetailEvents(vehicle) {
  qs("edit-btn").addEventListener("click", () => {
    show(qs("edit-panel"));
    qs("edit-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  qs("cancel-edit").addEventListener("click", () => hide(qs("edit-panel")));

  qs("delete-btn").addEventListener("click", async () => {
    if (!confirm(`${vehicle.brand} ${vehicle.model} kaydını silmek istiyor musunuz?`)) return;
    try {
      await db.deleteVehicle(vehicle.id);
      window.location.href = "index.html";
    } catch (err) {
      alert(err.message || "Silinemedi.");
    }
  });

  qs("expense-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = qs("expense-submit");
    const feedback = qs("expense-feedback");
    hide(feedback);

    const description = qs("exp-desc").value.trim();
    const amount = Number(qs("exp-amount").value);
    const date = qs("exp-date").value;
    const category = qs("exp-cat").value;

    if (!description || !(amount > 0) || !date) {
      feedback.className = "alert alert-error";
      feedback.textContent = "Açıklama, tutar ve tarih zorunludur.";
      show(feedback);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Kaydediliyor…";

    try {
      await db.addExpense({
        vehicle_id: vehicle.id,
        description,
        category,
        amount,
        date,
      });
      showToast("Masraf kaydedildi");
      await load();
      const card = qs("expenses-card");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      feedback.className = "alert alert-error";
      feedback.textContent = err.message || "Masraf eklenemedi.";
      show(feedback);
      btn.disabled = false;
      btn.textContent = "Masraf kaydet";
    }
  });

  document.querySelectorAll("[data-delete-expense]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu masrafı silmek istiyor musunuz?")) return;
      try {
        await db.deleteExpense(btn.dataset.deleteExpense);
        showToast("Masraf silindi");
        await load();
      } catch (err) {
        alert(err.message || "Masraf silinemedi.");
      }
    });
  });

  qs("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = qs("edit-error");
    hide(errorEl);
    const status = qs("edit-status").value;
    const saleRaw = qs("edit-sale-price").value;
    const payload = {
      brand: qs("edit-brand").value.trim(),
      model: qs("edit-model").value.trim(),
      year: Number(qs("edit-year").value),
      plate: qs("edit-plate").value.trim().toUpperCase(),
      purchase_price: Number(qs("edit-purchase-price").value),
      purchase_date: qs("edit-purchase-date").value,
      status,
      sale_price: status === "satildi" && saleRaw ? Number(saleRaw) : null,
      sale_date: status === "satildi" ? qs("edit-sale-date").value || null : null,
      notes: qs("edit-notes").value.trim(),
    };

    if (status === "satildi" && !(payload.sale_price > 0)) {
      errorEl.textContent = "Satılan araç için satış fiyatı girin.";
      show(errorEl);
      return;
    }

    try {
      await db.updateVehicle(vehicle.id, payload);
      showToast("Araç güncellendi");
      await load();
    } catch (err) {
      errorEl.textContent = err.message || "Güncellenemedi.";
      show(errorEl);
    }
  });
}

async function load() {
  if (!vehicleId) {
    hide(qs("loading"));
    qs("error").textContent = "Araç bulunamadı.";
    show(qs("error"));
    return;
  }

  if (!db.init()) {
    hide(qs("loading"));
    qs("error").textContent = "Supabase ayarları eksik.";
    show(qs("error"));
    return;
  }

  try {
    const vehicle = await db.getVehicle(vehicleId);
    hide(qs("loading"));
    hide(qs("error"));
    show(qs("detail-root"));
    renderDetail(vehicle);
  } catch (err) {
    hide(qs("loading"));
    qs("error").textContent = err.message || "Araç yüklenemedi.";
    show(qs("error"));
  }
}

load();
