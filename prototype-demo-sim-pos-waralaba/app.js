/**
 * ═════════════════════════════════════════════
 * APLIKASI SISTEM POS INDOMARET - LOGIC
 * ═════════════════════════════════════════════
 */

// ═══ STATE ═══
let state = {
  role: null, user: null,
  cart: [], member: null,
  payMethod: 'tunai', cashInput: 0,
  trxToday: 0, totalToday: 0,
  holdCart: null,
};

// ═══ FORMAT HELPERS ═══
const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");
const fmtShort = n => n >= 1000000 ? (n/1000000).toFixed(1)+"jt" : n >= 1000 ? (n/1000).toFixed(0)+"rb" : n;
const today = () => new Date().toISOString().slice(0,10);
const nowTime = () => new Date().toTimeString().slice(0,8);
const trxId = () => "TRX-"+today().replace(/-/g,"")+"-"+String(DB.trxCounter).padStart(3,"0");

// ═══ CLOCK UPDATE ═══
setInterval(() => {
  const t = new Date().toLocaleTimeString("id-ID", {hour12:false});
  const el = document.getElementById("k-clock");
  if (el) el.textContent = t;
}, 1000);

// ═══════════════════════════════════════════
// LOGIN FUNCTIONS
// ═══════════════════════════════════════════

let selectedRole = 'kasir';

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-tab').forEach((t,i) => 
    t.classList.toggle('active', (i===0&&role==='kasir')||(i===1&&role==='manager')));
  document.getElementById('login-user').value = role === 'kasir' ? 'KASIR001' : 'MGR001';
}

function doLogin() {
  const uid = document.getElementById('login-user').value.trim();
  const pwd = document.getElementById('login-pass').value;
  const gerai = document.getElementById('login-gerai').value;
  const user = DB.users.find(u => u.id === uid && u.pass === pwd);
  
  if (!user) { 
    toast("ID atau password salah!", "error"); 
    return; 
  }
  if (selectedRole === 'kasir' && user.role !== 'kasir') { 
    toast("Akun ini bukan kasir!", "error"); 
    return; 
  }
  if (selectedRole === 'manager' && user.role !== 'manager') { 
    toast("Akun ini bukan manager!", "error"); 
    return; 
  }
  
  state.role = user.role; 
  state.user = user;
  DB.gerai = gerai;
  
  document.getElementById('k-gerai').textContent = gerai;
  document.getElementById('k-user').textContent = uid;
  document.getElementById('mgr-user').textContent = uid;
  
  // Add audit log
  addAuditLog(uid, 'LOGIN', `User ${user.nama} login sebagai ${user.role}`, 'success');
  
  showScreen(user.role === 'kasir' ? 'kasir-screen' : 'manager-screen');
  
  if (user.role === 'kasir') { 
    initKasir(); 
  } else { 
    initManager(); 
  }
  
  toast("Selamat datang, " + user.nama + "!", "success");
}

function doLogout() {
  addAuditLog(state.user.id, 'LOGOUT', `User ${state.user.nama} logout`, 'success');
  state = { 
    role:null, user:null, cart:[], member:null, payMethod:'tunai', cashInput:0, 
    trxToday:state.trxToday, totalToday:state.totalToday, holdCart:null 
  };
  showScreen('login-screen');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════
// KASIR MODULE
// ═══════════════════════════════════════════

function initKasir() {
  updateTrxNo();
  updateCart();
  generateQuickAmounts();
  document.getElementById('scan-input').focus();
}

function updateTrxNo() {
  document.getElementById('k-trxno').textContent = trxId();
}

// ─── SCAN PRODUCT ───
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && state.role === 'kasir') {
    const si = document.getElementById('scan-input');
    if (document.activeElement === si) scanProduct();
  }
});

function scanProduct() {
  const input = document.getElementById('scan-input');
  const code = input.value.trim();
  if (!code) return;

  // Search by barcode or partial name
  let produk = DB.produk.find(p => p.barcode === code);
  if (!produk) produk = DB.produk.find(p => p.nama.toLowerCase().includes(code.toLowerCase()));
  
  if (!produk) { 
    toast("Produk tidak ditemukan: " + code, "error"); 
    input.value = ""; 
    return; 
  }
  if (produk.stok <= 0) { 
    toast("Stok habis: " + produk.nama, "error"); 
    input.value = ""; 
    return; 
  }

  // Check cart
  const idx = state.cart.findIndex(c => c.barcode === produk.barcode);
  if (idx >= 0) {
    if (state.cart[idx].qty >= produk.stok) { 
      toast("Stok tidak cukup!", "error"); 
      input.value=""; 
      return; 
    }
    state.cart[idx].qty++;
  } else {
    state.cart.push({ ...produk, qty:1 });
  }
  
  input.value = "";
  updateCart();
  toast(produk.nama + " ditambahkan", "success");
  input.focus();
}

function changeQty(idx, delta) {
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
  updateCart();
}

function removeItem(idx) {
  state.cart.splice(idx, 1);
  updateCart();
}

