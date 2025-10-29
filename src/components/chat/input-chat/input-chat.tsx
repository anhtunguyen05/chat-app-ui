"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Icon } from "@/components/icon/icon";
import {
  sendMessage,
  typing,
  stopTyping,
  uploadImages,
} from "@/services/chatService";
import { ca } from "zod/v4/locales";

export default function InputChat() {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = useAppSelector((state) => state.user.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Gửi "typing"
    typing(currentUser?.id!, selectedUser?.id!);

    // Nếu sau 2s không gõ nữa → gửi "stopTyping"
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(currentUser?.id!, selectedUser?.id!);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ( !selectedUser || !currentUser) return;
    if(!message.trim() && images.length === 0) return;

    let imageUrls: string[] = [];

    if (images.length > 0) {
      try {
        console.log("Uploading images:", images);
        imageUrls = await uploadImages(images);
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    }

    sendMessage(
      currentUser.id,
      selectedUser.id,
      message.trim(),
      imageUrls,
      images.length && message ? "mixed" : images.length ? "image" : "text"
    );

    setMessage("");
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    stopTyping(currentUser.id, selectedUser.id);
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-transparent dark:bg-neutral-900 border-t dark:border-neutral-800">
      {/* LEFT ICONS */}

      <div className="flex items-center gap-2 text-blue-600">
        {images.length > 0 ? (
          <Icon
            name="circlePlus"
            className="w-5 h-5 text-violet-600"
            buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          />
        ) : (
          <>
            <Icon
              name="mic"
              className="w-5 h-5 text-violet-600"
              buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
            />
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Icon
                name="image"
                className="w-5 h-5 text-violet-600"
                buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
              />
            </label>
            <Icon
              name="sticker"
              className="w-5 h-5 text-violet-600"
              buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
            />
            <span className="font-bold text-sm cursor-pointer hover:opacity-80 text-violet-600">
              GIF
            </span>{" "}
          </>
        )}
      </div>

      {/* INPUT ZONE */}
      <div
        className={`flex flex-col flex-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl px-3 py-2 transition-all duration-200 ${
          images.length > 0 ? "max-h-60" : "h-12"
        }`}
      >
        {/* PREVIEW IMAGES */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 overflow-y-auto max-h-32">
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Icon
                name="image"
                className="w-7 h-7 text-black-500"
                buttonClassName="bg-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-neutral-80 w-12 h-12"
              />
            </label>
            {images.map((file, index) => (
              <div key={index} className="relative w-12 h-12">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-white text-gray-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TEXT + EMOJI */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Aa"
            value={message}
            onChange={handleChange}
            className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500"
          />
          <div className="relative">
            <Icon
              name="smile"
              className="w-5 h-5 text-violet-600"
              buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 w-10 h-10"
              onClick={() => setShowPicker(!showPicker)}
            />
            {showPicker && (
              <div className="absolute bottom-12 right-1 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEND OR LIKE */}
      {message.trim() || images.length > 0 ? (
        <Icon
          name="send"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
          onClick={handleSend}
        />
      ) : (
        <Icon
          name="thumbsUp"
          className="w-5 h-5 text-violet-600"
          buttonClassName="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-80 w-10 h-10"
        />
      )}
    </div>
  );
}
