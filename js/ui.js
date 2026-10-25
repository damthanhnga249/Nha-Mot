/* ui.js — phần dùng chung cho MỌI trang: header, menu trượt trên mobile, footer, thông báo, số trên giỏ hàng. */

const CATEGORIES = [
  'Văn học Việt Nam', 'Văn học nước ngoài', 'Truyện tranh', 'Kỹ năng',
  'Sức khoẻ', 'Kinh tế', 'Khoa học', 'Kinh dị - Trinh thám'
];

const NAV_ITEMS = [
  { label: 'Danh mục sách',   href: 'products.html',            view: '',     hideMobile: true },
  { label: 'Sách bán chạy',   href: 'products.html?view=best',  view: 'best' },
  { label: 'Sách mới',        href: 'products.html?view=new',   view: 'new' },
  { label: 'Sách khuyến mãi', href: 'products.html?view=sale',  view: 'sale' }
];

const currentFile = location.pathname.split('/').pop() || 'index.html';

const ICONS = {
  book: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M8 7h7"/></svg>',
  cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a1 1 0 001 .8h9.6a1 1 0 001-.8L21 8H6"/></svg>',
  heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
  user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
};

/* Chống chèn mã độc khi in chữ người dùng gõ vào trang */
function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('nm_user') || 'null'); } catch (e) { return null; }
}

/* Mục menu nào đang được chọn */
function isActive(item) {
  if (currentFile !== 'products.html') return false;
  const params = new URLSearchParams(location.search);
  return (params.get('view') || '') === item.view && !params.get('fav');
}

function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  const user = getUser();
  const navHtml = NAV_ITEMS.map(item =>
    `<li class="${item.hideMobile ? 'hide-mobile' : ''}"><a href="${item.href}" class="${isActive(item) ? 'active' : ''}">${item.label}</a></li>`).join('');

  const userHtml = user
    ? `<div class="user-menu">
         <button type="button" class="action-btn" id="user-btn" aria-haspopup="true" aria-expanded="false" aria-label="Tài khoản của ${esc(user.name)}"><span class="avatar">${esc(user.name.trim().charAt(0).toUpperCase())}</span></button>
         <div class="user-pop" id="user-pop" hidden>
           <p><strong>${esc(user.name)}</strong><br><span class="muted">${esc(user.email)}</span></p>
           <button type="button" class="btn btn-outline btn-block btn-sm" id="logout-btn">Đăng xuất</button>
         </div>
       </div>`
    : `<a href="login.html" class="action-btn user-menu" aria-label="Đăng nhập">${ICONS.user}</a>`;

  el.innerHTML = `
    <header class="site-header">
      <div class="container header-top">
        <button type="button" class="menu-btn" id="menu-btn" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false">${ICONS.menu}</button>
        <a href="index.html" class="logo" aria-label="Nhà Mọt, về trang chủ">${ICONS.book}<span><span class="logo-name">Nhà Mọt</span><span class="logo-tag">MỞ SÁCH, MỞ CẢ THẾ GIỚI</span></span></a>
        <form class="search" id="search-form" role="search">
          <label for="search-input" class="sr-only">Tìm sách</label>
          <input type="search" id="search-input" placeholder="Tìm sách, tác giả hoặc thể loại..." autocomplete="off">
          <button type="submit">Tìm kiếm</button>
        </form>
        <div class="header-actions">
          <a href="cart.html" class="action-btn" aria-label="Giỏ hàng">${ICONS.cart}<span class="label">Giỏ hàng</span><span class="badge-count" id="cart-badge">0</span></a>
          <a href="products.html?fav=1" class="action-btn" aria-label="Sách yêu thích">${ICONS.heart}<span class="badge-count" id="fav-badge">0</span></a>
          ${userHtml}
        </div>
      </div>
      <nav class="main-nav" aria-label="Menu chính"><div class="container"><ul>${navHtml}</ul></div></nav>
    </header>
    <div class="drawer-backdrop" id="drawer-backdrop" hidden></div>
    <aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">
      <div class="drawer-head">
        ${user ? `<span>Xin chào, ${esc(user.name)}</span>` : '<a href="login.html">Đăng nhập / Đăng ký</a>'}
        <button type="button" class="drawer-close" id="drawer-close" aria-label="Đóng menu">${ICONS.x}</button>
      </div>
      <h2>Khám phá</h2>
      <ul><li><a href="index.html">Trang chủ</a></li><li><a href="products.html">Danh mục sách</a></li></ul>
      <h2>Thể loại</h2>
      <ul>${CATEGORIES.map(name => `<li><a href="products.html?category=${encodeURIComponent(name)}">${name}</a></li>`).join('')}</ul>
      ${user ? '<ul><li><a href="#" id="drawer-logout">Đăng xuất</a></li></ul>' : ''}
    </aside>`;

  // Tìm kiếm: chuyển sang products.html?q=...
  const input = document.getElementById('search-input');
  input.value = currentFile === 'products.html' ? (new URLSearchParams(location.search).get('q') || '') : '';
  document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const keyword = input.value.trim();
    location.href = keyword ? 'products.html?q=' + encodeURIComponent(keyword) : 'products.html';
  });

  setupDrawer();
  setupUserMenu();
}

