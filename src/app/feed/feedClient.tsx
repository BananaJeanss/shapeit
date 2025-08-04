"use client";

import React, { useRef, useState } from "react";
import { RightBar } from "@/src/components/rightBar";
import { LeftBar } from "@/src/components/leftBar";
import { Image as ImageIcon } from "lucide-react";
import { FeedInput, type FeedInputRef } from "@/src/components/FeedInput";
import { ImageSection } from "@/src/components/imageSection";
import PostTile from "./postTile";
import { createPost } from "@/src/actions/posts";
import type { Session } from "next-auth";
import type { ShapeType } from "@prisma/client";
import toast from 'react-hot-toast';


type PostType = {
  id: string;
  content: string;
  images: string[];
  createdAt: Date;
  author: {
    name: string | null;
    image: string | null;
  };
  shapeCounts: {
    triangle: number;
    circle: number;
    square: number;
    diamond: number;
    hexagon: number;
  };
  userReaction?: ShapeType | null;
};

export function FeedClient({
  session,
  initialPosts,
}: {
  session: Session;
  initialPosts: PostType[];
}): React.JSX.Element {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedInputRef = useRef<FeedInputRef>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).slice(0, 4 - selectedFiles.length);

    // preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...files].slice(0, 4));
    setPreviewImages((prev) => [...prev, ...previews].slice(0, 4));

    e.target.value = "";
  };

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (idx: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[idx]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePost = async () => {
    const content = feedInputRef.current?.getValue();

    if (!content?.trim()) {
      if (selectedFiles.length === 0) {
        toast.error("You can't post an empty post!");
        return;
      }
    }

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content ?? "");

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createPost(formData);

      // clear the form
      feedInputRef.current?.clear();
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center w-screen h-screen overflow-hidden">
      <LeftBar />
      <div className="flex flex-col border-r border-gray-300 flex-1 h-full">
        <h2 className="text-4xl font-semibold mx-8 my-4">Feed</h2>
        <hr style={{ width: "90%", margin: "0 auto" }} />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col m-4 p-5 rounded-md w-4/4 mx-auto align-middle">
            <FeedInput
              ref={feedInputRef}
              userImage={session.user?.image ?? undefined}
            />
            {previewImages.length > 0 && (
              <div className="my-4 w-full flex flex-col items-center">
                <ImageSection images={previewImages} />
                <div className="flex gap-2 mt-2">
                  {previewImages.map((_, idx) => (
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
                disabled={selectedFiles.length >= 4}
              />
              <button
                className="flex flex-row gap-2 cursor-pointer"
                onClick={handleAddImageClick}
                type="button"
                disabled={selectedFiles.length >= 4}
              >
                <ImageIcon /> Add an image
              </button>
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-4xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePost}
                type="button"
                disabled={isPosting}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
          <hr style={{ width: "90%", margin: "0 auto" }} />{" "}
          <div>
            {initialPosts.map((post) => {
              const dateObj = new Date(post.createdAt);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <PostTile
                  key={post.id}
                  id={post.id}
                  username={post.author.name ?? undefined}
                  userImage={post.author.image ?? undefined}
                  textContent={post.content}
                  date={`${dateStr} ${timeStr}`}
                  images={post.images}
                  shapeCounts={post.shapeCounts}
                  userReaction={post.userReaction}
                />
              );
            })}
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
