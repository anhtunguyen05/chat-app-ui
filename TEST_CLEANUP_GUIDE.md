# Hướng dẫn test cleanup mic/camera

## ⚠️ VẤN ĐỀ QUAN TRỌNG: Test trên cùng 1 máy

Khi test với 2 browser trên cùng 1 máy tính, bạn sẽ thấy icon mic vẫn hiện dù đã ended. Đây là **BÌNH THƯỜNG** vì:

- Browser A (caller) stop mic → ✅ cleanup thành công  
- Browser B (receiver) vẫn đang dùng mic → Icon vẫn hiện
- **Chỉ khi CẢ 2 browser đều ended thì icon mới mất**

### Tại sao?
- 2 browser đang dùng **chung 1 microphone vật lý**
- OS Windows hiển thị icon mic khi **BẤT KỲ app nào** đang dùng mic
- Dù Browser A đã stop, nhưng Browser B vẫn hold → Icon vẫn hiện

---

## ✅ CÁCH TEST ĐÚNG để verify cleanup

### Test Case 1: Kiểm tra Console Log (Dễ nhất)

**Bước 1:** Mở DevTools Console của **BROWSER GỌI TRƯỚC** (caller)

**Bước 2:** Bấm "End Call" trên browser đó

**Bước 3:** Tìm dòng log này trong Console:

```javascript
🛑 Controls stopping audio track, readyState: live
✅ Track audio stopped, new readyState: ended  // ← QUAN TRỌNG!
```

**Kết quả:**
- ✅ Nếu thấy `new readyState: ended` → **CLEANUP THÀNH CÔNG**
- ⚠️ Nếu thấy `readyState is still "live"` → Track bị giữ bởi browser khác (test cùng máy)
- ❌ Nếu thấy `localStreamRef is null` → Stream không được set (bug)

---

### Test Case 2: Test tuần tự 2 browser

**Bước 1:** Browser A gọi → Browser B nhận → Cuộc gọi connected

**Bước 2:** Browser A bấm "End Call"
- Check Console Browser A → Phải thấy `✅ Track audio stopped, new readyState: ended`
- Check icon mic Windows → **VẪN HIỆN** (vì Browser B còn dùng)

**Bước 3:** Browser B bấm "End Call"  
- Check Console Browser B → Phải thấy `✅ Track audio stopped, new readyState: ended`
- Check icon mic Windows → **PHẢI TẮT** (vì cả 2 đã cleanup)

**Kết luận:** Nếu icon mic tắt ở bước 3 → Code **ĐÚNG 100%**

---

### Test Case 3: Test với 2 máy khác nhau (Chuẩn nhất)

**Setup:**
- Máy A (Laptop) - Account 1
- Máy B (Laptop/Phone) - Account 2

**Test:**
1. Máy A gọi → Máy B nhận
2. Máy A bấm "End Call"
3. **Check icon mic trên Máy A** → PHẢI TẮT NGAY
4. Máy B vẫn thấy icon mic → Bình thường vì B chưa ended
5. Máy B bấm "End Call" → Icon mic trên Máy B phải tắt

**Kết luận:** Nếu icon mic tắt ngay khi ended → Code **HOÀN HẢO**

---

### Test Case 4: Test với 1 browser (Không cần 2 người)

**Cách 1: Dùng getUserMedia test**

Mở Console và chạy code này:

```javascript
// Lấy mic
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
console.log("Mic đang dùng, check icon Windows");

// Đợi 3 giây
await new Promise(r => setTimeout(r, 3000));

// Stop mic
stream.getTracks().forEach(t => t.stop());
console.log("Mic đã stop, check icon Windows - PHẢI TẮT");
```

**Kết quả:** Icon mic phải tắt ngay sau khi stop

**Cách 2: Test với app khác**
1. Mở 1 browser, gọi cho Zoom/Teams/Discord
2. Bấm "End Call" → Check icon mic **PHẢI TẮT**

---

## 🔍 DEBUG: Nếu vẫn thấy icon mic không tắt

### Kiểm tra 1: Stream có được set không?

Trong `call-modal.tsx`, thêm log:

```typescript
const initializeCaller = async () => {
  const stream = await createOffer();
  console.log("🔍 Setting stream to controls:", stream); // ← Thêm dòng này
  setLocalStream(stream);
};
```

**Kết quả mong đợi:** Phải thấy `MediaStream { id: "...", active: true }`

### Kiểm tra 2: Cleanup có được gọi không?

Thêm log trong `handleEndCall`:

```typescript
const handleEndCall = () => {
  console.log("🔴 USER CLICKED END CALL"); // ← Thêm
  cleanupControls();
  cleanup();
  // ...
};
```

**Kết quả mong đợi:** Phải thấy dòng log này khi bấm End Call

### Kiểm tra 3: Track có bị duplicate không?

Trong `useCallControls.cleanup()`, thêm:

```typescript
tracks.forEach((track, index) => {
  console.log(`Track ${index}:`, track.id, track.label); // ← Thêm
  track.stop();
});
```

**Kết quả:** Nếu thấy nhiều track cùng ID → Bị duplicate stream

---

## 🎯 KẾT LUẬN

### Code hiện tại là ĐÚNG nếu:
1. Console log hiện: `✅ Track audio stopped, new readyState: ended`
2. Test với 2 máy khác nhau → Icon mic tắt ngay khi ended
3. Chỉ khi test trên **cùng 1 máy với 2 browser** mới thấy icon vẫn hiện (do browser thứ 2 hold mic)

### Code có BUG nếu:
1. Console log: `⚠️ localStreamRef is null`
2. Test với 2 máy khác nhau mà icon mic vẫn không tắt
3. Track readyState vẫn là "live" sau khi stop (không phải do test cùng máy)

### Hành động tiếp theo:
1. ✅ Test với Console log theo Test Case 1
2. ✅ Test tuần tự 2 browser theo Test Case 2  
3. ✅ Nếu cả 2 OK → Code đã hoàn hảo, không cần sửa gì
4. ❌ Nếu vẫn lỗi → Cung cấp Console log để debug thêm