// ─── UPDATE CART ───
function updateCart() {
  const tbody = document.getElementById('item-tbody');
  const table = document.getElementById('item-table');
  const empty = document.getElementById('empty-cart');
  tbody.innerHTML = '';

  if (state.cart.length === 0) {
    empty.style.display = 'block'; 
    table.style.display = 'none';
    document.getElementById('btn-process').disabled = true;
    updateTotals(0,0,0);
    return;
  }
  
  empty.style.display = 'none'; 
  table.style.display = '';
  document.getElementById('btn-process').disabled = false;

  let subTotal=0, totalDisc=0;
  state.cart.forEach((item, i) => {
    const discAmt = Math.round(item.harga * item.disc / 100);
    const finalPrice = item.harga - discAmt;
    const sub = finalPrice * item.qty;
    subTotal += item.harga * item.qty;
    totalDisc += discAmt * item.qty;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-no">${i+1}</td>
      <td class="td-name">${item.nama}${item.disc>0?'<span class="badge-promo">PROMO -'+item.disc+'%</span>':''}</td>
      <td class="td-barcode">${item.barcode.slice(-6)}</td>
      <td class="td-qty"><div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
      </div></td>
      <td class="td-price">${fmt(finalPrice)}${item.disc>0?'<br><small class="td-disc">Hemat '+fmt(discAmt)+'</small>':''}</td>
      <td class="td-sub">${fmt(sub)}</td>
      <td><button class="btn-del" onclick="removeItem(${i})">✕</button></td>`;
    tbody.appendChild(tr);
  });

  const memberDisc = state.member ? Math.round((subTotal-totalDisc)*0.02) : 0;
  const total = subTotal - totalDisc - memberDisc;
  updateTotals(subTotal, totalDisc, memberDisc, total);
  updateQrisAmount(total);
  calcChange();
}

function updateTotals(sub, disc, memberDisc, total=0) {
  const qty = state.cart.reduce((a,c)=>a+c.qty,0);
  document.getElementById('t-qty').textContent = qty;
  document.getElementById('t-sub').textContent = fmt(sub);
  document.getElementById('t-disc').textContent = disc>0 ? '– '+fmt(disc) : 'Rp 0';
  document.getElementById('t-member-disc').textContent = memberDisc>0 ? '– '+fmt(memberDisc)+' (2% member)' : 'Rp 0';
  document.getElementById('t-total').textContent = fmt(total || sub-disc-memberDisc);
}

function getTotal() {
  let sub=0, disc=0;
  state.cart.forEach(item => {
    const d = Math.round(item.harga*item.disc/100)*item.qty;
    sub += item.harga*item.qty; 
    disc += d;
  });
  const memberDisc = state.member ? Math.round((sub-disc)*0.02) : 0;
  return sub-disc-memberDisc;
}

// ─── MEMBER ───
function addMember() {
  const input = document.getElementById('member-input').value.trim();
  const m = DB.members.find(mb => mb.no === input || mb.nama.toLowerCase().includes(input.toLowerCase()));
  
  if (!m) { 
    toast("Member tidak ditemukan", "error"); 
    return; 
  }
  
  state.member = m;
  renderMemberCard(m);
  updateCart();
  toast("Member: " + m.nama + " (" + m.tier + ")", "success");
}

function renderMemberCard(m) {
  const mult = m.tier === 'Gold' ? 2 : 1;
  document.getElementById('member-display').innerHTML = `
    <div class="member-card">
      <div class="mc-name">${m.nama}</div>
      <div class="mc-no">${m.no}</div>
      <div class="mc-row"><span>Poin Saldo</span><span class="mc-val">${m.poin.toLocaleString('id-ID')}</span></div>
      <div class="mc-row"><span>${m.tier} · ${mult}× poin</span>
        <span style="font-size:10px;opacity:.8">+${Math.round(getTotal()/200*mult)} poin akan ditambah</span></div>
    </div>
    <div style="margin-top:6px; display:flex; justify-content:flex-end">
      <button onclick="removeMember()" style="font-size:10px; background:none; border:1px solid #ffaaaa; color:var(--red); border-radius:4px; padding:3px 8px; cursor:pointer">✕ Hapus Member</button>
    </div>`;
}

function removeMember() {
  state.member = null;
  document.getElementById('member-display').innerHTML = `
    <div class="member-no-card">
      <p>Belum ada member</p>
      <div class="member-input-row">
        <input id="member-input" type="text" placeholder="No. HP / Kartu member">
        <button onclick="addMember()">Cek</button>
      </div>
    </div>`;
  updateCart();
}

// ─── PAYMENT ───
function selectPayMethod(m) {
  state.payMethod = m;
  ['tunai','debit','qris','ewallet'].forEach(pm => {
    document.getElementById('pm-'+pm).classList.toggle('active', pm===m);
    document.getElementById('pay-detail-'+pm).style.display = pm===m?'':'none';
  });
}

function generateQuickAmounts() {
  const amounts = [5000,10000,20000,50000,100000];
  const wrap = document.getElementById('quick-amounts');
  wrap.innerHTML = amounts.map(a=>`<button class="quick-btn" onclick="setQuick(${a})">${fmtShort(a)}</button>`).join('');
}

function setQuick(amt) {
  const total = getTotal();
  const rounded = Math.ceil(total/amt)*amt;
  document.getElementById('cash-input').value = fmt(rounded);
  calcChange();
}

function calcChange() {
  const raw = document.getElementById('cash-input').value.replace(/[^0-9]/g,'');
  const paid = parseInt(raw)||0;
  const total = getTotal();
  const change = paid - total;
  const row = document.getElementById('kembalian-row');
  const val = document.getElementById('kembalian-val');
  
  if (paid === 0) { 
    val.textContent = '–'; 
    row.className='kembalian-row'; 
    return; 
  }
  
  val.textContent = fmt(Math.abs(change));
  row.className = 'kembalian-row' + (change < 0 ? ' kurang' : '');
  val.style.color = change < 0 ? 'var(--red)' : 'var(--green)';
}

function updateQrisAmount(total) {
  const el = document.getElementById('qris-amount');
  if (el) el.textContent = fmt(total);
}

// ─── PROCESS PAYMENT ───
function processPayment() {
  const total = getTotal();
  if (state.cart.length === 0) { 
    toast("Keranjang kosong!", "error"); 
    return; 
  }

  // Validate tunai
  if (state.payMethod === 'tunai') {
    const raw = document.getElementById('cash-input').value.replace(/[^0-9]/g,'');
    const paid = parseInt(raw)||0;
    if (paid < total) { 
      toast("Uang yang diterima kurang!", "error"); 
      return; 
    }
  }

  // Deduct stock
  state.cart.forEach(item => {
    const p = DB.produk.find(p=>p.barcode===item.barcode);
    if (p) p.stok = Math.max(0, p.stok - item.qty);
  });

  // Add poin to member
  if (state.member) {
    const mult = state.member.tier === 'Gold' ? 2 : 1;
    const poinTambah = Math.round(total/200*mult);
    const m = DB.members.find(mb=>mb.no===state.member.no);
    if (m) { 
      m.poin += poinTambah; 
      m.trx++; 
    }
    state.member.poin += poinTambah;
  }

  // Save transaction
  const trx = {
    id: trxId(), 
    waktu: today()+" "+nowTime(),
    kasir: state.user.id, 
    kasirNama: state.user.nama,
    items: [...state.cart], 
    member: state.member ? state.member.nama : '-',
    total, 
    payMethod: state.payMethod,
    bayar: state.payMethod==='tunai' ? parseInt(document.getElementById('cash-input').value.replace(/[^0-9]/g,''))||total : total,
    kembalian: state.payMethod==='tunai' ? Math.max(0, (parseInt(document.getElementById('cash-input').value.replace(/[^0-9]/g,''))||total) - total) : 0,
  };
  
  DB.transaksi.push(trx);
  DB.trxCounter++;
  state.trxToday++;
  state.totalToday += total;

  // Add audit log
  const memberInfo = state.member ? ` (Member: ${state.member.nama})` : '';
  addAuditLog(state.user.id, 'TRANSAKSI', `Penjualan ${fmt(total)}${memberInfo} - ${trx.items.length} item`, 'success');

  // Show struk
  showStruk(trx);
  document.getElementById('k-trxcount').textContent = 'Transaksi hari ini: ' + state.trxToday;
}

function showStruk(trx) {
  const cash = trx.payMethod === 'tunai';
  const memberDisc = state.member ? Math.round(trx.items.reduce((a,c)=>{
    const d=Math.round(c.harga*c.disc/100)*c.qty; 
    return a+c.harga*c.qty-d;
  },0)*0.02) : 0;
  
  const subDisc = trx.items.reduce((a,c)=>a+Math.round(c.harga*c.disc/100)*c.qty,0);
  
  let rows = trx.items.map(it=>{
    const d=Math.round(it.harga*it.disc/100); 
    const fp=it.harga-d;
    return `<div class="struk-row"><span>${it.nama} ${it.qty}x${fmt(fp)}</span><span>${fmt(fp*it.qty)}</span></div>`+
           (d>0?`<div class="struk-row indent"><span>  Diskon -${it.disc}%</span><span class="td-disc">-${fmt(d*it.qty)}</span></div>`:'');
  }).join('');
  
  const pm = {tunai:'Tunai',debit:'Debit/Kredit',qris:'QRIS',ewallet:'E-Wallet'}[trx.payMethod];
  const poinTambah = state.member ? Math.round(trx.total/200*(state.member.tier==='Gold'?2:1)) : 0;
  
  document.getElementById('struk-content').innerHTML = `
    <div class="struk">
      <div class="struk-header">
        <div class="struk-brand">INDOMARET</div>
        <div>${DB.gerai}</div>
        <div>${trx.waktu}</div>
        <div>No: ${trx.id}</div>
        <div>Kasir: ${trx.kasir} – ${trx.kasirNama}</div>
      </div>
      <hr>${rows}<hr>
      <div class="struk-row"><span>Subtotal</span><span>${fmt(trx.items.reduce((a,c)=>a+c.harga*c.qty,0))}</span></div>
      ${subDisc>0?`<div class="struk-row"><span>Diskon Produk</span><span>-${fmt(subDisc)}</span></div>`:''}
      ${memberDisc>0?`<div class="struk-row"><span>Diskon Member (2%)</span><span>-${fmt(memberDisc)}</span></div>`:''}
      <div class="struk-row struk-total"><span>TOTAL</span><span>${fmt(trx.total)}</span></div>
      <hr>
      <div class="struk-row"><span>Metode Bayar</span><span>${pm}</span></div>
      ${cash?`<div class="struk-row"><span>Tunai</span><span>${fmt(trx.bayar)}</span></div><div class="struk-row"><span>Kembalian</span><span>${fmt(trx.kembalian)}</span></div>`:''}
      ${state.member?`<hr><div class="struk-row"><span>Member</span><span>${state.member.nama}</span></div>
      <div class="struk-row"><span>Poin diperoleh</span><span>+${poinTambah}</span></div>
      <div class="struk-row"><span>Total poin</span><span>${state.member.poin}</span></div>`:''}
      <div class="struk-footer"><hr>Terima kasih telah berbelanja di Indomaret!<br>Barang yang sudah dibeli tidak dapat ditukar<br>kecuali kerusakan produk disertai struk.</div>
    </div>`;
  
  document.getElementById('modal-struk').classList.add('active');
}

function printStruk() {
  const content = document.getElementById('struk-content').innerHTML;
  const w = window.open('','_blank','width=400,height=600');
  w.document.write('<html><head><title>Struk</title><style>body{font-family:Courier New,monospace;font-size:12px;padding:16px;} .struk-row{display:flex;justify-content:space-between;} .struk-header{text-align:center;} .struk-brand{font-size:16px;font-weight:700;letter-spacing:2px;} hr{border-top:1px dashed #999;margin:6px 0;} .struk-total{font-weight:700;} .struk-footer{text-align:center;font-size:11px;color:#666;} .indent{padding-left:12px;} .td-disc{color:#cc0000;} </style></head><body>'+content+'</body></html>');
  w.document.close(); 
  w.print();
}

function newTransaction() {
  state.cart = []; 
  state.member = null; 
  state.payMethod = 'tunai';
  document.getElementById('cash-input').value = '';
  document.getElementById('kembalian-val').textContent = '–';
  selectPayMethod('tunai');
  removeMember();
  updateCart();
  updateTrxNo();
  document.getElementById('scan-input').focus();
}

function holdTransaction() {
  if (state.cart.length===0) { 
    toast("Keranjang kosong!","error"); 
    return; 
  }
  state.holdCart = [...state.cart];
  state.cart = []; 
  updateCart();
  toast("Transaksi ditahan. Pelanggan berikutnya.","info");
}

function cancelTransaction() {
  if (state.cart.length===0 && !state.holdCart) return;
  if (!confirm("Batalkan transaksi ini?")) return;
  state.cart=[]; 
  state.holdCart=null; 
  state.member=null;
  removeMember(); 
  updateCart(); 
  updateTrxNo();
  toast("Transaksi dibatalkan.","error");
}

// ═══════════════════════════════════════════
// MANAGER MODULE
// ═══════════════════════════════════════════

function initManager() {
  renderDashboard();
  renderLaporan();
  renderProdukTable();
  renderStok();
  renderPenerimaan();
  renderMemberTable();
  renderRetur();
  renderKasirMgr();
  renderPromo();
}

function mgrPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ─── DASHBOARD ───
function renderDashboard() {
  const totalTrx = DB.transaksi.length + 25;
  const totalPend = DB.transaksi.reduce((a,t)=>a+t.total,0) + 4250000;
  const totalItem = DB.produk.reduce((a,p)=>a+p.stok,0);
  const totalMbr = DB.members.length;
  
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card red"><div class="stat-label">Total Transaksi Hari Ini</div><div class="stat-value">${totalTrx}</div><div class="stat-sub">+${DB.transaksi.length} dari sesi ini</div></div>
    <div class="stat-card green"><div class="stat-label">Pendapatan Hari Ini</div><div class="stat-value">${fmt(totalPend)}</div><div class="stat-sub">Target: Rp 6.000.000</div></div>
    <div class="stat-card blue"><div class="stat-label">Total Item di Stok</div><div class="stat-value">${totalItem}</div><div class="stat-sub">${DB.produk.filter(p=>p.stok<=p.min).length} produk stok menipis</div></div>
    <div class="stat-card gold"><div class="stat-label">Total Member Aktif</div><div class="stat-value">${totalMbr}</div><div class="stat-sub">Poin beredar: ${DB.members.reduce((a,m)=>a+m.poin,0).toLocaleString('id-ID')}</div></div>`;

  // Chart
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const sales = [4.2,3.8,5.1,4.7,6.2,7.8,5.5];
  const max = Math.max(...sales);
  
  document.getElementById('chart-bars').innerHTML = days.map((d,i)=>`
    <div class="chart-bar-wrap">
      <div class="chart-bar-val">${sales[i]}jt</div>
      <div class="chart-bar" style="height:${(sales[i]/max*100)}px"></div>
      <div class="chart-bar-label">${d}</div>
    </div>`).join('');

  // Low stock
  const low = DB.produk.filter(p=>p.stok<=p.min);
  document.getElementById('low-stock-table').innerHTML =
    '<tr><th>Produk</th><th>Stok</th><th>Min</th></tr>'+
    low.map(p=>`<tr><td>${p.nama}</td><td class="stock-low">${p.stok}</td><td>${p.min}</td></tr>`).join('');

  // Recent trx
  const recent = DB.transaksi.slice(-5).reverse();
  document.getElementById('recent-trx-table').innerHTML =
    '<tr><th>ID Transaksi</th><th>Waktu</th><th>Kasir</th><th>Member</th><th>Total</th><th>Metode</th></tr>'+
    (recent.length?recent.map(t=>`<tr><td><code>${t.id}</code></td><td>${t.waktu.slice(11)}</td><td>${t.kasir}</td><td>${t.member}</td><td>${fmt(t.total)}</td><td><span class="badge-tag blue">${t.payMethod}</span></td></tr>`).join(''):
    '<tr><td colspan="6" style="text-align:center;color:var(--gray4);padding:20px">Belum ada transaksi di sesi ini</td></tr>');
}

// ─── LAPORAN ───
function renderLaporan() {
  const rows = DB.transaksi.length ? DB.transaksi.map(t=>`<tr>
    <td><code>${t.id}</code></td><td>${t.waktu}</td><td>${t.kasirNama}</td>
    <td>${t.items.length} item</td><td>${t.member}</td>
    <td>${fmt(t.total)}</td><td><span class="badge-tag blue">${t.payMethod}</span></td>
  </tr>`).join('') :
  '<tr><td colspan="7" style="text-align:center;color:var(--gray4);padding:20px">Belum ada transaksi hari ini. Lakukan transaksi di mode Kasir.</td></tr>';
  
  document.getElementById('laporan-table').innerHTML =
    '<tr><th>ID</th><th>Waktu</th><th>Kasir</th><th>Item</th><th>Member</th><th>Total</th><th>Metode</th></tr>'+rows;

  // Top produk
  const topProduk = [...DB.produk].sort((a,b)=>b.stok-a.stok).slice(0,10);
  document.getElementById('top-produk-table').innerHTML =
    '<tr><th>#</th><th>Produk</th><th>Kategori</th><th>Harga Jual</th><th>Stok Tersisa</th></tr>'+
    topProduk.map((p,i)=>`<tr><td>${i+1}</td><td>${p.nama}</td><td><span class="badge-tag gold">${p.kat}</span></td><td>${fmt(p.harga)}</td><td>${p.stok}</td></tr>`).join('');
}

function exportLaporan() {
  exportLaporanToCSV();
}

// ─── PRODUK ───
function renderProdukTable(filter='') {
  const data = filter ? DB.produk.filter(p=>p.nama.toLowerCase().includes(filter)||p.barcode.includes(filter)) : DB.produk;
  
  document.getElementById('produk-table').innerHTML =
    `<tr><th>Barcode</th><th>Nama Produk</th><th>Kategori</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok</th><th>Diskon</th><th>Aksi</th></tr>`+
    data.map((p,i)=>`<tr>
      <td><code>${p.barcode}</code></td><td>${p.nama}</td><td><span class="badge-tag gold">${p.kat}</span></td>
      <td>${fmt(p.hpp)}</td><td>${fmt(p.harga)}</td>
      <td class="${p.stok<=p.min?'stock-low':'stock-ok'}">${p.stok}</td>
      <td>${p.disc>0?`<span class="badge-tag red">${p.disc}%</span>`:'–'}</td>
      <td>
        <button onclick="editProduk(${DB.produk.indexOf(p)})" style="background:none;border:1px solid var(--gray5);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;">✏ Edit</button>
        <button onclick="deleteProduk(${DB.produk.indexOf(p)})" style="background:none;border:1px solid #ffaaaa;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;color:var(--red);margin-left:4px;">✕</button>
      </td>
    </tr>`).join('');
}

function filterProduk() { 
  renderProdukTable(document.getElementById('produk-search').value.toLowerCase()); 
}

function openAddProduk() {
  document.getElementById('edit-produk-idx').value = -1;
  document.getElementById('modal-produk-title').innerHTML = 'Tambah Produk Baru <button class="modal-close" onclick="closeModal(\'modal-produk\')">✕</button>';
  ['barcode','name','hpp','price','stok','min','disc'].forEach(f=>document.getElementById('fp-'+f).value='');
  document.getElementById('modal-produk').classList.add('active');
}

function editProduk(idx) {
  const p = DB.produk[idx];
  document.getElementById('edit-produk-idx').value = idx;
  document.getElementById('modal-produk-title').innerHTML = 'Edit Produk <button class="modal-close" onclick="closeModal(\'modal-produk\')">✕</button>';
  document.getElementById('fp-barcode').value = p.barcode;
  document.getElementById('fp-name').value = p.nama;
  document.getElementById('fp-hpp').value = p.hpp;
  document.getElementById('fp-price').value = p.harga;
  document.getElementById('fp-stok').value = p.stok;
  document.getElementById('fp-min').value = p.min;
  document.getElementById('fp-disc').value = p.disc;
  document.getElementById('modal-produk').classList.add('active');
}

function saveProduk() {
  const idx = parseInt(document.getElementById('edit-produk-idx').value);
  const data = {
    barcode: document.getElementById('fp-barcode').value,
    nama: document.getElementById('fp-name').value,
    kat: document.getElementById('fp-cat').value,
    hpp: parseInt(document.getElementById('fp-hpp').value)||0,
    harga: parseInt(document.getElementById('fp-price').value)||0,
    stok: parseInt(document.getElementById('fp-stok').value)||0,
    min: parseInt(document.getElementById('fp-min').value)||10,
    disc: parseInt(document.getElementById('fp-disc').value)||0,
    supplier: document.getElementById('fp-supplier').value,
  };
  
  if (!data.barcode||!data.nama||!data.harga) { 
    toast("Lengkapi data produk!","error"); 
    return; 
  }
  
  if (idx >= 0) { 
    DB.produk[idx] = data; 
    toast("Produk diperbarui!","success"); 
  } else { 
    DB.produk.push(data); 
    toast("Produk baru ditambahkan!","success"); 
  }
  
  closeModal('modal-produk'); 
  renderProdukTable(); 
  renderStok(); 
  renderDashboard();
}

function deleteProduk(idx) {
  if (!confirm("Hapus produk: "+DB.produk[idx].nama+"?")) return;
  DB.produk.splice(idx,1); 
  renderProdukTable(); 
  renderStok();
  toast("Produk dihapus","error");
}

// ─── STOK ───
function renderStok() {
  document.getElementById('stok-table').innerHTML =
    '<tr><th>Barcode</th><th>Nama Produk</th><th>Kategori</th><th>Stok</th><th>Min</th><th>Status</th><th>Supplier</th></tr>'+
    DB.produk.map(p=>`<tr>
      <td><code>${p.barcode}</code></td><td>${p.nama}</td>
      <td><span class="badge-tag gold">${p.kat}</span></td>
      <td class="${p.stok<=p.min?'stock-low':'stock-ok'}">${p.stok}</td>
      <td>${p.min}</td>
      <td><span class="badge-tag ${p.stok<=0?'red':p.stok<=p.min?'gold':'green'}">${p.stok<=0?'Habis':p.stok<=p.min?'Menipis':'Aman'}</span></td>
      <td style="font-size:11px;color:var(--gray4)">${p.supplier}</td>
    </tr>`).join('');
}

// ─── PENERIMAAN ───
function renderPenerimaan() {
  document.getElementById('penerimaan-table').innerHTML =
    '<tr><th>No. SJ</th><th>Tanggal</th><th>Supplier</th><th>Produk</th><th>Qty</th><th>HPP/Unit</th><th>Total</th><th>Kondisi</th></tr>'+
    DB.penerimaan.map(pn=>`<tr>
      <td><code>${pn.sj}</code></td><td>${pn.tgl}</td><td>${pn.supplier}</td>
      <td>${pn.produk}</td><td>${pn.qty}</td><td>${fmt(pn.hpp)}</td>
      <td>${fmt(pn.qty*pn.hpp)}</td>
      <td><span class="badge-tag ${pn.kondisi==='Baik'?'green':'red'}">${pn.kondisi}</span></td>
    </tr>`).join('');
}

function openPenerimaan() {
  document.getElementById('pn-tgl').value = today();
  const sel = document.getElementById('pn-produk');
  sel.innerHTML = DB.produk.map(p=>`<option value="${p.barcode}">${p.nama}</option>`).join('');
  document.getElementById('modal-penerimaan').classList.add('active');
}

function savePenerimaan() {
  const sj = document.getElementById('pn-sj').value;
  const tgl = document.getElementById('pn-tgl').value;
  const sup = document.getElementById('pn-sup').value;
  const barcode = document.getElementById('pn-produk').value;
  const qty = parseInt(document.getElementById('pn-qty').value)||0;
  const hpp = parseInt(document.getElementById('pn-hpp').value)||0;
  const kondisi = document.getElementById('pn-kondisi').value;
  
  if (!sj||!qty) { 
    toast("Lengkapi data!","error"); 
    return; 
  }
  
  const p = DB.produk.find(pd=>pd.barcode===barcode);
  if (p && kondisi==='Baik') p.stok += qty;
  
  DB.penerimaan.unshift({ sj, tgl, supplier:sup, produk:p?p.nama:barcode, qty, hpp, kondisi });
  closeModal('modal-penerimaan'); 
  renderPenerimaan(); 
  renderStok(); 
  renderDashboard();
  toast("Penerimaan dicatat. Stok diperbarui!","success");
}

// ─── MEMBER ───
function renderMemberTable() {
  document.getElementById('member-table').innerHTML =
    '<tr><th>No. HP / Kartu</th><th>Nama</th><th>Tier</th><th>Poin</th><th>Total Transaksi</th></tr>'+
    DB.members.map(m=>`<tr>
      <td><code>${m.no}</code></td><td>${m.nama}</td>
      <td><span class="badge-tag ${m.tier==='Gold'?'gold':'blue'}">${m.tier}</span></td>
      <td>${m.poin.toLocaleString('id-ID')}</td><td>${m.trx}x</td></tr>`).join('');
}

// ─── RETUR ───
function renderRetur() {
  document.getElementById('retur-table').innerHTML =
    '<tr><th>ID Retur</th><th>Tanggal</th><th>No. Transaksi</th><th>Produk</th><th>Qty</th><th>Alasan</th><th>Keterangan</th></tr>'+
    DB.retur.map(r=>`<tr>
      <td><code>${r.id}</code></td><td>${r.tgl}</td>
      <td><code>${r.trx}</code></td><td>${r.produk}</td><td>${r.qty}</td>
      <td><span class="badge-tag red">${r.alasan}</span></td><td style="font-size:11px;color:var(--gray4)">${r.ket}</td>
    </tr>`).join('');
}

function openRetur() {
  const sel = document.getElementById('rt-produk');
  sel.innerHTML = DB.produk.map(p=>`<option>${p.nama}</option>`).join('');
  document.getElementById('modal-retur').classList.add('active');
}

function saveRetur() {
  const trx = document.getElementById('rt-trx').value;
  const produk = document.getElementById('rt-produk').value;
  const qty = parseInt(document.getElementById('rt-qty').value)||0;
  const alasan = document.getElementById('rt-alasan').value;
  const ket = document.getElementById('rt-ket').value;
  
  if (!trx||!qty) { 
    toast("Lengkapi data retur!","error"); 
    return; 
  }
  
  const id = "RTR-"+String(DB.retur.length+1).padStart(3,"0");
  DB.retur.unshift({ id, trx, produk, qty, alasan, ket, tgl:today() });
  
  // Return to stock if valid
  const p = DB.produk.find(pd=>pd.nama===produk);
  if (p && alasan!=='Produk Kadaluarsa') p.stok += qty;
  
  closeModal('modal-retur'); 
  renderRetur(); 
  renderStok();
  toast("Retur berhasil dicatat!","success");
}

// ─── KASIR MGR ───
function renderKasirMgr() {
  document.getElementById('kasir-mgr-table').innerHTML =
    '<tr><th>ID Kasir</th><th>Nama</th><th>Shift</th><th>Trx Hari Ini</th><th>Total Penjualan</th><th>Status</th></tr>'+
    DB.kasirList.map(k=>`<tr>
      <td><code>${k.id}</code></td><td>${k.nama}</td>
      <td><span class="badge-tag blue">${k.shift}</span></td>
      <td>${k.trxHari}</td><td>${k.total}</td>
      <td><span class="badge-tag green">Aktif</span></td>
    </tr>`).join('');
}

// ─── PROMO ───
function renderPromo() {
  document.getElementById('promo-table').innerHTML =
    '<tr><th>ID</th><th>Nama Promosi</th><th>Produk</th><th>Diskon</th><th>Berlaku Hingga</th><th>Status</th><th>Aksi</th></tr>'+
    DB.promos.map(pr=>`<tr>
      <td>${pr.id}</td><td>${pr.nama}</td><td>${pr.produk}</td>
      <td><span class="badge-tag red">${pr.disc}%</span></td><td>${pr.berlaku}</td>
      <td><span class="badge-tag ${pr.aktif?'green':'red'}">${pr.aktif?'Aktif':'Nonaktif'}</span></td>
      <td><button onclick="togglePromo(${pr.id-1})" style="background:none;border:1px solid var(--gray5);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;">${pr.aktif?'Nonaktifkan':'Aktifkan'}</button></td>
    </tr>`).join('');
}

function openPromo() {
  const sel = document.getElementById('pr-produk');
  sel.innerHTML = DB.produk.map(p=>`<option>${p.nama}</option>`).join('');
  document.getElementById('pr-tgl').value = today();
  document.getElementById('modal-promo').classList.add('active');
}

function savePromo() {
  const nama = document.getElementById('pr-nama').value;
  const produk = document.getElementById('pr-produk').value;
  const disc = parseInt(document.getElementById('pr-disc').value)||0;
  const tgl = document.getElementById('pr-tgl').value;
  
  if (!nama||!disc) { 
    toast("Lengkapi data promosi!","error"); 
    return; 
  }
  
  const id = DB.promos.length+1;
  DB.promos.push({ id, nama, produk, disc, berlaku:tgl, aktif:true });
  
  const p = DB.produk.find(pd=>pd.nama===produk);
  if (p) p.disc = disc;
  
  closeModal('modal-promo'); 
  renderPromo(); 
  renderProdukTable();
  toast("Promosi ditambahkan!","success");
}

function togglePromo(idx) {
  DB.promos[idx].aktif = !DB.promos[idx].aktif;
  
  // Update disc in produk
  const pr = DB.promos[idx];
  const p = DB.produk.find(pd=>pd.nama===pr.produk);
  if (p) p.disc = pr.aktif ? pr.disc : 0;
  
  renderPromo(); 
  renderProdukTable();
  toast(pr.aktif?"Promosi diaktifkan":"Promosi dinonaktifkan", pr.aktif?"success":"error");
}

// ═══════════════════════════════════════════
// MODAL & TOAST UTILITIES
// ═══════════════════════════════════════════

function closeModal(id) { 
  document.getElementById(id).classList.remove('active'); 
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { 
    if (e.target===m) m.classList.remove('active'); 
  });
});

