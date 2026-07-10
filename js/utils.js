const CATEGORY_LABELS = {
  bakim: "Bakım / Onarım",
  ekspertiz: "Ekspertiz",
  noter: "Noter / Ruhsat",
  sigorta: "Sigorta",
  yikama: "Yıkama / Detay",
  parca: "Parça",
  reklam: "Reklam / Komisyon",
  diger: "Diğer",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatPercent(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format((Number(value) || 0) / 100);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function totalExpenses(expenses) {
  return (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

function totalCost(vehicle) {
  return Number(vehicle.purchase_price || 0) + totalExpenses(vehicle.expenses);
}

function profit(vehicle) {
  if (vehicle.sale_price == null || vehicle.sale_price === "") return null;
  return Number(vehicle.sale_price) - totalCost(vehicle);
}

function profitMargin(vehicle) {
  const p = profit(vehicle);
  const sale = Number(vehicle.sale_price);
  if (p == null || !sale) return null;
  return (p / sale) * 100;
}

function portfolioStats(vehicles) {
  const inStock = vehicles.filter((v) => v.status === "stokta").length;
  const soldVehicles = vehicles.filter((v) => v.status === "satildi");
  const totalInvested = vehicles.reduce((sum, v) => sum + totalCost(v), 0);
  const totalRevenue = soldVehicles.reduce(
    (sum, v) => sum + Number(v.sale_price || 0),
    0,
  );
  const totalProfit = soldVehicles.reduce((sum, v) => sum + (profit(v) || 0), 0);
  const margins = soldVehicles
    .map((v) => profitMargin(v))
    .filter((m) => m != null);
  const averageMargin =
    margins.length > 0
      ? margins.reduce((a, b) => a + b, 0) / margins.length
      : null;

  return {
    totalVehicles: vehicles.length,
    inStock,
    sold: soldVehicles.length,
    totalInvested,
    totalRevenue,
    totalProfit,
    averageMargin,
  };
}

function qs(id) {
  return document.getElementById(id);
}

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
