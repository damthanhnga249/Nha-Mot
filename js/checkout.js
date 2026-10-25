/* checkout.js — trang Thanh toán: điền sẵn thông tin, tính tiền, kiểm tra biểu mẫu, tạo đơn hàng */
const PROVINCES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Quảng Ninh', 'Thanh Hóa', 'Nghệ An', 'Khánh Hòa', 'Lâm Đồng', 'Tỉnh / thành phố khác'];
const form = document.getElementById('checkout-form');
const PAYMENTS = { cod: 'Thanh toán khi nhận hàng (COD)', bank: 'Chuyển khoản ngân hàng' };
let details = [];

function selectedShipping() { return SHIPPING[form.elements.shipping.value] || SHIPPING.standard; }

function renderSummary() {
  const subtotal = sumItems(details);
  const fee = selectedShipping().fee;
  const totalQty = details.reduce((s, d) => s + d.qty, 0);
  document.getElementById('sum-count').textContent = `${totalQty} cuốn sách | ${details.length} sản phẩm`;
  document.getElementById('mini-list').innerHTML = details.map(({ book, qty, lineTotal }) => `
    <div class="mini-item"><img src="${book.cover}" alt="" width="44" height="66">
      <div class="grow"><strong>${esc(book.title)}</strong><span class="muted">${esc(book.author)} · Số lượng: ${qty}</span></div>
      <span class="price">${formatPrice(lineTotal)}</span></div>`).join('');
  document.getElementById('sum-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('sum-shipping').textContent = formatPrice(fee);
  document.getElementById('sum-total').textContent = formatPrice(subtotal + fee);
}

/* Đã đăng nhập thì điền sẵn họ tên, email và thông tin nhận hàng của lần đặt gần nhất */
function prefill() {
  const user = getUser();
  if (!user) return;
  const saved = readJSON('nm_last_shipping', {});
  const values = Object.assign({ fullName: user.name, email: user.email }, saved);
  Object.keys(values).forEach(name => { if (form.elements[name] && values[name]) form.elements[name].value = values[name]; });
  document.getElementById('login-hint').innerHTML = `Đã đăng nhập với <strong>${esc(user.email)}</strong>. Thông tin được điền sẵn, bạn có thể chỉnh sửa.`;
}

const rules = {
  fullName: v => v.trim().length < 2 ? 'Vui lòng nhập họ và tên' : '',
  phone: v => !v.trim() ? 'Vui lòng nhập số điện thoại' : !isValidPhone(v) ? 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0' : '',
  email: v => !v.trim() ? 'Vui lòng nhập email' : !isValidEmail(v) ? 'Email không hợp lệ (ví dụ: ten@email.com)' : '',
  province: v => !v ? 'Vui lòng chọn tỉnh / thành phố' : '',
  ward: v => v.trim().length < 2 ? 'Vui lòng nhập phường / xã' : '',
  address: v => v.trim().length < 5 ? 'Vui lòng nhập địa chỉ giao hàng (số nhà, tên đường)' : '',
  terms: v => !v ? 'Vui lòng đồng ý với điều khoản mua hàng' : ''
};

function placeOrder(event) {
  event.preventDefault();
  if (!validateForm(form, rules)) { showToast('Vui lòng kiểm tra lại các ô báo lỗi'); return; }

  // Kiểm tra lại tồn kho lần cuối
  const short = details.find(d => d.qty > d.book.stock);
  if (short) { showToast(`"${short.book.title}" chỉ còn ${short.book.stock} cuốn`); return; }

  const f = form.elements;
  const shipping = selectedShipping();
  const subtotal = sumItems(details);
  const order = {
    code: newOrderCode(),
    createdAt: new Date().toISOString(),
    status: 'Đang xử lý',
    customer: { fullName: f.fullName.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), province: f.province.value, ward: f.ward.value.trim(), address: f.address.value.trim(), note: f.note.value.trim() },
    shipping: { key: f.shipping.value, label: shipping.label, fee: shipping.fee, eta: shipping.eta },
    payment: { key: f.payment.value, label: PAYMENTS[f.payment.value] },
    items: details.map(d => ({ id: d.book.id, title: d.book.title, author: d.book.author, cover: d.book.cover, price: d.book.price, qty: d.qty })),
    subtotal: subtotal, total: subtotal + shipping.fee
  };
  saveOrder(order);
  if (getUser()) writeJSON('nm_last_shipping', { phone: order.customer.phone, province: order.customer.province, ward: order.customer.ward, address: order.customer.address });
  if (isBuyNow()) clearBuyNow(); else clearCart();
  location.href = 'success.html';
}

loadBooks().then(books => {
  details = detailItems(getCheckoutItems(), books);
  if (!details.length) {
    form.hidden = true;
    const box = document.getElementById('checkout-empty');
    box.hidden = false;
    box.innerHTML = '<div class="empty-state"><h2>Chưa có sách để thanh toán</h2><p>Hãy chọn vài cuốn sách rồi quay lại nhé.</p><a class="btn btn-primary" href="products.html">Xem sách</a></div>';
    return;
  }
  form.elements.province.innerHTML += PROVINCES.map(p => `<option value="${p}">${p}</option>`).join('');
  prefill();
  renderSummary();
  clearErrorsOnInput(form);
  form.addEventListener('change', event => { if (event.target.name === 'shipping') renderSummary(); });
  form.addEventListener('submit', placeOrder);
}).catch(() => { form.hidden = true; document.getElementById('checkout-empty').innerHTML = loadErrorHtml(); document.getElementById('checkout-empty').hidden = false; });