function toast(msg, type='info') {
  const cont = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.textContent = msg;
  cont.appendChild(el);
  setTimeout(()=>{ 
    el.style.opacity='0'; 
    el.style.transition='opacity .3s'; 
    setTimeout(()=>el.remove(),300); 
  }, 2800);
}

/**
 * Populate selects dengan data produk
 */
function populateSelects() {
  const ids = ['rt-produk','pr-produk','pn-produk'];
  ids.forEach(id=>{ 
    const el=document.getElementById(id); 
    if(el) el.innerHTML=DB.produk.map(p=>`<option>${p.nama}</option>`).join(''); 
  });
}

// ═══════════════════════════════════════════
// AUDIT LOG MODULE
// ═══════════════════════════════════════════

function renderAuditLog() {
  const rows = DB.auditLog.slice().reverse().map(log => `<tr>
    <td>${log.id}</td>
    <td>${log.waktu}</td>
    <td><code>${log.user}</code></td>
    <td><span class="badge-tag blue">${log.aksi}</span></td>
    <td>${log.detail}</td>
    <td><span class="badge-tag ${log.status==='success'?'green':'red'}">${log.status}</span></td>
  </tr>`).join('');
  
  document.getElementById('audit-table').innerHTML = 
    '<tr><th>#</th><th>Waktu</th><th>User</th><th>Aksi</th><th>Detail</th><th>Status</th></tr>' + rows;
}

