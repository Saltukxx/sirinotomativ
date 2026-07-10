qs("year").value = new Date().getFullYear();
qs("purchase_date").value = todayISO();

function setStatus(status) {
  qs("status").value = status;
  qs("status-stokta").classList.toggle("active-stock", status === "stokta");
  qs("status-satildi").classList.toggle("active-sold", status === "satildi");
  qs("sale-fields").classList.toggle("hidden", status !== "satildi");
  if (status === "satildi" && !qs("sale_date").value) {
    qs("sale_date").value = todayISO();
  }
}

qs("status-stokta").addEventListener("click", () => setStatus("stokta"));
qs("status-satildi").addEventListener("click", () => setStatus("satildi"));

qs("vehicle-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = qs("form-error");
  hide(errorEl);

  if (!db.init()) {
    errorEl.textContent = "Supabase ayarları eksik.";
    show(errorEl);
    return;
  }

  const status = qs("status").value;
  const salePriceRaw = qs("sale_price").value;
  const payload = {
    brand: qs("brand").value.trim(),
    model: qs("model").value.trim(),
    year: Number(qs("year").value),
    plate: qs("plate").value.trim().toUpperCase(),
    purchase_price: Number(qs("purchase_price").value),
    purchase_date: qs("purchase_date").value,
    status,
    sale_price: status === "satildi" && salePriceRaw ? Number(salePriceRaw) : null,
    sale_date: status === "satildi" ? qs("sale_date").value || null : null,
    notes: qs("notes").value.trim(),
  };

  if (!payload.brand || !payload.model) {
    errorEl.textContent = "Marka ve model zorunludur.";
    show(errorEl);
    return;
  }
  if (!(payload.purchase_price > 0)) {
    errorEl.textContent = "Alış fiyatı 0'dan büyük olmalıdır.";
    show(errorEl);
    return;
  }
  if (status === "satildi" && !(payload.sale_price > 0)) {
    errorEl.textContent = "Satılan araç için satış fiyatı girin.";
    show(errorEl);
    return;
  }

  const btn = qs("submit-btn");
  btn.disabled = true;
  btn.textContent = "Kaydediliyor…";

  try {
    const vehicle = await db.createVehicle(payload);
    window.location.href = `arac.html?id=${vehicle.id}`;
  } catch (err) {
    errorEl.textContent = err.message || "Kayıt başarısız.";
    show(errorEl);
    btn.disabled = false;
    btn.textContent = "Aracı kaydet";
  }
});
