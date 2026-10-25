/* success.js — trang Đặt hàng thành công: hiện đơn hàng vừa đặt (đọc từ localStorage) */
const successRoot = document.getElementById('success-root');
const order = getLastOrder();

if (!order) {
  successRoot.innerHTML = '<div class="empty-state"><h2>Chưa có đơn hàng nào</h2><p>Hãy chọn sách và đặt hàng để xem thông tin tại đây.</p><a class="btn btn-primary" href="products.html">Xem sách</a></div>';
} else {
  const c = order.customer;
  const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
  const payNote = order.payment.key === 'cod' ? `Số tiền cần thanh toán khi nhận hàng: ${formatPrice(order.total)}` : 'Vui lòng chuyển khoản theo hướng dẫn trong email xác nhận.';
  document.title = 'Đặt hàng thành công ' + order.code + ' | Nhà Mọt';
  successRoot.innerHTML = `
    <div class="success-head">
      <span class="success-mark" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>
      <h1>Đặt hàng thành công!</h1>
      <p>Cảm ơn <strong>${esc(c.fullName)}</strong> đã chọn Nhà Mọt. Chúng mình đang chuẩn bị những cuốn sách gửi đến bạn.</p>
      <div class="order-code"><span>MÃ ĐƠN HÀNG</span><strong>${esc(order.code)}</strong></div>
      <p class="muted" style="font-size:14px">Thông tin đơn hàng được gửi đến email: ${esc(c.email)}</p>
    </div>
    <div class="success-grid">
      <section class="card" aria-labelledby="o-info">
        <div class="form-card-head"><h2 id="o-info">Thông tin đơn hàng</h2><span class="status-pill">${esc(order.status)}</span></div>
        <p class="muted" style="font-size:14px">Ngày đặt: ${date}</p>
        <div class="info-block"><h3>Thông tin nhận hàng</h3><p>${esc(c.fullName)} · ${esc(c.phone)}<br>${esc(c.address)}, ${esc(c.ward)}, ${esc(c.province)}${c.note ? '<br>Ghi chú: ' + esc(c.note) : ''}</p></div>
        <div class="info-block"><h3>Phương thức vận chuyển</h3><p>${esc(order.shipping.label)}<br>${esc(order.shipping.eta)}</p></div>
        <div class="info-block"><h3>Phương thức thanh toán</h3><p>${esc(order.payment.label)}<br>${payNote}</p></div>
        <p class="alert alert-note" style="margin-top:var(--space-3)">Cần thay đổi thông tin? Gọi 1900 6868 và cung cấp mã đơn hàng ${esc(order.code)} để được hỗ trợ.</p>
      </section>
      <section class="card" aria-labelledby="o-sum">
        <h2 id="o-sum">Tóm tắt đơn hàng</h2>
        <div class="mini-list">${order.items.map(i => `
          <div class="mini-item"><img src="${esc(i.cover)}" alt="" width="44" height="66"><div class="grow"><strong>${esc(i.title)}</strong><span class="muted">${esc(i.author)} · Số lượng: ${i.qty}</span></div><span class="price">${formatPrice(i.price * i.qty)}</span></div>`).join('')}</div>
        <div class="sum-row"><span>Tạm tính</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="sum-row"><span>Phí vận chuyển</span><span>${formatPrice(order.shipping.fee)}</span></div>
        <div class="sum-row total"><span>Tổng cộng</span><strong>${formatPrice(order.total)}</strong></div>
      </section>
    </div>
    <div class="success-actions"><a class="btn btn-primary" href="products.html">Tiếp tục mua sách</a><a class="btn btn-outline" href="index.html">Về trang chủ</a></div>`;
}
