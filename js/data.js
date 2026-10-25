/* data.js — đọc dữ liệu sách từ data/books.json và các hàm tiện ích về sách */
let booksCache = null;

async function loadBooks() {
  if (booksCache) return booksCache;
  const response = await fetch('data/books.json');
  if (!response.ok) throw new Error('Không đọc được data/books.json');
  booksCache = await response.json();
  return booksCache;
}

async function getBook(id) {
  const books = await loadBooks();
  return books.find(book => book.id === Number(id)) || null;
}

/* 76000 thành "76.000đ" */
function formatPrice(amount) { return Number(amount).toLocaleString('vi-VN') + 'đ'; }

function onSale(book) { return book.oldPrice && book.oldPrice > book.price; }
function discountPercent(book) { return onSale(book) ? Math.round((1 - book.price / book.oldPrice) * 100) : 0; }
function bookCode(book) { return 'NM' + String(book.id).padStart(3, '0'); }

/* Thông báo khi không tải được dữ liệu (thường do mở file bằng cách bấm đúp thay vì máy chủ) */
function loadErrorHtml() {
  return '<p class="empty-state">Không tải được dữ liệu sách. Hãy mở website bằng Live Server hoặc Live Preview (không mở file bằng cách bấm đúp).</p>';
}
