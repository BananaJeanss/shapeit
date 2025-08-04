"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { RightBar } from "@/src/components/rightBar";
import { LeftBar } from "@/src/components/leftBar";
import { Image as ImageIcon } from "lucide-react";
import { FeedInput, type FeedInputRef } from "@/src/components/FeedInput";
import { ImageSection } from "@/src/components/imageSection";
import PostTile from "../../components/postTile";
import { createPost, getPostsWithReactionCounts } from "@/src/actions/posts";
import type { Session } from "next-auth";
import type { ShapeType } from "@prisma/client";
import toast from "react-hot-toast";

type PostType = {
  id: string;
  content: string;
  images: string[];
  authorId: string;
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
  currentUserId,
}: {
  session: Session;
  initialPosts: PostType[];
  currentUserId?: string;
}): React.JSX.Element {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [characterCount, setCharacterCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedInputRef = useRef<FeedInputRef>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CHARACTER_LIMIT = 365;

  const handleTextChange = useCallback((text: string) => {
    setCharacterCount(text.length);
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const newPosts = await getPostsWithReactionCounts(
        currentUserId,
        nextPage,
        20
      );

      if (newPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMorePosts, currentPage, currentUserId]);

  // intersection observer for infinite scroll
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (loadingRef.current) loadingRef.current = node;

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isLoadingMore) {
          loadMorePosts();
        }
      });

      if (node) observer.observe(node);
      return () => observer.disconnect();
    },
    [isLoadingMore, hasMorePosts, loadMorePosts]
  );

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

    if (content && content.length > CHARACTER_LIMIT) {
      toast.error(`Post exceeds character limit of ${CHARACTER_LIMIT}`);
      return;
    }

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content ?? "");

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await createPost(formData);

      // refresh the feed to show the new post
      const refreshedPosts = await getPostsWithReactionCounts(
        currentUserId,
        1,
        20
      );
      setPosts(refreshedPosts);
      setCurrentPage(1);
      setHasMorePosts(true);

      // clear the form
      feedInputRef.current?.clear();
      setCharacterCount(0);
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewImages([]);

      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // reset scroll position on refresh to prevent post loading unnecessarily
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="flex flex-row w-screen h-screen overflow-hidden">
      <div className="w-1/3 flex-shrink-0">
        <LeftBar />
      </div>
      <div className="flex flex-col border-r border-gray-300 w-1/3 flex-shrink-0 h-full">
        <h2 className="text-4xl font-semibold mx-8 my-4">Feed</h2>
        <hr style={{ width: "90%", margin: "0 auto" }} />
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="flex flex-col m-4 p-5 rounded-md w-4/4 mx-auto align-middle">
            <FeedInput
              ref={feedInputRef}
              userImage={session.user?.image ?? undefined}
              onTextChange={handleTextChange}
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
            <div className="flex flex-row items-center justify-between mt-4 mx-2">
              <div
                className={`flex flex-row items-center self-center ${characterCount > CHARACTER_LIMIT ? "text-red-500" : "text-gray-500"}`}
              >
                {characterCount}/{CHARACTER_LIMIT} characters
              </div>
              <div className="flex flex-row items-center justify-end mx-2 gap-4 ">
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
                  disabled={isPosting || characterCount > CHARACTER_LIMIT}
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
          <hr style={{ width: "90%", margin: "0 auto" }} />{" "}
          <div>
            {posts.map((post) => {
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
                  authorId={post.authorId}
                  currentUserId={currentUserId}
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

            {hasMorePosts && (
              <div ref={observerRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <div className="text-gray-500">Loading more posts...</div>
                ) : (
                  <div className="text-gray-400">Scroll to load more</div>
                )}
              </div>
            )}

            {!hasMorePosts && posts.length > 0 && (
              <div className="flex justify-center py-4 text-gray-500">
                You&apos;ve reached the end! Maybe make a post yourself?
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-1/3 flex-shrink-0">
        <RightBar
          session={{
            user: {
              name: session.user?.name ?? undefined,
              image: session.user?.image ?? undefined,
            },
          }}
        />
      </div>
    </div>
  );
}
