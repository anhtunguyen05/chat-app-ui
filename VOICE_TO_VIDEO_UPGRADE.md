# 📹 Voice to Video Call Upgrade Feature

## ✅ Đã implement (Frontend)

### **1. `usePeerConnection.ts` - WebRTC renegotiation**

#### **Thêm video track**
```typescript
addVideoTrack() {
  // 1. Xin quyền camera
  const videoStream = await getUserMedia({ video: true });
  
  // 2. Add video track vào local stream
  localStream.current.addTrack(videoTrack);
  
  // 3. Add video track vào peer connection
  peerConnection.current.addTrack(videoTrack, localStream);
  
  // 4. Tạo offer mới (renegotiate)
  const offer = await peerConnection.current.createOffer();
  await peerConnection.current.setLocalDescription(offer);
  
  // 5. Emit renegotiate offer
  socket.emit("call:renegotiate", { offer, callType: "video" });
}
```

#### **Xóa video track** (Downgrade video → voice)
```typescript
removeVideoTrack() {
  const videoTrack = localStream.getVideoTracks()[0];
  videoTrack.stop();
  localStream.removeTrack(videoTrack);
  
  // Remove sender từ peer connection
  const sender = peerConnection.getSenders().find(s => s.track === videoTrack);
  peerConnection.removeTrack(sender);
}
```

#### **Handle renegotiation từ peer**
```typescript
handleRenegotiation(offer) {
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  
  socket.emit("call:renegotiate-answer", { answer });
}

handleRenegotiationAnswer(answer) {
  await peerConnection.setRemoteDescription(answer);
}
```

---

### **2. `useCallControls.ts` - UI controls**

#### **Thêm state tracking**
```typescript
const [currentCallType, setCurrentCallType] = useState<"voice" | "video">(callType);
```

#### **Toggle video với upgrade logic**
```typescript
toggleVideo() {
  const videoTrack = localStream.getVideoTracks()[0];
  
  if (currentCallType === "video" && videoTrack) {
    // Case 1: Video call - tắt/bật video
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoOff(!videoTrack.enabled);
  }
  else if (currentCallType === "voice" && !videoTrack) {
    // Case 2: Voice call - UPGRADE to video
    await onAddVideoTrack(); // ← Gọi callback từ call-modal
    setCurrentCallType("video");
    onCallTypeChange("video");
  }
}
```

---

### **3. `call-modal.tsx` - Integration**

#### **Socket listeners**
```typescript
socket.on("call:renegotiate", (data) => {
  // Peer muốn upgrade/downgrade
  if (data.callType) setRemoteCallType(data.callType);
  handleRenegotiation(data.offer);
});

socket.on("call:renegotiate-answer", (data) => {
  handleRenegotiationAnswer(data.answer);
});
```

#### **Callbacks cho useCallControls**
```typescript
const { toggleVideo } = useCallControls({
  onAddVideoTrack: async () => {
    const videoTrack = await addVideoTrack();
    // Update UI to show video
    setLocalStreamState(new MediaStream(localStream.current.getTracks()));
    return videoTrack;
  },
  onRemoveVideoTrack: () => {
    removeVideoTrack();
    setLocalStreamState(new MediaStream(localStream.current.getTracks()));
  }
});
```

---

## 🔧 Backend cần implement

### **Socket events mới**

#### **1. `call:renegotiate`** (Upgrade/downgrade request)
```typescript
// User A upgrade voice → video
socket.on("call:renegotiate", (data) => {
  // data = { to, conversationId, offer, callType: "video" }
  
  // Forward to User B
  io.to(data.to).emit("call:renegotiate", {
    from: socket.userId,
    conversationId: data.conversationId,
    offer: data.offer,
    callType: data.callType
  });
});
```

#### **2. `call:renegotiate-answer`** (Renegotiation answer)
```typescript
// User B answer renegotiation
socket.on("call:renegotiate-answer", (data) => {
  // data = { to, conversationId, answer }
  
  // Forward to User A
  io.to(data.to).emit("call:renegotiate-answer", {
    from: socket.userId,
    conversationId: data.conversationId,
    answer: data.answer
  });
});
```

