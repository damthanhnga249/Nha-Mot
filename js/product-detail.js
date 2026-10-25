/* product-detail.js — trang Chi tiết sách. Lấy id từ địa chỉ: product-detail.html?id=5 */
const root = document.getElementById('detail-root');
const bookId = Number(new URLSearchParams(location.search).get('id'));

function renderNotFound() {
  document.getElementById('breadcrumb').innerHTML = '<li><a href="index.html">Trang chủ</a></li><li><span aria-current="page">Không tìm thấy sách</span></li>';
  root.innerHTML = '<div class="empty-state"><h2>Không tìm thấy cuốn sách này</h2><p>Có thể đường dẫn đã cũ hoặc sách không còn trong cửa hàng.</p><a class="btn btn-primary" href="products.html">Xem tất cả sách</a></div>';
  document.title = 'Không tìm thấy sách | Nhà Mọt';
}

function stockLine(book) {
  if (book.stock === 0) return '<span class="stock out">Hết hàng</span>';
  if (book.stock <= 5) return `<span class="stock low">Chỉ còn ${book.stock} cuốn</span>`;
  return `<span class="stock">Còn hàng (${book.stock} cuốn)</span>`;
}

function renderDetail(book, books) {
  document.title = book.title + ' | Nhà Mọt';
  const soldOut = book.stock === 0;
  const rating = Number(book.rating) || 0;
  const maxQty = Math.min(book.stock, 99);
  const translator = book.translator && book.translator.trim();
  document.getElementById('breadcrumb').innerHTML =
    `<li><a href="index.html">Trang chủ</a></li><li><a href="products.html">Danh mục sách</a></li>` +
    `<li><a href="products.html?category=${encodeURIComponent(book.category)}">${esc(book.category)}</a></li><li><span aria-current="page">${esc(book.title)}</span></li>`;

  const paragraphs = String(book.description || '').split(/\n\s*\n|\\n\\n/).filter(Boolean).map(p => `<p>${esc(p.trim())}</p>`).join('');
  const related = books.filter(b => b.category === book.category && b.id !== book.id)
    .sort((a, b) => (b.stock > 0) - (a.stock > 0) || b.rating - a.rating).slice(0, 4);

  root.innerHTML = `
    <article class="detail">
      <div class="detail-cover"><img src="${book.cover}" alt="Bìa sách ${esc(book.title)}" width="400" height="600"></div>
      <div class="detail-info">
        <p class="eyebrow">${esc(book.category)}</p>
        <h1>${esc(book.title)}</h1>
        <p class="meta">Tác giả: <strong>${esc(book.author)}</strong></p>
        ${translator ? `<p class="meta">Dịch giả: <strong>${esc(translator)}</strong></p>` : ''}
        <p class="rating-line"><span class="stars" style="--rating:${rating}" aria-hidden="true"></span><strong>${rating.toFixed(1)}</strong><span class="sr-only"> trên 5 sao</span> · Mã: ${bookCode(book)}</p>
        <div class="price-box">
          <strong>${formatPrice(book.price)}</strong>
          ${onSale(book) ? `<s>${formatPrice(book.oldPrice)}</s><span class="badge badge-accent">-${discountPercent(book)}%</span><span class="save">Tiết kiệm ${formatPrice(book.oldPrice - book.price)}</span>` : ''}
        </div>
        <dl class="spec">
          <div><dt>Nhà xuất bản</dt><dd>${esc(book.publisher)}</dd></div>
          ${translator ? `<div><dt>Dịch giả</dt><dd>${esc(translator)}</dd></div>` : ''}
          <div><dt>Thể loại</dt><dd>${esc(book.category)}</dd></div>
          <div><dt>Năm xuất bản</dt><dd>${book.year}</dd></div>
          <div><dt>Số trang</dt><dd>${book.pages} trang</dd></div>
        </dl>
        <div class="buy-row">
          <span class="label" id="qty-label">Số lượng</span>
          <div class="stepper" role="group" aria-labelledby="qty-label">
            <button type="button" id="qty-minus" aria-label="Giảm số lượng" ${soldOut ? 'disabled' : ''}>−</button>
            <input type="number" id="qty" value="1" min="1" max="${maxQty}" inputmode="numeric" aria-label="Số lượng" ${soldOut ? 'disabled' : ''}>
            <button type="button" id="qty-plus" aria-label="Tăng số lượng" ${soldOut ? 'disabled' : ''}>+</button>
          </div>
          ${stockLine(book)}
        </div>
        <div class="buy-actions">
          <button type="button" class="btn btn-accent" id="add-btn" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</button>
          <button type="button" class="btn btn-primary" id="buy-btn" ${soldOut ? 'disabled' : ''}>Mua ngay</button>
        </div>
        <button type="button" class="btn btn-outline btn-block fav-btn" id="fav-btn" aria-pressed="false"></button>
        <ul class="trust"><li>Sách chính hãng</li><li>Giao hàng 2–4 ngày</li><li>Đổi trả trong 7 ngày</li></ul>
      </div>
    </article>

    <section class="detail-section" aria-labelledby="desc-title">
      <h2 id="desc-title">Mô tả sách</h2>
      <div class="desc-text" id="desc-text">${paragraphs}</div>
      <button type="button" class="link desc-toggle" id="desc-toggle" hidden>Xem thêm</button>
    </section>

    ${related.length ? `<section class="detail-section related" aria-labelledby="rel-title"><div class="section-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)"><h2 id="rel-title" style="margin:0">Sách liên quan</h2><a class="link" href="products.html?category=${encodeURIComponent(book.category)}">Xem tất cả</a></div><div class="book-grid">${related.map(b => renderBookCard(b)).join('')}</div></section>` : ''}`;

  bindControls(book, maxQty);
}

