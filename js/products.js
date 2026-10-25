/* products.js — trang Danh mục sách: tìm kiếm, lọc, sắp xếp, phân trang.
   Mọi lựa chọn nằm trên địa chỉ trang: ?q=...&category=...&view=best|new|sale&fav=1&price=...&sort=...&page=... */
const PER_PAGE = 8;
const PRICE_RANGES = [
  { id: '',        label: 'Tất cả mức giá',     test: () => true },
  { id: 'lt100',   label: 'Dưới 100.000đ',      test: p => p < 100000 },
  { id: '100-200', label: '100.000đ – 200.000đ', test: p => p >= 100000 && p <= 200000 },
  { id: 'gt200',   label: 'Trên 200.000đ',      test: p => p > 200000 }
];
const VIEW_NAMES = { best: 'Sách bán chạy', new: 'Sách mới', sale: 'Sách khuyến mãi' };
const SORTS = {
  popular:      (a, b) => (b.isBestseller - a.isBestseller) || b.rating - a.rating || a.id - b.id,
  newest:       (a, b) => (b.isNew - a.isNew) || b.year - a.year || a.id - b.id,
  'price-asc':  (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating:       (a, b) => b.rating - a.rating || a.id - b.id
};

let allBooks = [];
let state = readState();

function readState() {
  const p = new URLSearchParams(location.search);
  return {
    q: (p.get('q') || '').trim(), category: p.get('category') || '', view: p.get('view') || '',
    fav: p.get('fav') === '1', price: p.get('price') || '',
    sort: SORTS[p.get('sort')] ? p.get('sort') : 'popular', page: Math.max(1, parseInt(p.get('page'), 10) || 1)
  };
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category) p.set('category', state.category);
  if (state.view) p.set('view', state.view);
  if (state.fav) p.set('fav', '1');
  if (state.price) p.set('price', state.price);
  if (state.sort !== 'popular') p.set('sort', state.sort);
  if (state.page > 1) p.set('page', state.page);
  const query = p.toString();
  history.replaceState(null, '', 'products.html' + (query ? '?' + query : ''));
}

/* Bỏ dấu và chữ hoa để "chua lanh" vẫn tìm ra "Chữa lành" */
function normalize(text) { return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd'); }

function matchesQuery(book, q) {
  const haystack = normalize([book.title, book.author, book.translator, book.category].join(' '));
  return normalize(q).split(/\s+/).filter(Boolean).every(word => haystack.includes(word));
}

function getFiltered() {
  const range = PRICE_RANGES.find(r => r.id === state.price) || PRICE_RANGES[0];
  return allBooks
    .filter(b => !state.q || matchesQuery(b, state.q))
    .filter(b => !state.category || b.category === state.category)
    .filter(b => range.test(b.price))
    .filter(b => state.view !== 'best' || b.isBestseller)
    .filter(b => state.view !== 'new' || b.isNew)
    .filter(b => state.view !== 'sale' || onSale(b))
    .filter(b => !state.fav || isFav(b.id))
    .sort(SORTS[state.sort]);
}

function pageHeading(total) {
  if (state.q) return { title: `Kết quả tìm kiếm cho “${esc(state.q)}”`, sub: `Đã tìm thấy ${total} kết quả phù hợp cho “${esc(state.q)}”`, crumbs: [['Kết quả tìm kiếm']] };
  if (state.fav) return { title: 'Sách yêu thích', sub: '', crumbs: [['Sách yêu thích']] };
  const name = state.category || VIEW_NAMES[state.view];
  if (name) return { title: esc(name), sub: '', crumbs: [['Danh mục sách', 'products.html'], [name]] };
  return { title: 'Danh mục sách', sub: '', crumbs: [['Danh mục sách']] };
}

function renderHeading(total) {
  const h = pageHeading(total);
  document.getElementById('page-title').innerHTML = h.title;
  document.getElementById('page-sub').innerHTML = h.sub;
  document.getElementById('page-sub').hidden = !h.sub;
  document.title = h.title.replace(/&[^;]+;/g, '') + ' | Nhà Mọt';
  document.getElementById('breadcrumb').innerHTML = [['Trang chủ', 'index.html']].concat(h.crumbs)
    .map(([label, href]) => `<li>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}</li>`).join('');
}

function renderChips() {
  const chips = [];
  if (state.q) chips.push(['q', `Bạn đang tìm: ${esc(state.q)}`]);
  if (state.category) chips.push(['category', esc(state.category)]);
  if (state.price) chips.push(['price', esc((PRICE_RANGES.find(r => r.id === state.price) || {}).label || '')]);
  const box = document.getElementById('active-chips');
  box.hidden = !chips.length;
  box.innerHTML = chips.map(([key, label]) => `<span class="chip">${label}<button type="button" data-remove="${key}" aria-label="Bỏ lọc">✕</button></span>`).join('');
}

function renderOptions() {
  const row = (name, value, label, checked) => `<label class="filter-row"><input type="radio" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}>${esc(label)}</label>`;
  document.getElementById('category-options').innerHTML =
    row('category', '', 'Tất cả thể loại', !state.category) + CATEGORIES.map(c => row('category', c, c, state.category === c)).join('');
  document.getElementById('price-options').innerHTML = PRICE_RANGES.map(r => row('price', r.id, r.label, state.price === r.id)).join('');
  document.getElementById('sort').value = state.sort;
}

function renderPagination(pages) {
  const nav = document.getElementById('pagination');
  if (pages <= 1) { nav.innerHTML = ''; return; }
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) items.push(i);
    else if (items[items.length - 1] !== '…') items.push('…');
  }
  nav.innerHTML =
    `<button type="button" data-page="${state.page - 1}" aria-label="Trang trước" ${state.page === 1 ? 'disabled' : ''}>‹</button>` +
    items.map(i => i === '…' ? '<span class="dots">…</span>' : `<button type="button" data-page="${i}" ${i === state.page ? 'aria-current="page"' : ''}>${i}</button>`).join('') +
    `<button type="button" data-page="${state.page + 1}" aria-label="Trang sau" ${state.page === pages ? 'disabled' : ''}>›</button>`;
}

