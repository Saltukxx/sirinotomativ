# Şirin Otomotiv — Araç Muhasebe

Sabit HTML / CSS / JS muhasebe uygulaması. Veriler Supabase üzerinde tutulur.

## Özellikler

- Araç ekleme / düzenleme / silme
- Masraf girişi (bakım, ekspertiz, noter, sigorta vb.)
- Stokta / satıldı durumu
- Araç bazlı net kar ve kar marjı
- Portföy özeti (yatırım, gelir, kar)

## Kar hesabı

```
Net kar = Satış − (Alış + Masraflar + Komisyon + KDV)
Kar marjı = Net kar / Satış fiyatı
```

## Ek özellikler

- Stok uyarıları (30 / 60 / 90 gün)
- Araç fotoğrafı (Supabase Storage)
- Masraf fişi / fatura yükleme
- Alıcı ve satıcı bilgileri
- Ödeme tipi (nakit, havale, takas, kart, çek)
- Komisyon ve KDV

## Giriş

`login.html` üzerinden kullanıcı adı ve şifre ile giriş yapılır.

## Çalıştırma

Basit bir statik sunucu yeterli:

```bash
npx serve .
```

veya:

```bash
python3 -m http.server 3000
```

Tarayıcıda `http://localhost:3000` açın.

## Supabase

Proje: `sirin-otomotiv`  
URL ve anon key: `js/config.js`

Tablolar:
- `vehicles` — araç kayıtları
- `expenses` — araç masrafları