---

## 🔄 Flow hoạt động

### **Scenario: Voice call → Upgrade to video**

```
User A (Voice)                           User B (Voice)
    │                                         │
    │ 1. Click nút camera                     │
    ├─ toggleVideo()                          │
    ├─ addVideoTrack()                        │
    │  ├─ getUserMedia(video)                 │
    │  ├─ Add track to stream & peer          │
    │  └─ createOffer()                       │
    │                                         │
    ├──── call:renegotiate (offer) ─────────→│
    │                                         │ 2. Nhận renegotiation
    │                                         ├─ handleRenegotiation(offer)
    │                                         ├─ setRemoteDescription(offer)
    │                                         ├─ createAnswer()
    │                                         │
    │←──── call:renegotiate-answer ──────────┤
    │                                         │
    │ 3. setRemoteDescription(answer)         │
    │                                         │
    │═══════ Video tracks flow ═══════════════│
    │                                         │
    Video call established!                  Video call established!
    (Both see video)                         (Both see video)
```

---

## 📊 State changes

| Event | User A State | User B State |
|-------|--------------|--------------|
| Initial | `currentCallType: "voice"` | `currentCallType: "voice"` |
| A clicks camera | `currentCallType: "video"` | Still `"voice"` |
| Renegotiation sent | Waiting for answer | - |
| B receives offer | - | `remoteCallType: "video"` |
| B sends answer | - | Still `"voice"` (chỉ nhận video A) |
| A receives answer | ✅ Video tracks flowing | ✅ Receiving A's video |

**Note:** User B vẫn ở voice mode cho đến khi B cũng click camera button.

---

## 🎯 User Experience

### **Voice call → Video call**
1. ✅ User A trong voice call
2. ✅ A nhấn nút camera 📹
3. ✅ Camera A bật → Video tracks gửi đến B
4. ✅ B thấy video của A (B vẫn voice-only)
5. ✅ B muốn bật camera → Click nút camera → Cả 2 video

### **Video call → Voice call** (Future)
1. User A trong video call
2. A nhấn nút camera lần nữa (toggle off permanently)
3. `removeVideoTrack()` → Renegotiate lại
4. Downgrade to voice call

---

## 🐛 Testing checklist

- [ ] Voice call: Click camera → Upgrade to video ✅
- [ ] Peer nhận được video track từ upgrade
- [ ] UI update hiển thị video sau upgrade
- [ ] `currentCallType` sync giữa 2 peers
- [ ] Renegotiation không break audio
- [ ] ICE candidates vẫn trao đổi đúng
- [ ] End call cleanup video tracks properly
- [ ] Permission denied → Show error (không crash)

---

## 💡 Lưu ý quan trọng

### **1. Asymmetric upgrade**
```typescript
// User A có thể upgrade voice → video
// User B vẫn ở voice mode
// → A gửi video cho B, B không gửi video về A
currentCallType: "voice" | "video" // Local state
remoteCallType: "voice" | "video"  // Peer's call type
```

### **2. UI hiển thị**
```typescript
// VideoDisplay chỉ show video khi:
hasLocalVideo: true  → currentCallType === "video" && videoTrack.enabled
hasRemoteVideo: true → remoteCallType === "video" && remoteVideoTrack exists
```

### **3. Renegotiation timing**
```typescript
// Phải đợi setLocalDescription xong mới emit
await peerConnection.setLocalDescription(offer);
socket.emit("call:renegotiate", { offer }); // ← Sau khi set xong
```

### **4. Stream reference update**
```typescript
// Sau khi add track, phải trigger re-render
setLocalStreamState(new MediaStream(localStream.current.getTracks()));
// → VideoDisplay sẽ nhận stream mới và hiển thị video
```

---

## 🚀 Next steps

1. ✅ Frontend implemented
2. ⏳ **Backend cần add 2 socket events:**
   - `call:renegotiate`
   - `call:renegotiate-answer`
3. ⏳ Test end-to-end flow
4. ⏳ Handle edge cases (permission denied, slow network, etc.)
