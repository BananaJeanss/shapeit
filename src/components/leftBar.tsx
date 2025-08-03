import React from "react";
import * as shapes from "@/src/components/shapes";

export function LeftBar() {
  return (
    <div className="flex flex-col items-center justify-center border-r border-gray-300 flex-1 h-full">
      <shapes.Triangle />
      <shapes.Circle />
      <shapes.Square />
      <shapes.Diamond />
      <shapes.Hexagon />
      <p>shapeit</p>
    </div>
  );
}