"use client";

import React, { useState, useRef, useEffect } from "react";
import * as shapes from "@/src/components/shapes";
import Image from "next/image";
import Link from "next/link";
import { ImageSection } from "@/src/components/imageSection";
import { toggleReaction, deletePost, reportPost } from "@/src/actions/posts";
import type { ShapeType } from "@prisma/client";
import { Ellipsis, Trash2, Flag } from "lucide-react";
import toast from "react-hot-toast";

type PostTileProps = {
  id: string;
  authorId: string;
  currentUserId?: string;
  username?: string;
  githubUsername?: string;
  userImage?: string;
  textContent?: string;
  date?: string;
  images?: string[];
  shapeCounts?: {
    triangle?: number;
    circle?: number;
    square?: number;
    diamond?: number;
    hexagon?: number;
  };
  userReaction?: ShapeType | null;
};

export default function PostTile({
  id,
  authorId,
  currentUserId,
  username,
  githubUsername,
  userImage,
  textContent,
  date,
  images,
  shapeCounts,
  userReaction,
}: PostTileProps) {
  const [hoveredShape, setHoveredShape] = useState<ShapeType | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [localUserReaction, setLocalUserReaction] = useState<ShapeType | null>(
    userReaction || null
  );
  const [localShapeCounts, setLocalShapeCounts] = useState({
    triangle: shapeCounts?.triangle ?? 0,
    circle: shapeCounts?.circle ?? 0,
    square: shapeCounts?.square ?? 0,
    diamond: shapeCounts?.diamond ?? 0,
    hexagon: shapeCounts?.hexagon ?? 0,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const isOwner = currentUserId && authorId === currentUserId;

  const handleReaction = async (shape: ShapeType) => {
    if (!currentUserId) return;

    const wasReacted = localUserReaction === shape;
    const newReaction = wasReacted ? null : shape;

    setLocalUserReaction(newReaction);
    setLocalShapeCounts((prev) => {
      const newCounts = { ...prev };

      if (localUserReaction) {
        const prevShapeKey =
          localUserReaction.toLowerCase() as keyof typeof newCounts;
        newCounts[prevShapeKey] = Math.max(0, newCounts[prevShapeKey] - 1);
      }

      if (newReaction) {
        const shapeKey = shape.toLowerCase() as keyof typeof newCounts;
        newCounts[shapeKey] = newCounts[shapeKey] + 1;
      }

      return newCounts;
    });

    try {
      await toggleReaction(id, shape);
    } catch (error) {
      // revert shape if it errors
      setLocalUserReaction(localUserReaction);
      setLocalShapeCounts({
        triangle: shapeCounts?.triangle ?? 0,
        circle: shapeCounts?.circle ?? 0,
        square: shapeCounts?.square ?? 0,
        diamond: shapeCounts?.diamond ?? 0,
        hexagon: shapeCounts?.hexagon ?? 0,
      });

      toast.error("Failed to toggle reaction. Please try again.");
      console.error("Error toggling reaction:", error);
    }
  };

  const handleDeletePost = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(id);
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to delete post. Please try again.");
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async () => {
    const reason = prompt("Please provide a reason for reporting this post:");
    if (!reason?.trim()) return;

    try {
      await reportPost(id, reason);
      toast.success(
        "Post reported successfully. (No actual functionality yet so this goes into the shredder)"
      );
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to report post. Please try again.");
      console.error("Error reporting post:", error);
    }
  };

  const getShapeColor = (shape: ShapeType, isHover = false) => {
    const isReacted = localUserReaction === shape;

    switch (shape) {
      case "CIRCLE":
        if (isReacted) {
          return isHover ? "#059669" : "#10B981";
        }
        return isHover ? "#059669" : "#9CA3AF";
      case "DIAMOND":
        if (isReacted) {
          return isHover ? "#E11D48" : "#F43F5E";
        }
        return isHover ? "#E11D48" : "#9CA3AF";
      case "HEXAGON":
        if (isReacted) {
          return isHover ? "#D97706" : "#FBBF24";
        }
        return isHover ? "#D97706" : "#9CA3AF";
      case "SQUARE":
        if (isReacted) {
          return isHover ? "#3730A3" : "#4F46E5";
        }
        return isHover ? "#3730A3" : "#9CA3AF";
      case "TRIANGLE":
        if (isReacted) {
          return isHover ? "#EA580C" : "#F59E42";
        }
        return isHover ? "#EA580C" : "#9CA3AF";
      default:
        return isHover ? "#4B5563" : "#9CA3AF";
    }
  };
  return (
    <div className="relative border border-gray-300 rounded-xl p-4 m-8">
      <div className="absolute top-4 right-4">
        <div className="relative" ref={menuRef}>
          <button
            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setShowMenu(!showMenu)}
            disabled={isDeleting}
          >
            <Ellipsis className="w-5 h-5 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-10">
              {isOwner && (
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </button>
              )}

              {!isOwner && (
                <button
                  onClick={handleReportPost}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row items-center p-4 gap-4">
        <Image
          src={userImage ?? ""}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col items-start ">
          <h3 className="text-xl font-semibold mb-0 ">
            {githubUsername ? (
              <Link href={`/user/${githubUsername}`}>@{githubUsername}</Link>
            ) : (
              `@${username ?? "Anonymous User"}`
            )}
          </h3>
          <div className="flex flex-row items-center justify-start">
            <p className="text-gray-600 text-sm">{date}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col mx-4 text-lg ">
        <p className="break-all">{textContent}</p>
        <div className="flex flex-col items-center justify-center mt-4">
          {images && images.length > 0 && (
            <ImageSection images={images ?? []} />
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-start mt-4">
        <button
          className="text-white px-6 py-2 rounded-4xl cursor-pointer transition-colors"
          onClick={() => handleReaction("TRIANGLE")}
          onMouseEnter={() => setHoveredShape("TRIANGLE")}
          onMouseLeave={() => setHoveredShape(null)}
        >
          <span>
            <shapes.Triangle
              className="inline mr-2 w-6 h-6"
              fill={getShapeColor("TRIANGLE", hoveredShape === "TRIANGLE")}
            />
            {localShapeCounts.triangle}
          </span>
        </button>
        <button
          className="text-white px-6 py-2 rounded-4xl cursor-pointer transition-colors"
          onClick={() => handleReaction("CIRCLE")}
          onMouseEnter={() => setHoveredShape("CIRCLE")}
          onMouseLeave={() => setHoveredShape(null)}
        >
          <span>
            <shapes.Circle
              className="inline mr-2 w-6 h-6"
              fill={getShapeColor("CIRCLE", hoveredShape === "CIRCLE")}
            />
            {localShapeCounts.circle}
          </span>
        </button>
        <button
          className="text-white px-6 py-2 rounded-4xl cursor-pointer transition-colors"
          onClick={() => handleReaction("SQUARE")}
          onMouseEnter={() => setHoveredShape("SQUARE")}
          onMouseLeave={() => setHoveredShape(null)}
        >
          <span>
            <shapes.Square
              className="inline mr-2 w-6 h-6"
              fill={getShapeColor("SQUARE", hoveredShape === "SQUARE")}
            />
            {localShapeCounts.square}
          </span>
        </button>
        <button
          className="text-white px-6 py-2 rounded-4xl cursor-pointer transition-colors"
          onClick={() => handleReaction("DIAMOND")}
          onMouseEnter={() => setHoveredShape("DIAMOND")}
          onMouseLeave={() => setHoveredShape(null)}
        >
          <span>
            <shapes.Diamond
              className="inline mr-2 w-6 h-6"
              fill={getShapeColor("DIAMOND", hoveredShape === "DIAMOND")}
            />
            {localShapeCounts.diamond}
          </span>
        </button>
        <button
          className="text-white px-6 py-2 rounded-4xl cursor-pointer transition-colors"
          onClick={() => handleReaction("HEXAGON")}
          onMouseEnter={() => setHoveredShape("HEXAGON")}
          onMouseLeave={() => setHoveredShape(null)}
        >
          <span>
            <shapes.Hexagon
              className="inline mr-2 w-6 h-6"
              fill={getShapeColor("HEXAGON", hoveredShape === "HEXAGON")}
            />
            {localShapeCounts.hexagon}
          </span>
        </button>
      </div>
    </div>
  );
}