function filterAuditLog() {
  const search = document.getElementById('audit-search').value.toLowerCase();
  const filtered = DB.auditLog.filter(log => 
    log.user.toLowerCase().includes(search) || 
    log.aksi.toLowerCase().includes(search) ||
    log.detail.toLowerCase().includes(search)
  ).reverse();
  
  const rows = filtered.map(log => `<tr>
    <td>${log.id}</td>
    <td>${log.waktu}</td>
    <td><code>${log.user}</code></td>
    <td><span class="badge-tag blue">${log.aksi}</span></td>
    <td>${log.detail}</td>
    <td><span class="badge-tag ${log.status==='success'?'green':'red'}">${log.status}</span></td>
  </tr>`).join('');
  
  document.getElementById('audit-table').innerHTML = 
    '<tr><th>#</th><th>Waktu</th><th>User</th><th>Aksi</th><th>Detail</th><th>Status</th></tr>' + rows;
}

function clearAuditLog() {
  if (!confirm('Hapus semua audit log? Ini tidak bisa dibatalkan!')) return;
  DB.auditLog = [];
  addAuditLog(state.user.id, 'CLEAR_LOG', 'Clear semua audit log', 'success');
  renderAuditLog();
  toast('Audit log dihapus', 'info');
}

// ═══════════════════════════════════════════
// STOCK OPNAME MODULE
// ═══════════════════════════════════════════

