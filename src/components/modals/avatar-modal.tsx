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
import { updateAvatarRequest, resetSuccess } from "@/features/user/userSlice";
import { UpdateAvatarPayload } from "@/features/user/userType";

interface AvatarModalProps {
  children: React.ReactNode;
}

export default function AvatarModal({ children }: AvatarModalProps) {
  const dispatch = useAppDispatch();
  const { success, loading } = useAppSelector((state) => state.user);

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleSave = () => {
    if (!file) return;

    dispatch(updateAvatarRequest({ file }));
  };

  React.useEffect(() => {
    if (success) {
      setOpen(false);
      setFile(null);
      setPreview(null);

      // reset lại success cho lần sau
      dispatch(resetSuccess());
    }
  }, [success, dispatch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn ảnh đại diện</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Upload ảnh mới */}
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
                  className="w-40 h-40 rounded-full object-cover border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer action */}
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
