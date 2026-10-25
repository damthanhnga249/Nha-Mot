# Nhà Mọt

Website bán sách (bài tập nhóm môn Thiết kế web). Công nghệ: HTML, CSS, JavaScript thuần, không dùng framework.
Giao diện theo style guide và mockup Figma của nhóm. Dữ liệu chạy trên trình duyệt (localStorage), chưa có máy chủ.

## Cách chạy
1. Mở thư mục này bằng VS Code.
2. Dùng **Live Preview** hoặc **Live Server**: bấm chuột phải `index.html`, chọn Show Preview / Open with Live Server.
3. Không mở file bằng cách bấm đúp, vì trình duyệt sẽ chặn việc đọc `data/books.json`.

## Các trang (8 trang)
| Trang | File |
|---|---|
| Trang chủ | `index.html` |
| Danh mục sách (tìm kiếm, lọc, sắp xếp, phân trang, sách bán chạy / mới / khuyến mãi / yêu thích) | `products.html` |
| Chi tiết sách | `product-detail.html?id=1` |
| Giỏ hàng | `cart.html` |
| Thanh toán | `checkout.html` |
| Đặt hàng thành công | `success.html` |
| Đăng nhập, Đăng ký | `login.html`, `register.html` |

Địa chỉ của `products.html` nhận: `?q=` (từ khóa), `?category=` (thể loại), `?view=best|new|sale`, `?fav=1`, `?price=`, `?sort=`, `?page=`.

## Chức năng JavaScript
- Tìm kiếm không phân biệt dấu, lọc thể loại và khoảng giá, sắp xếp, phân trang (8 sách một trang)
- Thẻ sách vẽ từ `data/books.json` bằng `fetch` và thao tác DOM
- Giỏ hàng: thêm, đổi số lượng, xóa, tự tính tiền, giới hạn theo tồn kho, lưu trong localStorage
- "Mua ngay" thanh toán riêng một cuốn; sách yêu thích; số trên giỏ hàng và trái tim
- Thanh toán cho khách chưa đăng nhập; đã đăng nhập thì điền sẵn thông tin; kiểm tra biểu mẫu, báo lỗi dưới từng ô
- Đăng ký, đăng nhập mô phỏng. **Tài khoản dùng thử:** `nhombay@example.com` / `Demo1234`
- Banner 3 slide tự chuyển sau 4,5 giây, vuốt hoặc kéo chuột, mũi tên, chấm điều hướng, tự tạm dừng khi rê chuột, bấm Tab hoặc bấm nút tạm dừng
- Menu trượt và bảng lọc trên điện thoại, footer thu gọn, responsive (dưới 768 px, từ 1024 px)

## Cấu trúc
- `css/`: `variables.css` (màu, font, khoảng cách từ style guide), `base.css`, `components.css`, `forms.css`, `book-card.css`, mỗi trang một file CSS riêng
- `js/`: `ui.js` (header, footer, menu, thông báo), `data.js`, `cart.js`, `validate.js`, `book-card.js`, mỗi trang một file JS riêng
- `data/books.json`: 25 cuốn sách. `images/books/`: ảnh bìa (cắt từ ảnh tổng hợp của nhóm)

## Phần tự viết và phần dùng sẵn
Toàn bộ HTML, CSS, JavaScript do nhóm tự viết. Thư viện dùng sẵn (nạp qua CDN jsDelivr, cần có mạng): **Swiper 11** (banner tự chuyển và hai dải sách ở Trang chủ), **SweetAlert2 11** (hộp thoại xác nhận khi xóa sách khỏi giỏ hàng) và Google Fonts (Lora, Be Vietnam Pro). Biểu tượng là SVG tự vẽ. Mất mạng thì website vẫn chạy: banner chỉ hiện slide đầu, dải sách cuộn ngang, xóa sách dùng hộp thoại mặc định của trình duyệt.

## Ghi chú
- Đăng nhập, đặt hàng, email xác nhận đều là **mô phỏng** trên trình duyệt; mật khẩu chỉ được mã hóa đơn giản, không an toàn thật.
- Các mục footer chưa có trang (Giới thiệu, Tuyển dụng, Chính sách...) để chữ thường, không phải liên kết.

## Thành viên
(điền tên và phần việc)