function renderOpname() {
  const rows = DB.stockOpname.slice().reverse().map(op => `<tr>
    <td><code>${op.id}</code></td>
    <td>${op.tgl}</td>
    <td>${op.user}</td>
    <td><span class="badge-tag ${op.status==='Selesai'?'green':'blue'}">${op.status}</span></td>
    <td>${op.total} item</td>
    <td><span class="badge-tag ${op.selisih.includes('-')?'red':'green'}">${op.selisih}</span></td>
    <td><button onclick="viewOpnameDetail('${op.id}')" style="background:none;border:1px solid var(--gray5);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;">👁 Lihat</button></td>
  </tr>`).join('');
  
  document.getElementById('opname-table').innerHTML =
    '<tr><th>ID Opname</th><th>Tanggal</th><th>User</th><th>Status</th><th>Total Item</th><th>Selisih</th><th>Aksi</th></tr>' + rows;
}

function startStockOpname() {
  document.getElementById('op-tgl').value = today();
  document.getElementById('modal-opname').classList.add('active');
}

function doStockOpname() {
  const tgl = document.getElementById('op-tgl').value;
  const ket = document.getElementById('op-ket').value;
  
  if (!tgl) { toast('Pilih tanggal opname!', 'error'); return; }
  
  const opnameId = "SO-"+tgl.replace(/-/g,'')+"-"+String(DB.opnameCounter).padStart(3,"0");
  const totalItems = DB.produk.reduce((a,p)=>a+p.stok, 0);
  
  DB.stockOpname.push({
    id: opnameId,
    tgl: tgl,
    user: state.user.id,
    status: 'Selesai',
    total: totalItems,
    selisih: '+0 item'
  });
  DB.opnameCounter++;
  
  addAuditLog(state.user.id, 'STOCK_OPNAME', `Stock opname ${opnameId} - ${ket}`, 'success');
  closeModal('modal-opname');
  renderOpname();
  toast('Stock opname berhasil dicatat!', 'success');
}

