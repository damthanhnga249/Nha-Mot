/* validate.js — kiểm tra biểu mẫu. Báo lỗi ngay dưới từng ô, đưa con trỏ về ô sai đầu tiên.
   Mỗi ô nằm trong <div class="field"> hoặc <label class="check"> để hiện dòng lỗi. */

function isValidEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()); }
function isValidPhone(value) { return /^(0|\+84)\d{9}$/.test(String(value).replace(/[\s.-]/g, '')); }

function setFieldError(input, message) {
  const box = input.closest('.field, .check');
  if (!box) return;
  clearFieldError(input);
  box.classList.add('has-error');
  input.setAttribute('aria-invalid', 'true');
  const note = document.createElement('span');
  note.className = 'field-error';
  note.id = (input.id || input.name) + '-error';
  note.textContent = message;
  box.appendChild(note);
  input.setAttribute('aria-describedby', note.id);
}

function clearFieldError(input) {
  const box = input.closest('.field, .check');
  if (!box) return;
  box.classList.remove('has-error');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  box.querySelectorAll('.field-error').forEach(n => n.remove());
}

/* rules: { tenOName: (giaTri, form) => 'thông báo lỗi' hoặc '' nếu đúng }
   Trả về true nếu mọi ô hợp lệ */
function validateForm(form, rules) {
  let firstBad = null;
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    if (!input) return;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    const message = rules[name](value, form);
    if (message) { setFieldError(input, message); if (!firstBad) firstBad = input; }
    else clearFieldError(input);
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}

/* Xóa lỗi của một ô ngay khi người dùng gõ lại */
function clearErrorsOnInput(form) {
  form.addEventListener('input', event => { if (event.target.closest('.has-error')) clearFieldError(event.target); });
  form.addEventListener('change', event => { if (event.target.closest('.has-error')) clearFieldError(event.target); });
}
