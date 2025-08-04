"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Image from "next/image";

export interface FeedInputRef {
  getValue: () => string;
  clear: () => void;
}

export const FeedInput = forwardRef<
  FeedInputRef,
  { userImage?: string; onTextChange?: (text: string) => void }
>(function FeedInput({ userImage, onTextChange }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => textareaRef.current?.value || "",
    clear: () => {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
        onTextChange?.("");
      }
    },
  }));

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
    onTextChange?.(target.value);
  };

  return (
    <div className="flex flex-row items-center">
      {userImage && (
        <Image
          src={userImage}
          alt="Profile Picture"
          className="w-12 h-12 rounded-full m-4 inline-block align-middle"
          width={48}
          height={48}
        />
      )}
      <textarea
        ref={textareaRef}
        placeholder="What's happening?"
        className="p-5 mx-4 w-full rounded-md align-middle resize-none overflow-hidden"
        rows={2}
        style={{ minHeight: "48px", maxHeight: "200px" }}
        onInput={handleInput}
      />
    </div>
  );
});
