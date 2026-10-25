/* cart.js — giỏ hàng, sách yêu thích, đơn hàng; tất cả lưu trong localStorage của trình duyệt.
   Giỏ hàng là mảng [{ id: 1, qty: 2 }, ...] */
const CART_KEY = 'nm_cart', FAV_KEY = 'nm_fav', ORDERS_KEY = 'nm_orders', LAST_ORDER_KEY = 'nm_last_order', BUYNOW_KEY = 'nm_buynow';

const SHIPPING = {
  standard: { label: 'Giao hàng tiêu chuẩn', fee: 30000, eta: 'Nhận hàng trong 2–4 ngày làm việc' },
  express:  { label: 'Giao hàng nhanh',      fee: 50000, eta: 'Nhận hàng trong 1–2 ngày làm việc' }
};

function readJSON(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value === null ? fallback : value; } catch (e) { return fallback; }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* ----- Giỏ hàng ----- */
function getCart() { return readJSON(CART_KEY, []); }
function saveCart(cart) { writeJSON(CART_KEY, cart); }
function cartQty(id) { const item = getCart().find(i => i.id === id); return item ? item.qty : 0; }
function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty += qty; else cart.push({ id: id, qty: qty });
  saveCart(cart);
}
function updateQty(id, qty) {
  if (qty <= 0) { removeFromCart(id); return; }
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) { item.qty = qty; saveCart(cart); }
}
function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }
function clearCart() { localStorage.removeItem(CART_KEY); }
function cartCount() { return getCart().reduce((sum, i) => sum + i.qty, 0); }

/* "Mua ngay": chỉ thanh toán riêng cuốn này, không đụng vào giỏ hàng */
function setBuyNow(id, qty) { sessionStorage.setItem(BUYNOW_KEY, JSON.stringify([{ id: id, qty: qty }])); }
function clearBuyNow() { sessionStorage.removeItem(BUYNOW_KEY); }
function isBuyNow() { return sessionStorage.getItem(BUYNOW_KEY) !== null; }
function getCheckoutItems() {
  try { const buyNow = JSON.parse(sessionStorage.getItem(BUYNOW_KEY)); if (buyNow) return buyNow; } catch (e) { /* bỏ qua */ }
  return getCart();
}

/* Ghép mục giỏ với thông tin sách: [{ book, qty, lineTotal }] */
function detailItems(items, books) {
  return items.map(item => {
    const book = books.find(b => b.id === item.id);
    return book ? { book: book, qty: item.qty, lineTotal: book.price * item.qty } : null;
  }).filter(Boolean);
}
function sumItems(details) { return details.reduce((sum, d) => sum + d.lineTotal, 0); }

/* ----- Yêu thích ----- */
function getFavs() { return readJSON(FAV_KEY, []); }
function isFav(id) { return getFavs().includes(id); }
function favCount() { return getFavs().length; }
function toggleFav(id) {
  const favs = getFavs();
  const index = favs.indexOf(id);
  if (index >= 0) favs.splice(index, 1); else favs.push(id);
  writeJSON(FAV_KEY, favs);
  return index < 0;                       // true nếu vừa được thêm
}

/* ----- Đơn hàng ----- */
function getOrders() { return readJSON(ORDERS_KEY, []); }
function getLastOrder() { return readJSON(LAST_ORDER_KEY, null); }
function newOrderCode() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const day = pad(d.getDate()) + pad(d.getMonth() + 1) + String(d.getFullYear()).slice(2);
  const todayCount = getOrders().filter(o => o.code.startsWith('NM' + day)).length;
  return 'NM' + day + String(todayCount + 1).padStart(3, '0');
}
function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  writeJSON(ORDERS_KEY, orders);
  writeJSON(LAST_ORDER_KEY, order);
}
