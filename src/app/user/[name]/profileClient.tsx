"use client";

import React, { useRef, useState, useCallback } from "react";
import PostTile from "@/src/components/postTile";
import { getPostsWithReactionCountsByUsername } from "@/src/actions/posts";
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
    githubUsername: string | null;
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

export function ProfileClient({
  username,
  currentUserId,
  initialPosts,
}: {
  username: string;
  currentUserId?: string;
  initialPosts: PostType[];
}): React.JSX.Element {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(initialPosts.length === 20);
  const [currentPage, setCurrentPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const newPosts = await getPostsWithReactionCountsByUsername(
        username,
        currentUserId,
        nextPage,
        20
      );

      if (newPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setCurrentPage(nextPage);

        if (newPosts.length < 20) {
          setHasMorePosts(false);
        }
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMorePosts, currentPage, username, currentUserId]);

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

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500 text-center">
          <p className="text-lg">No posts yet</p>
          <p className="text-sm">This user hasn&apos;t posted anything yet.</p>
        </div>
      </div>
    );
  }

  return (
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
            githubUsername={post.author.githubUsername ?? undefined}
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
          You&apos;ve reached the end of this user&apos;s posts!
        </div>
      )}
    </div>
  );
}
