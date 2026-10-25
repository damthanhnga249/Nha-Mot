/* cart-page.js — trang Giỏ hàng: đổi số lượng, xóa, tự tính tiền */
const cartRoot = document.getElementById('cart-root');
const cartSub = document.getElementById('cart-sub');
const BASE_SHIPPING = SHIPPING.standard.fee;
let catalog = [];

function renderCart() {
  const details = detailItems(getCart(), catalog);
  updateBadges();

  if (!details.length) {
    cartSub.textContent = '';
    cartRoot.innerHTML = '<div class="empty-state"><h2>Giỏ hàng của bạn đang trống</h2><p>Cùng chọn vài cuốn sách nhé.</p><a class="btn btn-primary" href="products.html">Quay lại mua sách</a></div>';
    return;
  }

  const totalQty = details.reduce((s, d) => s + d.qty, 0);
  cartSub.textContent = `Bạn có ${totalQty} cuốn sách trong giỏ hàng. Kiểm tra lại trước khi thanh toán nhé.`;
  const subtotal = sumItems(details);

  cartRoot.innerHTML = `
    <div class="cart-layout">
      <section class="cart-list" aria-label="Sản phẩm trong giỏ">
        <div class="cart-head" aria-hidden="true"><span>Sản phẩm</span><span>Đơn giá</span><span>Số lượng</span><span>Thành tiền</span><span>Xóa</span></div>
        ${details.map(({ book, qty, lineTotal }) => `
          <article class="cart-item" data-id="${book.id}">
            <div class="ci-product">
              <img class="ci-thumb" src="${book.cover}" alt="" width="56" height="84">
              <div>
                <a class="ci-title" href="product-detail.html?id=${book.id}">${esc(book.title)}</a>
                <p class="ci-author">${esc(book.author)}</p>
                ${book.stock <= 5 ? `<p class="ci-warn">Chỉ còn ${book.stock} cuốn trong kho</p>` : ''}
              </div>
            </div>
            <div class="ci-price"><span class="tag">Đơn giá: </span>${formatPrice(book.price)}</div>
            <div class="ci-qty"><div class="stepper" role="group" aria-label="Số lượng ${esc(book.title)}">
              <button type="button" data-act="minus" aria-label="Giảm số lượng">−</button>
              <input type="number" value="${qty}" min="1" max="${book.stock}" inputmode="numeric" aria-label="Số lượng" data-act="input">
              <button type="button" data-act="plus" aria-label="Tăng số lượng" ${qty >= book.stock ? 'disabled' : ''}>+</button>
            </div></div>
            <div class="ci-total"><span class="tag">Thành tiền: </span>${formatPrice(lineTotal)}</div>
            <button type="button" class="ci-remove" data-act="remove" aria-label="Xóa ${esc(book.title)} khỏi giỏ hàng">Xóa</button>
          </article>`).join('')}
        <div class="cart-foot"><a class="link" href="products.html">‹ Tiếp tục mua sách</a></div>
      </section>
      <aside class="card cart-summary" aria-label="Tóm tắt thanh toán">
        <h2>Thanh toán</h2>
        <div class="sum-row"><span>Tạm tính</span><span>${formatPrice(subtotal)}</span></div>
        <div class="sum-row"><span>Phí vận chuyển</span><span>${formatPrice(BASE_SHIPPING)}</span></div>
        <div class="sum-row total"><span>Tổng cộng</span><strong>${formatPrice(subtotal + BASE_SHIPPING)}</strong></div>
        <p class="sum-note">Đã bao gồm thuế. Chọn giao hàng nhanh ở bước sau sẽ tính phí khác.</p>
        <button type="button" class="btn btn-primary btn-block" id="go-checkout">Tiến hành thanh toán</button>
      </aside>
    </div>
    <p class="alert alert-note cart-note">Phí vận chuyển tiêu chuẩn: ${formatPrice(BASE_SHIPPING)}. Đơn hàng được giao trong 2–4 ngày làm việc.</p>`;
}

/* Hộp thoại xác nhận khi xóa sách (thư viện SweetAlert2).
   Mất mạng, không nạp được thư viện thì dùng hộp thoại mặc định của trình duyệt. */
async function confirmRemove(book) {
  if (typeof Swal === 'undefined') return window.confirm(`Xóa "${book.title}" khỏi giỏ hàng?`);
  const result = await Swal.fire({
    title: 'Xóa sách khỏi giỏ hàng?',
    html: `Bạn có chắc muốn xóa <strong>${esc(book.title)}</strong> khỏi giỏ hàng không?`,
    imageUrl: book.cover, imageWidth: 80, imageHeight: 120, imageAlt: 'Bìa sách ' + book.title,
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Giữ lại',
    reverseButtons: true,
    focusCancel: true,                 // mặc định đang chọn nút "Giữ lại" để tránh bấm nhầm
    confirmButtonColor: '#C23B1F',
    cancelButtonColor: '#7A4B2A',
    customClass: { popup: 'nm-swal' }
  });
  return result.isConfirmed;
}

cartRoot.addEventListener('click', async event => {
  if (event.target.closest('#go-checkout')) { clearBuyNow(); location.href = 'checkout.html'; return; }
  const btn = event.target.closest('[data-act]');
  const row = event.target.closest('.cart-item');
  if (!btn || !row || btn.dataset.act === 'input') return;
  const id = Number(row.dataset.id);
  const book = catalog.find(b => b.id === id);
  const qty = cartQty(id);
  const act = btn.dataset.act;

  // Bấm "Xóa", hoặc bấm "−" khi chỉ còn 1 cuốn: hỏi lại trước khi xóa
  if (act === 'remove' || (act === 'minus' && qty <= 1)) {
    if (!book || !(await confirmRemove(book))) return;
    removeFromCart(id);
    showToast('Đã xóa khỏi giỏ hàng');
  } else if (act === 'minus') {
    updateQty(id, qty - 1);
  } else if (act === 'plus') {
    if (book && qty + 1 > book.stock) { showToast(`Chỉ còn ${book.stock} cuốn trong kho`); return; }
    updateQty(id, qty + 1);
  }
  renderCart();
});

cartRoot.addEventListener('change', event => {
  if (event.target.dataset.act !== 'input') return;
  const id = Number(event.target.closest('.cart-item').dataset.id);
  const book = catalog.find(b => b.id === id);
  let qty = parseInt(event.target.value, 10);
  if (!qty || qty < 1) qty = 1;
  if (book && qty > book.stock) { qty = book.stock; showToast(`Chỉ còn ${book.stock} cuốn trong kho`); }
  updateQty(id, qty);
  renderCart();
});

loadBooks().then(books => { catalog = books; renderCart(); }).catch(() => { cartRoot.innerHTML = loadErrorHtml(); });
