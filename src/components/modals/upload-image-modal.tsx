"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { resetSuccess } from "@/features/user/userSlice";

interface UploadImageModalProps {
  children: React.ReactNode;
  type: "avatar" | "cover"; // ✅ loại upload
  onUpload: (file: File) => void; // ✅ action upload truyền từ ngoài
  title?: string; // ✅ cho phép đổi tiêu đề
}

export default function UploadImageModal({
  children,
  type,
  onUpload,
  title,
}: UploadImageModalProps) {
  const dispatch = useAppDispatch();
  const { success, loading } = useAppSelector((state) => state.user);

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = () => {
    if (!file) return;
    onUpload(file);
  };

  React.useEffect(() => {
    if (success) {
      setOpen(false);
      setFile(null);
      setPreview(null);
      dispatch(resetSuccess());
    }
  }, [success, dispatch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {title || (type === "avatar" ? "Chọn ảnh đại diện" : "Chọn ảnh bìa")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Tải ảnh mới</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:bg-gray-50">
              <span className="text-gray-600">📷 Chọn ảnh từ máy</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {preview && (
              <div className="mt-4">
                <p className="font-medium mb-2">Ảnh đã chọn:</p>
                <img
                  src={preview}
                  alt="preview"
                  className={
                    type === "avatar"
                      ? "w-40 h-40 rounded-full object-cover border"
                      : "w-full h-40 rounded-md object-cover border"
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button variant="default" onClick={handleSave}>
            {loading ? "Đang lưu..." : "Lưu ảnh"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
