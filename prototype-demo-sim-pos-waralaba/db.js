/**
 * ═════════════════════════════════════════════
 * DATABASE SISTEM POS INDOMARET
 * ═════════════════════════════════════════════
 */

const DB = {
  gerai: "Gerai Jl. Mawar No.12 – Jember",
  shift: "Pagi 07:00–15:00",

  users: [
    { id:"KASIR001", pass:"1234", nama:"Siti Rahayu", role:"kasir" },
    { id:"KASIR002", pass:"1234", nama:"Budi Santoso", role:"kasir" },
    { id:"MGR001",   pass:"1234", nama:"Hendra Wijaya", role:"manager" },
  ],

  produk: [
    { barcode:"8999999010001", nama:"Indomie Goreng 85g",          kat:"Mie Instan",         hpp:2500, harga:3500,  stok:145, min:20, disc:0,  supplier:"PT Indofood CBP" },
    { barcode:"8999999010002", nama:"Indomie Soto Ayam 75g",       kat:"Mie Instan",         hpp:2500, harga:3500,  stok:98,  min:20, disc:0,  supplier:"PT Indofood CBP" },
    { barcode:"8999999020001", nama:"Aqua Botol 600ml",            kat:"Minuman",            hpp:2500, harga:4000,  stok:200, min:30, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999020002", nama:"Aqua Galon 19L",              kat:"Minuman",            hpp:18000,harga:22000, stok:15,  min:5,  disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999020003", nama:"Teh Botol Sosro 450ml",       kat:"Minuman",            hpp:4000, harga:6000,  stok:88,  min:20, disc:5,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999020004", nama:"Kopi Good Day Vanilla 250ml", kat:"Minuman",            hpp:5000, harga:7500,  stok:60,  min:15, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999030001", nama:"Chitato Sapi Panggang 68g",   kat:"Makanan Ringan",     hpp:9000, harga:12500, stok:55,  min:15, disc:10, supplier:"PT Indofood CBP" },
    { barcode:"8999999030002", nama:"Pringles Original 107g",      kat:"Makanan Ringan",     hpp:28000,harga:38000, stok:22,  min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999040001", nama:"Susu Ultra Full Cream 250ml", kat:"Susu & Produk Susu", hpp:4500, harga:6500,  stok:120, min:25, disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999040002", nama:"Milo Activ-Go 250ml",         kat:"Susu & Produk Susu", hpp:5000, harga:7000,  stok:75,  min:20, disc:0,  supplier:"PT Nestle Indonesia" },
    { barcode:"8999999050001", nama:"Roti Tawar Sari Roti",        kat:"Roti & Kue",         hpp:12000,harga:15500, stok:8,   min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999050002", nama:"Roti Unyil Isi Coklat",       kat:"Roti & Kue",         hpp:5000, harga:7000,  stok:3,   min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999060001", nama:"Sabun Lifebuoy 65g",          kat:"Kebutuhan Rumah",    hpp:4500, harga:6500,  stok:40,  min:10, disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999060002", nama:"Shampo Sunsilk 70ml",         kat:"Kebutuhan Rumah",    hpp:9000, harga:13000, stok:35,  min:10, disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999070001", nama:"Gudang Garam Merah 12",       kat:"Rokok",              hpp:23000,harga:26000, stok:50,  min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999070002", nama:"Marlboro Filter 16",          kat:"Rokok",              hpp:35000,harga:40000, stok:30,  min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999080001", nama:"Pop Mie Ayam 75g",            kat:"Mie Instan",         hpp:3500, harga:5000,  stok:80,  min:20, disc:0,  supplier:"PT Indofood CBP" },
    { barcode:"8999999080002", nama:"Sarimi Soto Koya 72g",        kat:"Mie Instan",         hpp:2000, harga:3000,  stok:90,  min:20, disc:0,  supplier:"PT Indofood CBP" },
    { barcode:"8999999090001", nama:"Roma Kelapa 115g",            kat:"Makanan Ringan",     hpp:7000, harga:9500,  stok:45,  min:12, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999090002", nama:"Oreo Original 137g",          kat:"Makanan Ringan",     hpp:14000,harga:18000, stok:28,  min:10, disc:0,  supplier:"PT Indomarco Prismatama" },
    { barcode:"8999999100001", nama:"Sabun Lifebuoy Cair 250ml",   kat:"Kebutuhan Rumah",    hpp:8000, harga:12000, stok:32,  min:10, disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999100002", nama:"Sabun Lux Body Wash 250ml",   kat:"Kebutuhan Rumah",    hpp:10000,harga:15000, stok:28,  min:8,  disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999100003", nama:"Shampo Pantene 170ml",        kat:"Kebutuhan Rumah",    hpp:11000,harga:16000, stok:24,  min:8,  disc:0,  supplier:"PT Procter & Gamble" },
    { barcode:"8999999100004", nama:"Shampo Clear 160ml",          kat:"Kebutuhan Rumah",    hpp:9500, harga:14000, stok:30,  min:10, disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999100005", nama:"Kondisioner Pantene 170ml",   kat:"Kebutuhan Rumah",    hpp:11000,harga:16000, stok:18,  min:8,  disc:0,  supplier:"PT Procter & Gamble" },
    { barcode:"8999999100006", nama:"Bodrex Extra Tablet 4pcs",    kat:"Obat & Vitamin",     hpp:3500, harga:5500,  stok:50,  min:20, disc:0,  supplier:"PT Bodrexin" },
    { barcode:"8999999100007", nama:"Paracetamol 500mg Tablet 10",  kat:"Obat & Vitamin",     hpp:2000, harga:4000,  stok:60,  min:20, disc:0,  supplier:"PT Fahrenheit" },
    { barcode:"8999999100008", nama:"Vitamin C 500mg Tablet 10",   kat:"Obat & Vitamin",     hpp:4000, harga:7000,  stok:40,  min:15, disc:0,  supplier:"PT Pharos Indonesia" },
    { barcode:"8999999100009", nama:"Antacid Gaviscon 170ml",      kat:"Obat & Vitamin",     hpp:15000,harga:22000, stok:15,  min:5,  disc:0,  supplier:"PT Reckitt Benckiser" },
    { barcode:"8999999110001", nama:"Pocari Sweat 500ml",          kat:"Minuman",            hpp:6000, harga:9000,  stok:110, min:30, disc:0,  supplier:"PT Suntory Indonesia" },
    { barcode:"8999999110002", nama:"Gatorade Orange 500ml",       kat:"Minuman",            hpp:7000, harga:10500, stok:85,  min:25, disc:0,  supplier:"PT PepsiCo Indonesia" },
    { barcode:"8999999110003", nama:"Red Bull 250ml",              kat:"Minuman",            hpp:18000,harga:25000, stok:35,  min:10, disc:0,  supplier:"PT Red Bull Indonesia" },
    { barcode:"8999999110004", nama:"Kratingdaeng 250ml",          kat:"Minuman",            hpp:8500, harga:12000, stok:45,  min:15, disc:0,  supplier:"PT Osotspa Indonesia" },
    { barcode:"8999999110005", nama:"Sprite 600ml",                kat:"Minuman",            hpp:4000, harga:6500,  stok:95,  min:30, disc:0,  supplier:"PT PepsiCo Indonesia" },
    { barcode:"8999999110006", nama:"Fanta Orange 600ml",          kat:"Minuman",            hpp:4000, harga:6500,  stok:80,  min:25, disc:0,  supplier:"PT PepsiCo Indonesia" },
    { barcode:"8999999120001", nama:"Sosis Mayora Frozen 250g",    kat:"Makanan Frozen",     hpp:12000,harga:18000, stok:22,  min:8,  disc:0,  supplier:"PT Mayora Indah" },
    { barcode:"8999999120002", nama:"Bakso Ikan Frozen 250g",      kat:"Makanan Frozen",     hpp:10000,harga:15000, stok:18,  min:6,  disc:0,  supplier:"PT Sumber Rezeki" },
    { barcode:"8999999120003", nama:"Nugget Ayam Frozen 500g",     kat:"Makanan Frozen",     hpp:18000,harga:26000, stok:14,  min:5,  disc:0,  supplier:"PT Maspion Indonesia" },
    { barcode:"8999999120004", nama:"Es Krim Wall's Vanilla 500ml",kat:"Makanan Frozen",     hpp:15000,harga:22000, stok:12,  min:3,  disc:0,  supplier:"PT Unilever Indonesia" },
    { barcode:"8999999120005", nama:"Perkedel Frozen 500g",        kat:"Makanan Frozen",     hpp:12000,harga:17500, stok:16,  min:5,  disc:0,  supplier:"PT Eka Sari Lorena" },
    { barcode:"8999999130001", nama:"Buku Tulis A5 200 halaman",   kat:"Alat Tulis",         hpp:4000, harga:6500,  stok:80,  min:20, disc:0,  supplier:"PT Gramedia Widiasarana" },
    { barcode:"8999999130002", nama:"Pena Ballpoint BIC Hitam",    kat:"Alat Tulis",         hpp:1500, harga:3000,  stok:150, min:50, disc:0,  supplier:"PT BIC Indonesia" },
    { barcode:"8999999130003", nama:"Pensil HB Faber Castell 1dz", kat:"Alat Tulis",         hpp:6000, harga:10000, stok:40,  min:10, disc:0,  supplier:"PT Staedtler Indonesia" },
    { barcode:"8999999130004", nama:"Penghapus Staedtler 2pcs",    kat:"Alat Tulis",         hpp:2000, harga:4000,  stok:90,  min:30, disc:0,  supplier:"PT Staedtler Indonesia" },
    { barcode:"8999999130005", nama:"Penggaris 30cm Plastik",      kat:"Alat Tulis",         hpp:1500, harga:3500,  stok:70,  min:20, disc:0,  supplier:"PT Joyko" },
    { barcode:"8999999130006", nama:"Glue Stick UHU 21gr",         kat:"Alat Tulis",         hpp:3000, harga:6000,  stok:55,  min:15, disc:0,  supplier:"PT Sinar Dunia" },
  ],

  members: [
    { no:"0812345678", nama:"Ahmad Fauzi",    tier:"Gold",   poin:3240, trx:48 },
    { no:"0857123456", nama:"Dewi Rahayu",    tier:"Silver", poin:1180, trx:22 },
    { no:"0821987654", nama:"Rudi Hartono",   tier:"Silver", poin:890,  trx:15 },
    { no:"0895432100", nama:"Sari Wulandari", tier:"Gold",   poin:5100, trx:91 },
    { no:"6012345678", nama:"Budi Setiawan",  tier:"Silver", poin:420,  trx:8  },
  ],

  promos: [
    { id:1, nama:"Promo Akhir Bulan",   produk:"Chitato Sapi Panggang 68g",   disc:10, berlaku:"2026-06-30", aktif:true },
    { id:2, nama:"Diskon Minuman",      produk:"Teh Botol Sosro 450ml",       disc:5,  berlaku:"2026-06-25", aktif:true },
    { id:3, nama:"Flash Sale Snack",    produk:"Pringles Original 107g",      disc:15, berlaku:"2026-06-15", aktif:true },
    { id:4, nama:"Promo Susu Keluarga", produk:"Susu Ultra Full Cream 250ml", disc:8,  berlaku:"2026-07-01", aktif:true },
  ],

  kasirList: [
    { id:"KASIR001", nama:"Siti Rahayu",  shift:"Pagi",  trxHari:12, total:"Rp 847.500" },
    { id:"KASIR002", nama:"Budi Santoso", shift:"Sore",  trxHari:8,  total:"Rp 612.000" },
    { id:"KASIR003", nama:"Rina Astuti",  shift:"Malam", trxHari:5,  total:"Rp 328.500" },
  ],

  penerimaan: [
    { sj:"SJ-2026-0081", tgl:"2026-06-12", supplier:"PT Indofood CBP",          produk:"Indomie Goreng 85g",      qty:200, hpp:2500, kondisi:"Baik" },
    { sj:"SJ-2026-0080", tgl:"2026-06-11", supplier:"PT Indomarco Prismatama",  produk:"Aqua Botol 600ml",        qty:300, hpp:2500, kondisi:"Baik" },
    { sj:"SJ-2026-0079", tgl:"2026-06-10", supplier:"PT Unilever Indonesia",    produk:"Sabun Lifebuoy 65g",      qty:50,  hpp:4500, kondisi:"Baik" },
  ],

  retur: [
    { id:"RTR-001", trx:"TRX-20260610-015", produk:"Roti Tawar Sari Roti", qty:2, alasan:"Produk Kadaluarsa", ket:"ED: 12 Juni 2026", tgl:"2026-06-12" },
  ],

  transaksi: [],
  trxCounter: 1,

  // ═══ AUDIT LOG ═══
  auditLog: [
    { id:1, waktu:"2026-06-14 08:15:00", user:"KASIR001", aksi:"LOGIN", detail:"Kasir login", status:"success" },
    { id:2, waktu:"2026-06-14 08:45:30", user:"KASIR001", aksi:"TRANSAKSI", detail:"Penjualan Rp 25.000", status:"success" },
    { id:3, waktu:"2026-06-14 09:20:15", user:"MGR001", aksi:"LOGIN", detail:"Manager login", status:"success" },
  ],
  auditCounter: 4,

  // ═══ STOCK OPNAME ═══
  stockOpname: [
    { id:"SO-20260614-001", tgl:"2026-06-14", user:"MGR001", status:"Selesai", total:2150, selisih:"+15 item" },
    { id:"SO-20260613-001", tgl:"2026-06-13", user:"MGR001", status:"Selesai", total:2135, selisih:"-8 item" },
  ],
  opnameCounter: 3,
  opnameDetail: [], // Detail per produk saat opname
};

/**
 * Sync discount dari promo ke produk
 */
function syncPromoDisc() {
  DB.produk.forEach(p => {
    const promo = DB.promos.find(pr => pr.aktif && pr.produk === p.nama);
    if (promo) p.disc = promo.disc;
  });
}

// Jalankan sync saat file dimuat
syncPromoDisc();

/**
 * HELPER: Add Audit Log
 */
function addAuditLog(user, aksi, detail, status='success') {
  DB.auditLog.push({
    id: DB.auditCounter++,
    waktu: new Date().toISOString().slice(0,19).replace('T', ' '),
    user: user || 'SYSTEM',
    aksi: aksi,
    detail: detail,
    status: status
  });
}