/* Menu trượt trên điện thoại */
function setupDrawer() {
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const openBtn = document.getElementById('menu-btn');
  function setOpen(open) {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    openBtn.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    if (open) document.getElementById('drawer-close').focus(); else openBtn.focus();
  }
  openBtn.addEventListener('click', () => setOpen(true));
  backdrop.addEventListener('click', () => setOpen(false));
  document.getElementById('drawer-close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false); });
  const logout = document.getElementById('drawer-logout');
  if (logout) logout.addEventListener('click', e => { e.preventDefault(); doLogout(); });
}

function doLogout() {
  localStorage.removeItem('nm_user');
  location.reload();
}

function setupUserMenu() {
  const btn = document.getElementById('user-btn');
  if (!btn) return;
  const pop = document.getElementById('user-pop');
  btn.addEventListener('click', () => {
    pop.hidden = !pop.hidden;
    btn.setAttribute('aria-expanded', String(!pop.hidden));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.user-menu')) { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  document.getElementById('logout-btn').addEventListener('click', doLogout);
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  // Mục chưa có trang chỉ là chữ thường (không phải liên kết) để không có liên kết chết
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="newsletter">
          <p>Nhận thông tin khuyến mãi từ chúng tôi</p>
          <form id="newsletter-form" novalidate>
            <label for="newsletter-email" class="sr-only">Email của bạn</label>
            <input type="email" id="newsletter-email" placeholder="Email của bạn">
            <button type="submit" class="btn btn-primary">Đăng ký</button>
          </form>
        </div>
        <div class="footer-grid">
          <div class="footer-col footer-brand">
            <a href="index.html" class="logo">${ICONS.book}<span class="logo-name">Nhà Mọt</span></a>
            <p>Mở sách, mở cả thế giới.</p>
            <div class="social">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener">TikTok</a>
              <a href="https://zalo.me/" target="_blank" rel="noopener">Zalo</a>
            </div>
          </div>
          <details class="footer-col"><summary>Về Nhà Mọt</summary><ul><li>Giới thiệu</li><li>Tuyển dụng</li><li>Tin tức</li></ul></details>
          <details class="footer-col"><summary>Chính sách</summary><ul><li>Chính sách bảo mật</li><li>Chính sách thanh toán, vận chuyển</li><li>Chính sách đổi trả, hoàn tiền</li></ul></details>
          <details class="footer-col"><summary>Liên hệ</summary><ul>
            <li><a href="tel:19006868">1900 6868</a> (8:00–21:00)</li>
            <li><a href="mailto:hotro@nhamot.vn">hotro@nhamot.vn</a></li>
            <li>207 Giải Phóng, TP. Hà Nội</li></ul></details>
          <div class="footer-col"><h4>Phương thức thanh toán</h4><div class="pay-list"><span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>ATM</span><span>COD</span></div></div>
        </div>
        <div class="footer-bottom">© 2026 Nhà Mọt</div>
      </div>
    </footer>`;

  // Trên desktop các cột luôn mở; trên mobile thu gọn thành các ô bấm mở ra
  const media = window.matchMedia('(max-width: 767px)');
  const sync = () => el.querySelectorAll('details.footer-col').forEach(d => { d.open = !media.matches; });
  sync();
  media.addEventListener('change', sync);

  document.getElementById('newsletter-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('newsletter-email');
    if (!isValidEmail(input.value)) { showToast('Vui lòng nhập email hợp lệ'); input.focus(); return; }
    input.value = '';
    showToast('Cảm ơn bạn đã đăng ký nhận tin');
  });
}

/* Thông báo nhỏ ở đáy màn hình */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* Số trên biểu tượng giỏ hàng và trái tim */
function updateBadges() {
  const cart = document.getElementById('cart-badge');
  const fav = document.getElementById('fav-badge');
  if (cart) { const n = cartCount(); cart.textContent = n; cart.dataset.count = n; }
  if (fav) { const n = favCount(); fav.textContent = n; fav.dataset.count = n; }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  updateBadges();
});
