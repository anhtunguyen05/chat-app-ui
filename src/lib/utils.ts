import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOnlyEmoji(text: string) {
  return /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(
    text
  );
}
