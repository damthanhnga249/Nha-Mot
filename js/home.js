/* home.js — Trang chủ: thể loại, hai dải sách và banner (dùng thư viện Swiper) */
const CATEGORY_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M8 7h7"/></svg>';
const SWIPER_A11Y = { prevSlideMessage: 'Trước', nextSlideMessage: 'Sau', paginationBulletMessage: 'Đến banner số {{index}}' };

function renderCategories(books) {
  document.getElementById('category-list').innerHTML = CATEGORIES.map(name => {
    const count = books.filter(book => book.category === name).length;
    return `<a class="category-tile" href="products.html?category=${encodeURIComponent(name)}">${CATEGORY_ICON}<span class="category-name">${name}</span><span class="category-count">${count} tựa sách</span></a>`;
  }).join('');
}

/* Bán chạy: sách isBestseller còn hàng, điểm đánh giá cao đứng trước */
function pickBestSellers(books) {
  return books.filter(b => b.isBestseller && b.stock > 0).sort((a, b) => b.rating - a.rating || a.id - b.id);
}
/* Mới: sách isNew còn hàng */
function pickNewBooks(books) { return books.filter(b => b.isNew && b.stock > 0); }

/* Mỗi thẻ sách nằm trong một .swiper-slide */
function renderSlides(list, options) {
  return list.map((book, index) => `<div class="swiper-slide">${renderBookCard(book, options(index))}</div>`).join('');
}

/* ---------- Swiper: dải sách ---------- */
function initBookSwiper(selector) {
  const element = document.querySelector(selector);
  if (!element || typeof Swiper === 'undefined') return;     // mất mạng: bỏ qua, dải sách vẫn cuộn ngang được
  new Swiper(element, {
    slidesPerView: 1.7,                                       // điện thoại: hơn 1 thẻ để thấy thẻ kế tiếp
    spaceBetween: 12,
    grabCursor: true,                                         // con trỏ hình bàn tay, kéo bằng chuột
    watchOverflow: true,                                      // ít thẻ quá thì ẩn mũi tên
    navigation: { nextEl: selector + ' .swiper-button-next', prevEl: selector + ' .swiper-button-prev' },
    breakpoints: {
      600:  { slidesPerView: 2.4, spaceBetween: 16 },
      768:  { slidesPerView: 3,   spaceBetween: 16 },
      1024: { slidesPerView: 4,   spaceBetween: 24 }
    },
    a11y: SWIPER_A11Y
  });
}

/* ---------- Swiper: banner tự chuyển ---------- */
function initHeroSlider() {
  const element = document.getElementById('hero-slider');
  const pauseBtn = document.getElementById('hero-pause');
  if (!element || typeof Swiper === 'undefined') { if (pauseBtn) pauseBtn.hidden = true; return; }

  // Người dùng bật "giảm chuyển động" trong máy thì không tự chuyển banner
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slider = new Swiper(element, {
    loop: true,
    speed: 600,
    grabCursor: true,                                         // kéo bằng chuột, vuốt bằng ngón tay
    autoplay: reduceMotion ? false : {
      delay: 4500,                                            // 4,5 giây
      disableOnInteraction: false,                            // vuốt xong vẫn tự chạy tiếp
      pauseOnMouseEnter: true                                 // rê chuột vào banner thì tạm dừng
    },
    navigation: { nextEl: '#hero-slider .swiper-button-next', prevEl: '#hero-slider .swiper-button-prev' },
    pagination: { el: '#hero-slider .swiper-pagination', clickable: true },   // bấm chấm để chọn banner
    keyboard: { enabled: true },
    a11y: SWIPER_A11Y
  });

  if (reduceMotion) { pauseBtn.hidden = true; return; }

  // Nút tạm dừng / phát do người dùng chủ động bấm
  let userPaused = false;
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) slider.autoplay.stop(); else slider.autoplay.start();
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute('aria-label', userPaused ? 'Tiếp tục tự động chuyển banner' : 'Tạm dừng tự động chuyển banner');
  });

  // Đang dùng bàn phím trong banner (bấm Tab vào nút) thì cũng tạm dừng
  element.addEventListener('focusin', () => slider.autoplay.stop());
  element.addEventListener('focusout', event => {
    if (!userPaused && !element.contains(event.relatedTarget)) slider.autoplay.start();
  });
}

/* Chữ "giảm đến X%" ở banner khuyến mãi lấy từ dữ liệu thật */
function updatePromoText(books) {
  const max = Math.max(0, ...books.filter(b => onSale(b)).map(b => discountPercent(b)));
  document.querySelectorAll('[data-promo-max]').forEach(el => { if (max) el.textContent = max; });
}

loadBooks().then(books => {
  renderCategories(books);
  updatePromoText(books);
  document.getElementById('best-list').innerHTML = renderSlides(pickBestSellers(books), i => ({ rank: i + 1, label: 'Bán chạy' }));
  document.getElementById('new-list').innerHTML = renderSlides(pickNewBooks(books), () => ({ label: 'Mới', labelType: 'success' }));
  // Phải khởi động Swiper SAU khi đã có thẻ sách trong trang
  initBookSwiper('#best-swiper');
  initBookSwiper('#new-swiper');
}).catch(() => {
  ['best-list', 'new-list'].forEach(id => { document.getElementById(id).innerHTML = '<div class="swiper-slide">' + loadErrorHtml() + '</div>'; });
});

initHeroSlider();   // banner không cần dữ liệu sách nên khởi động ngay