function bindControls(book, maxQty) {
  const qtyInput = document.getElementById('qty');
  const getQty = () => Math.min(Math.max(parseInt(qtyInput.value, 10) || 1, 1), maxQty || 1);
  const setQty = n => { qtyInput.value = Math.min(Math.max(n, 1), maxQty || 1); };
  document.getElementById('qty-minus').addEventListener('click', () => setQty(getQty() - 1));
  document.getElementById('qty-plus').addEventListener('click', () => setQty(getQty() + 1));
  qtyInput.addEventListener('change', () => setQty(getQty()));

  document.getElementById('add-btn').addEventListener('click', async () => {
    if (await tryAddToCart(book.id, getQty())) showToast('Đã thêm vào giỏ hàng');
  });
  document.getElementById('buy-btn').addEventListener('click', () => {
    setBuyNow(book.id, getQty());          // chỉ thanh toán cuốn này, bỏ qua giỏ hàng
    location.href = 'checkout.html';
  });

  const favBtn = document.getElementById('fav-btn');
  const paintFav = () => { const on = isFav(book.id); favBtn.setAttribute('aria-pressed', String(on)); favBtn.textContent = on ? '♥ Đã yêu thích' : '♡ Thêm vào yêu thích'; };
  paintFav();
  favBtn.addEventListener('click', () => {
    const added = toggleFav(book.id);
    paintFav(); updateBadges();
    showToast(added ? 'Đã thêm vào sách yêu thích' : 'Đã bỏ khỏi sách yêu thích');
  });

  // Mô tả dài thì thu gọn, có nút Xem thêm
  const desc = document.getElementById('desc-text');
  const toggle = document.getElementById('desc-toggle');
  if (desc.scrollHeight > desc.clientHeight + 4) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const open = desc.classList.toggle('expanded');
      toggle.textContent = open ? 'Thu gọn' : 'Xem thêm';
    });
  }
}

if (!bookId) renderNotFound();
else loadBooks().then(books => {
  const book = books.find(b => b.id === bookId);
  if (book) renderDetail(book, books); else renderNotFound();
}).catch(() => { root.innerHTML = loadErrorHtml(); });
