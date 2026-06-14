# 📊 Sistem POS Indomaret - Dokumentasi Struktur

## 📁 Struktur File

Proyek ini terdiri dari 4 file utama yang terpisah:

### 1. **index.html** - File HTML (Struktur)
- Berisi semua elemen HTML (form, tabel, modal, dll)
- Terbagi menjadi 3 bagian utama:
  - **Login Screen** - Form login untuk kasir dan manager
  - **Kasir Screen** - Interface untuk transaksi penjualan
  - **Manager Screen** - Dashboard dan back office

### 2. **style.css** - File CSS (Styling)
- Semua styling dan design sistem
- Variabel warna dan tema dengan CSS Custom Properties (`:root`)
- Responsive layout dengan Flexbox dan Grid
- Animasi dan transisi

### 3. **db.js** - Database & Konstanta
- Semua data master (produk, member, user, promo, dll)
- Struktur database dengan array of objects:
  - `DB.users` - Data pengguna (kasir & manager)
  - `DB.produk` - Katalog produk
  - `DB.members` - Data member indomaret card
  - `DB.promos` - Data promosi aktif
  - `DB.penerimaan` - Riwayat penerimaan barang
  - `DB.retur` - Data retur & komplain
  - `DB.transaksi` - Riwayat transaksi penjualan

### 4. **app.js** - JavaScript Logic (Logika Aplikasi)
- Semua fungsi dan event handler
- Logika bisnis POS (scan, bayar, stok, dll)
- Fungsi manager (laporan, produk, promo)
- Utility (toast, modal, format)

---

## 🚀 Cara Menggunakan

### Buka Aplikasi
Cukup buka file `index.html` dengan browser:
```
Double-click index.html
```

### Demo Login
- **Kasir**: ID `KASIR001`, Password `1234`
- **Manager**: ID `MGR001`, Password `1234`

---

## 📋 Modul Utama

### 🧾 Mode Kasir
- **Scan Produk**: Input barcode untuk menambah ke keranjang
- **Qty Control**: Tombol +/- untuk mengubah jumlah
- **Member**: Tambah member untuk diskon 2% dan poin
- **Metode Bayar**: Tunai, Debit/Kredit, QRIS, E-Wallet
- **Cetak Struk**: Print receipt transaksi

### 📊 Mode Manager
- **Dashboard**: Ringkasan penjualan & stok menipis
- **Laporan**: Laporan penjualan harian & top produk
- **Produk**: Tambah, edit, hapus produk
- **Stok**: Monitoring level stok
- **Penerimaan**: Catat penerimaan barang
- **Member**: Data member indomaret card
- **Retur**: Catat retur & komplain pelanggan
- **Kasir**: Data kasir per shift
- **Promo**: Kelola promosi & diskon

---

## 🔧 Struktur Kode

### Format Fungsi
```javascript
// Login
doLogin()
doLogout()

// Kasir
scanProduct()
changeQty(idx, delta)
processPayment()
showStruk(trx)

// Manager
renderDashboard()
renderProdukTable()
saveProduk()
togglePromo(idx)
```

### State Management
```javascript
state = {
  role: 'kasir' | 'manager',
  user: { id, nama, role },
  cart: [...produk],
  member: { no, nama, tier, poin },
  payMethod: 'tunai' | 'debit' | 'qris' | 'ewallet',
}
```

---

## 📱 Fitur Utama

✅ Login multi-user (kasir & manager)
✅ Scan barcode produk
✅ Keranjang belanja dengan qty control
✅ Integrasi member & poin
✅ 4 metode pembayaran
✅ Auto-print struk transaksi
✅ Dashboard real-time
✅ Kelola produk (CRUD)
✅ Monitoring stok
✅ Penerimaan barang
✅ Retur & komplain
✅ Promo & diskon

---

## 🎨 Warna & Tema

Tema Indomaret dengan palet warna:
- **Merah** (#CE1126) - Primary
- **Hijau** (#0F6E56) - Success
- **Biru** (#1A73C8) - Info
- **Gold** (#F5A623) - Warning

---

## 💡 Tips Pengembangan

### Menambah Produk Baru
Edit `db.js` dan tambah ke array `DB.produk`:
```javascript
{ 
  barcode:"8999999XXXXXX", 
  nama:"Nama Produk", 
  kat:"Kategori",
  hpp:5000, 
  harga:7500, 
  stok:100, 
  min:20, 
  disc:0,
  supplier:"PT ..."
}
```

### Menambah User Baru
Edit `db.js` di array `DB.users`:
```javascript
{ 
  id:"KASIR003", 
  pass:"1234", 
  nama:"Nama Kasir", 
  role:"kasir" 
}
```

### Custom Styling
Edit `style.css` - Gunakan CSS variables dari `:root` untuk konsistensi warna.

---

## 🔐 Keamanan & Catatan

⚠️ **Ini adalah prototype/demo** - Data disimpan di memory saja (hilang saat refresh)
- Untuk production, integrasikan dengan backend API & database
- Implementasikan validasi input yang lebih ketat
- Gunakan autentikasi JWT atau session
- Encrypt password di backend

---

## 📞 Support

Jika ada pertanyaan atau ingin menambah fitur:
1. Edit file yang sesuai (HTML/CSS/JS/DB)
2. Reload browser untuk melihat perubahan
3. Gunakan DevTools (F12) untuk debugging
