"use client";

import React, { useRef, useState } from "react";
import { RightBar } from "@/src/components/rightBar";
import { LeftBar } from "@/src/components/leftBar";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { FeedInput } from "@/src/components/FeedInput";
import { ImageSection } from "@/src/components/imageSection";
import * as shapes from "@/src/components/shapes";

import type { Session } from "next-auth";

export function FeedClient({
  session,
}: {
  session: Session;
}): React.JSX.Element {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImages) => {
      setImages((prev) => [...prev, ...newImages].slice(0, 4));
    });
    e.target.value = "";
  };

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden">
      <LeftBar />
      <div className="flex flex-col border-r border-gray-300 flex-1 h-full">
        <h2 className="text-4xl font-semibold mx-8 my-4">Feed</h2>
        <hr style={{ width: "90%", margin: "0 auto" }} />
        <div className="flex flex-col m-4 p-5 rounded-md w-4/4 mx-auto align-middle">
          <FeedInput userImage={session.user?.image ?? undefined} />
          {images.length > 0 && (
            <div className="my-4 w-full flex flex-col items-center">
              <ImageSection images={images} />
              <div className="flex gap-2 mt-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className="text-xs text-red-500 underline cursor-pointer "
                    onClick={() => handleRemoveImage(idx)}
                    type="button"
                  >
                    Remove {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-row items-center justify-end mt-4 mx-2 gap-4 ">
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={images.length >= 4}
            />
            <button
              className="flex flex-row gap-2 cursor-pointer"
              onClick={handleAddImageClick}
              type="button"
              disabled={images.length >= 4}
            >
              <ImageIcon /> Add an image
            </button>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-4xl cursor-pointer">
              Post
            </button>
          </div>
        </div>
        <hr style={{ width: "90%", margin: "0 auto" }} />
        {/* placeholder for feed posts, gonna modularize this later */}
        <div className="border border-gray-300 rounded-xl p-4 m-8">
          <div className="flex flex-row items-center p-4 gap-4">
            <Image
              src={session.user?.image ?? ""}
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col items-start ">
              <h3 className="text-xl font-semibold mb-0">
                @{session.user?.name ?? "Anonymous User"}
              </h3>
              <div className="flex flex-row items-center justify-start">
                <p className="text-gray-600 text-sm">
                  August 3rd, 2025, 12:00 PM
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col mx-4 text-lg ">
            <p>content yadayada</p>
            <div className="flex flex-col items-center justify-center mt-4">
              <ImageSection
                images={[
                  "https://github.com/BananaJeanss/tchat/raw/main/assets/tchat.png",
                  "https://github.com/BananaJeanss/tchat/raw/main/assets/tchat.png",
                  "https://github.com/BananaJeanss/tchat/raw/main/assets/tchat.png",
                ]}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-start mt-4">
            <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
              <span>
                <shapes.Triangle
                  className="inline mr-2 w-6 h-6 text-gray-600"
                  fill="#4B5563"
                />
                0
              </span>
            </button>
            <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
              <span>
                <shapes.Circle
                  className="inline mr-2 w-6 h-6 text-gray-600"
                  fill="#4B5563"
                />
                0
              </span>
            </button>
            <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
              <span>
                <shapes.Square
                  className="inline mr-2 w-6 h-6 text-gray-600"
                  fill="#4B5563"
                />
                0
              </span>
            </button>
            <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
              <span>
                <shapes.Diamond
                  className="inline mr-2 w-6 h-6 text-gray-600"
                  fill="#4B5563"
                />
                0
              </span>
            </button>
            <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
              <span>
                <shapes.Hexagon
                  className="inline mr-2 w-6 h-6 text-gray-600"
                  fill="#4B5563"
                />
                0
              </span>
            </button>
          </div>
        </div>
      </div>
      <RightBar
        session={{
          user: {
            name: session.user?.name ?? undefined,
            image: session.user?.image ?? undefined,
          },
        }}
      />
    </div>
  );
}
