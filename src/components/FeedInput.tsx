"use client";
import React, { useRef } from "react";
import Image from "next/image";

export function FeedInput({ userImage }: { userImage?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
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
}