function viewOpnameDetail(opnameId) {
  const op = DB.stockOpname.find(o=>o.id===opnameId);
  if (!op) return;
  alert(`Detail Opname ${opnameId}\n\nTanggal: ${op.tgl}\nUser: ${op.user}\nTotal Item: ${op.total}\nSelisih: ${op.selisih}`);
}

// ═══════════════════════════════════════════
// BACKUP & RESTORE MODULE
// ═══════════════════════════════════════════

function backupDatabase() {
  const backup = {
    timestamp: new Date().toISOString(),
    user: state.user.id,
    data: DB
  };
  
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-pos-${today().replace(/-/g,'')}-${nowTime().replace(/:/g,'')}.json`;
  a.click();
  
  addAuditLog(state.user.id, 'BACKUP', 'Backup database berhasil', 'success');
  toast('Backup database berhasil didownload!', 'success');
}

function showRestoreModal() {
  document.getElementById('modal-restore').classList.add('active');
}

function restoreDatabase() {
  const fileInput = document.getElementById('restore-file');
  const file = fileInput.files[0];
  
  if (!file) { toast('Pilih file backup terlebih dahulu!', 'error'); return; }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.data) throw new Error('Format file tidak valid');
      
      // Restore data
      Object.assign(DB, backup.data);
      
      addAuditLog(state.user.id, 'RESTORE', `Restore database dari ${file.name}`, 'success');
      closeModal('modal-restore');
      
      toast('Database berhasil di-restore! Halaman akan reload...', 'success');
      setTimeout(() => location.reload(), 2000);
    } catch (err) {
      addAuditLog(state.user.id, 'RESTORE', `Restore gagal: ${err.message}`, 'error');
      toast('Error: Format file tidak valid! ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════
// EXPORT LAPORAN MODULE
// ═══════════════════════════════════════════

function exportToCSV(filename, data, headers) {
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const v = row[h] || '';
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${today()}.csv`;
  a.click();
}

