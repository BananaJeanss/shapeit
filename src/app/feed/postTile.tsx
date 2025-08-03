import React from "react";
import * as shapes from "@/src/components/shapes";
import Image from "next/image";
import { Session } from "next-auth";
import { ImageSection } from "@/src/components/imageSection";

type PostTileProps = {
  username?: string;
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
};

export default function PostTile({
  username,
  userImage,
  textContent,
  date,
  images,
  shapeCounts,
}: PostTileProps) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 m-8">
      <div className="flex flex-row items-center p-4 gap-4">
        <Image
          src={userImage ?? ""}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col items-start ">
          <h3 className="text-xl font-semibold mb-0">
            @{username ?? "Anonymous User"}
          </h3>
          <div className="flex flex-row items-center justify-start">
            <p className="text-gray-600 text-sm">{date}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col mx-4 text-lg ">
        <p>{textContent}</p>
        <div className="flex flex-col items-center justify-center mt-4">
          {images && images.length > 0 && (
            <ImageSection images={images ?? []} />
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-start mt-4">
        <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
          <span>
            <shapes.Triangle
              className="inline mr-2 w-6 h-6 text-gray-600"
              fill="#4B5563"
            />
            {shapeCounts?.triangle ?? 0}
          </span>
        </button>
        <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
          <span>
            <shapes.Circle
              className="inline mr-2 w-6 h-6 text-gray-600"
              fill="#4B5563"
            />
            {shapeCounts?.circle ?? 0}
          </span>
        </button>
        <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
          <span>
            <shapes.Square
              className="inline mr-2 w-6 h-6 text-gray-600"
              fill="#4B5563"
            />
            {shapeCounts?.square ?? 0}
          </span>
        </button>
        <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
          <span>
            <shapes.Diamond
              className="inline mr-2 w-6 h-6 text-gray-600"
              fill="#4B5563"
            />
            {shapeCounts?.diamond ?? 0}
          </span>
        </button>
        <button className="text-white px-6 py-2 rounded-4xl cursor-pointer">
          <span>
            <shapes.Hexagon
              className="inline mr-2 w-6 h-6 text-gray-600"
              fill="#4B5563"
            />
            {shapeCounts?.hexagon ?? 0}
          </span>
        </button>
      </div>
    </div>
  );
}
