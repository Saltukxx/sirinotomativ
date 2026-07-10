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

const PAYMENT_LABELS = {
  nakit: "Nakit",
  havale: "Havale / EFT",
  takas: "Takas",
  kredi_karti: "Kredi kartı",
  cek: "Çek",
  diger: "Diğer",
};

const STOCK_ALERT_DAYS = {
  warning: 30,
  strong: 60,
  critical: 90,
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

function daysBetween(fromISO, toDate = new Date()) {
  if (!fromISO) return 0;
  const from = new Date(fromISO);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.max(0, Math.round((end - start) / 86400000));
}

function daysInStock(vehicle) {
  if (vehicle.status !== "stokta") return 0;
  return daysBetween(vehicle.purchase_date);
}

function stockAlertLevel(vehicle) {
  if (vehicle.status !== "stokta") return null;
  const days = daysInStock(vehicle);
  if (days >= STOCK_ALERT_DAYS.critical) return "critical";
  if (days >= STOCK_ALERT_DAYS.strong) return "strong";
  if (days >= STOCK_ALERT_DAYS.warning) return "warning";
  return null;
}

function stockAlertLabel(level) {
  switch (level) {
    case "critical":
      return "90+ gün stokta";
    case "strong":
      return "60+ gün stokta";
    case "warning":
      return "30+ gün stokta";
    default: {
      const _exhaustive = level;
      return _exhaustive ?? "";
    }
  }
}

function totalExpenses(expenses) {
  return (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

function commissionAmount(vehicle) {
  return Number(vehicle.commission || 0);
}

function vatAmount(vehicle) {
  return Number(vehicle.vat_amount || 0);
}

function totalCost(vehicle) {
  return (
    Number(vehicle.purchase_price || 0) +
    totalExpenses(vehicle.expenses) +
    commissionAmount(vehicle) +
    vatAmount(vehicle)
  );
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

  const stockAlerts = vehicles
    .filter((v) => stockAlertLevel(v))
    .sort((a, b) => daysInStock(b) - daysInStock(a));

  return {
    totalVehicles: vehicles.length,
    inStock,
    sold: soldVehicles.length,
    totalInvested,
    totalRevenue,
    totalProfit,
    averageMargin,
    stockAlerts,
  };
}

function paymentOptions(selected = "nakit", includeEmpty = false) {
  const entries = Object.entries(PAYMENT_LABELS);
  const options = entries
    .map(
      ([value, label]) =>
        `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`,
    )
    .join("");
  if (!includeEmpty) return options;
  return `<option value="">Seçiniz</option>${options}`;
}

function qs(id) {
  return document.getElementById(id);
}

function show(el) {
  if (el) el.classList.remove("hidden");
}

function hide(el) {
  if (el) el.classList.add("hidden");
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

function fileExt(file) {
  const name = file?.name || "";
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}
