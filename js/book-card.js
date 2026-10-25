/* book-card.js — vẽ MỘT thẻ sách và xử lý nút "Thêm vào giỏ" (dùng chung nhiều trang).
   options: { rank: 1, label: 'Bán chạy', labelType: 'accent' } */
function renderBookCard(book, options = {}) {
  const soldOut = book.stock === 0;
  const rating = Number(book.rating) || 0;
  const url = 'product-detail.html?id=' + book.id;

  const rank = options.rank ? `<span class="rank">#${options.rank}</span>` : '';
  let badges = '';
  if (soldOut) {
    badges = '<span class="badge badge-muted">Hết hàng</span>';
  } else {
    if (options.label) badges += `<span class="badge badge-${options.labelType || 'accent'}">${options.label}</span>`;
    else if (book.isBestseller) badges += '<span class="badge badge-accent">Bán chạy</span>';
    else if (book.isNew) badges += '<span class="badge badge-success">Mới</span>';
    if (onSale(book)) badges += `<span class="badge badge-primary">-${discountPercent(book)}%</span>`;
  }

  return `
    <article class="book-card ${soldOut ? 'is-soldout' : ''}">
      <a class="book-cover" href="${url}" aria-label="Xem chi tiết ${esc(book.title)}" tabindex="-1">
        <img src="${book.cover}" alt="Bìa sách ${esc(book.title)}" loading="lazy" width="400" height="600">
        <span class="cover-badges">${rank}${badges}</span>
      </a>
      <div class="book-info">
        <h3 class="book-title"><a href="${url}">${esc(book.title)}</a></h3>
        <p class="book-author">${esc(book.author)}</p>
        <p class="book-rating"><span class="stars" style="--rating:${rating}" aria-hidden="true"></span><span>${rating.toFixed(1)}<span class="sr-only"> trên 5 sao</span></span></p>
        <p class="book-price"><strong>${formatPrice(book.price)}</strong>${onSale(book) ? ' <s>' + formatPrice(book.oldPrice) + '</s>' : ''}</p>
        <button type="button" class="btn btn-accent btn-block" data-add="${book.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Hết hàng' : 'Thêm vào giỏ'}</button>
      </div>
    </article>`;
}

/* Thêm vào giỏ có kiểm tra số lượng tồn. Trả về true nếu thêm được. */
async function tryAddToCart(bookId, qty = 1) {
  const book = await getBook(bookId);
  if (!book || book.stock === 0) { showToast('Cuốn sách này đã hết hàng'); return false; }
  const inCart = cartQty(book.id);
  if (inCart + qty > book.stock) { showToast(`Chỉ còn ${book.stock} cuốn trong kho (bạn đã có ${inCart} cuốn trong giỏ)`); return false; }
  addToCart(book.id, qty);
  updateBadges();
  return true;
}

/* Một chỗ lắng nghe cho MỌI nút "Thêm vào giỏ" trên trang, kể cả thẻ được vẽ sau */
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-add]');
  if (!button || button.disabled) return;
  if (await tryAddToCart(Number(button.dataset.add), 1)) showToast('Đã thêm vào giỏ hàng');
});