function exportLaporanToCSV() {
  const data = DB.transaksi.map(t => ({
    'ID': t.id,
    'Waktu': t.waktu,
    'Kasir': t.kasir,
    'Member': t.member,
    'Jumlah Item': t.items.length,
    'Total': t.total,
    'Metode': t.payMethod
  }));
  
  exportToCSV('laporan-penjualan', data, ['ID', 'Waktu', 'Kasir', 'Member', 'Jumlah Item', 'Total', 'Metode']);
  addAuditLog(state.user.id, 'EXPORT', 'Export laporan penjualan ke CSV', 'success');
  toast('Laporan berhasil di-export!', 'success');
}

function exportStokToCSV() {
  const data = DB.produk.map(p => ({
    'Barcode': p.barcode,
    'Nama': p.nama,
    'Kategori': p.kat,
    'Stok': p.stok,
    'Min': p.min,
    'HPP': p.hpp,
    'Harga Jual': p.harga,
    'Supplier': p.supplier
  }));
  
  exportToCSV('daftar-stok', data, ['Barcode', 'Nama', 'Kategori', 'Stok', 'Min', 'HPP', 'Harga Jual', 'Supplier']);
  addAuditLog(state.user.id, 'EXPORT', 'Export daftar stok ke CSV', 'success');
  toast('Daftar stok berhasil di-export!', 'success');
}

// ═══ INIT ON LOAD ═══
document.addEventListener('DOMContentLoaded', ()=>{ 
  generateQuickAmounts(); 
  populateSelects(); 
});
