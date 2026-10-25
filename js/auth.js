/* auth.js — Đăng nhập, Đăng ký (MÔ PHỎNG, lưu trong localStorage của trình duyệt vì bài tập chưa có máy chủ) */
const USERS_KEY = 'nm_users';
const EYE_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

/* Mã hóa đơn giản chỉ để không lưu mật khẩu dạng chữ thường. KHÔNG an toàn thật. */
function encodePassword(text) { return btoa(unescape(encodeURIComponent(text))); }

function getUsers() { return readJSON(USERS_KEY, []); }

/* Tài khoản dùng thử cho buổi demo */
function seedDemoUser() {
  let users = getUsers();
  users = users.filter(u => u.email !== 'nhombay@example.com');   // xóa tài khoản dùng thử cũ nếu còn trên máy
  writeJSON(USERS_KEY, users);
  if (!users.some(u => u.email === 'nhombay@example.com')) {
    users.push({ name: 'Nhóm Bảy', email: 'nhombay@example.com', password: encodePassword('Demo1234') });
    writeJSON(USERS_KEY, users);
  }
}

/* Chỉ cho quay lại các trang của chính website (tránh chuyển hướng sang trang lạ) */
function nextPage() {
  const next = new URLSearchParams(location.search).get('next') || '';
  return /^[a-z0-9-]+\.html(\?[\w=&%.-]*)?$/i.test(next) ? next : 'index.html';
}

function startSession(user) { writeJSON('nm_user', { name: user.name, email: user.email }); }

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.innerHTML = EYE_ICON;
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(input.type === 'text'));
    });
  });
}

function setupLogin(form) {
  const alertBox = document.getElementById('login-alert');
  const lastEmail = localStorage.getItem('nm_last_email');
  if (lastEmail) { form.elements.email.value = lastEmail; form.elements.remember.checked = true; }
  clearErrorsOnInput(form);
  form.addEventListener('input', () => { alertBox.hidden = true; });

  document.getElementById('forgot-btn').addEventListener('click', () => showToast('Vui lòng liên hệ hotro@nhamot.vn để được đặt lại mật khẩu'));

  form.addEventListener('submit', event => {
    event.preventDefault();
    alertBox.hidden = true;
    // Bước 1: kiểm tra định dạng, sai thì báo dưới từng ô
    const ok = validateForm(form, {
      email: v => !v.trim() ? 'Vui lòng nhập email' : !isValidEmail(v) ? 'Email không hợp lệ' : '',
      password: v => !v ? 'Vui lòng nhập mật khẩu' : ''
    });
    if (!ok) return;
    // Bước 2: kiểm tra tài khoản, sai thì báo ở hộp lỗi chung
    const email = form.elements.email.value.trim().toLowerCase();
    const user = getUsers().find(u => u.email === email && u.password === encodePassword(form.elements.password.value));
    if (!user) { alertBox.textContent = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'; alertBox.hidden = false; form.elements.password.focus(); return; }
    if (form.elements.remember.checked) localStorage.setItem('nm_last_email', email); else localStorage.removeItem('nm_last_email');
    startSession(user);
    location.href = nextPage();
  });
}

function setupRegister(form) {
  clearErrorsOnInput(form);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const ok = validateForm(form, {
      fullName: v => v.trim().length < 2 ? 'Vui lòng nhập họ và tên' : '',
      email: v => {
        if (!v.trim()) return 'Vui lòng nhập email';
        if (!isValidEmail(v)) return 'Email không hợp lệ';
        return getUsers().some(u => u.email === v.trim().toLowerCase()) ? 'Email này đã được đăng ký' : '';
      },
      password: v => v.length < 8 || !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số' : '',
      confirm: (v, f) => !v ? 'Vui lòng nhập lại mật khẩu' : v !== f.elements.password.value ? 'Mật khẩu nhập lại chưa khớp' : '',
      terms: v => !v ? 'Vui lòng đồng ý với điều khoản sử dụng' : ''
    });
    if (!ok) return;
    const user = { name: form.elements.fullName.value.trim(), email: form.elements.email.value.trim().toLowerCase(), password: encodePassword(form.elements.password.value) };
    const users = getUsers();
    users.push(user);
    writeJSON(USERS_KEY, users);
    startSession(user);                    // đăng ký xong tự đăng nhập luôn
    location.href = nextPage();
  });
}

seedDemoUser();
setupPasswordToggles();

// Giữ tham số ?next= khi chuyển qua lại giữa hai tab
const nextParam = new URLSearchParams(location.search).get('next');
if (nextParam) document.querySelectorAll('.auth-tabs .tab').forEach(a => { a.href += '?next=' + encodeURIComponent(nextParam); });

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
if (loginForm) setupLogin(loginForm);
if (registerForm) setupRegister(registerForm);
