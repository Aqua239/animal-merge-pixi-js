# Nội quy làm việc nhóm (Contributing Guidelines)

Để dự án `animal-merge-pixi-js` phát triển mượt mà và không bị xung đột code (conflict), toàn bộ thành viên vui lòng tuân thủ các quy tắc dưới đây.

---

## 1. Viết bằng tiếng anh
* **Tất cả liên quan đến code, commit, pull request phải viết bằng tiếng anh**

## 2. Quy chuẩn nhánh và commit (Branch & Commit)
* **Quy tắc tên nhánh (Branch name):**
Cú pháp: `loại-công-việc/mô-tả-ngắn-gọn` (ví dụ: `feat/drop-mechanic`)

* **Quy tắc Commit**
`git commit -m "<loại>: <mô_tả_công_việc>"`

* **Các loại commit hợp lệ:**
  * `feat`: Thêm tính năng mới (ví dụ: logic rớt thú, âm thanh).
  * `fix`: Sửa lỗi (bug).
  * `refactor`: Tối ưu hóa code nhưng không làm thay đổi logic hoạt động.
  * `chore`: Cập nhật cấu hình, thư viện, hoặc các tác vụ không liên quan đến code game.
  * `assets`: Dành riêng cho việc thêm, sửa, hoặc xóa các tài nguyên game như hình ảnh (Sprite/texture), âm thanh, hoặc animation.
  * `doc`: Dành cho việc cập nhật tài liệu như README.md,...

* **Ví dụ thực tế:**
> `git commit -m "feat: add circle physics body"`

## 3. Quy tắc viết code (Vanilla JS & PixiJS)
* **Khai báo biến:** Luôn dùng `const` cho hằng số và `let` cho biến thay đổi. Tuyệt đối không dùng `var`.
* **Quy tắc đặt tên (Naming convention):**
  * Tên biến và hàm dùng `camelCase`: `animalSprite`, `dropAnimal()`.
  * Tên biến là danh từ `healthPoint`
  * Tên hàm là động từ `dropAnimal()`
  * Tên class dùng `PascalCase`: `GameManager`, `PhysicsEngine`.
* **Dấu chấm phẩy:** Bắt buộc phải có dấu chấm phẩy (`;`) ở cuối mỗi câu lệnh.
* **Quy tắc hàm:** `()` dính liền với tên hàm, sau đó nhấn 1 dấu space (khoảng trắng) rồi mới tới `{`.
```javascript
  function dropAnimals() {
      // Code
  }
```
## 4. Quy tắc viết Pull Request
* **Tiêu đề:** Cú pháp: `loại-công-việc/mô-tả-ngắn-gọn`
* **Mô tả:**
  ```markdown
  ## Overview
    - Mô tả chung, sau đó mô tả chi tiết các việc đã làm
  ## Motivation and Context
    - Lý do thực hiện thay đổi này
  ```