function emptyMessage() {
  if (state.fav) return ['Bạn chưa có sách yêu thích', 'Bấm “Thêm vào yêu thích” ở trang chi tiết sách để lưu lại những cuốn bạn thích.'];
  if (state.q) return ['Không tìm thấy sách phù hợp', `Chúng mình chưa có kết quả cho “${esc(state.q)}”. Thử từ khóa ngắn hơn hoặc bỏ bớt bộ lọc nhé.`];
  return ['Không có sách phù hợp với bộ lọc', 'Thử đổi hoặc bỏ bớt bộ lọc để xem nhiều sách hơn.'];
}

function render() {
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (state.page > pages) state.page = pages;
  const start = (state.page - 1) * PER_PAGE;
  const slice = list.slice(start, start + PER_PAGE);

  renderHeading(list.length);
  renderChips();
  renderOptions();
  document.getElementById('result-count').textContent = list.length ? `Hiển thị ${start + 1}–${start + slice.length} trong ${list.length} sách` : '0 sách';
  document.getElementById('results').innerHTML = list.length
    ? slice.map(book => renderBookCard(book)).join('')
    : `<div class="empty-state"><h2>${emptyMessage()[0]}</h2><p>${emptyMessage()[1]}</p>${(state.category || state.price || state.q) ? '<button type="button" class="btn btn-primary" id="reset-all">Xóa bộ lọc</button>' : ''}</div>`;
  renderPagination(list.length ? pages : 1);
  document.getElementById('search-tip').hidden = !state.q;
  writeUrl();
}

function setFilter(change) { Object.assign(state, change, { page: 1 }); render(); }

function setupEvents() {
  const filters = document.getElementById('filters');
  const backdrop = document.getElementById('filters-backdrop');
  const setPanel = open => { filters.classList.toggle('open', open); backdrop.hidden = !open; };

  filters.addEventListener('change', event => {
    if (event.target.name === 'category') setFilter({ category: event.target.value });
    if (event.target.name === 'price') setFilter({ price: event.target.value });
  });
  document.getElementById('sort').addEventListener('change', e => setFilter({ sort: e.target.value }));
  document.getElementById('clear-filters').addEventListener('click', () => setFilter({ category: '', price: '' }));
  document.getElementById('open-filters').addEventListener('click', () => setPanel(true));
  document.getElementById('close-filters').addEventListener('click', () => setPanel(false));
  document.getElementById('apply-filters').addEventListener('click', () => setPanel(false));
  backdrop.addEventListener('click', () => setPanel(false));

  document.getElementById('active-chips').addEventListener('click', event => {
    const btn = event.target.closest('[data-remove]');
    if (!btn) return;
    if (btn.dataset.remove === 'q') { state.q = ''; document.getElementById('search-input').value = ''; }
    setFilter(btn.dataset.remove === 'q' ? {} : { [btn.dataset.remove]: '' });
  });
  document.getElementById('pagination').addEventListener('click', event => {
    const btn = event.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    render();
    document.getElementById('page-title').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('results').addEventListener('click', event => {
    if (event.target.id === 'reset-all') setFilter({ category: '', price: '', q: '' });
  });
}

loadBooks().then(books => { allBooks = books; setupEvents(); render(); })
  .catch(() => { document.getElementById('results').innerHTML = loadErrorHtml(); });
