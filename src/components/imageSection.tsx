import React from "react";
import Image from "next/image";

export function ImageSection({ images }: { images: string[] }) {
  const count = Math.min(images.length, 4);

  if (count === 1) {
    return (
      <div className="w-[400px] h-[225px] rounded-lg overflow-hidden">
        <Image 
          src={images[0]} 
          alt="" 
          width={400}
          height={225}
          unoptimized={images[0].startsWith('data:')}
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 gap-1">
        {images.slice(0, 2).map((src, i) => (
          <Image
            key={i}
            src={src}
            alt=""
            width={200}
            height={225}
            unoptimized={src.startsWith('data:')}
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
        <Image
          src={images[0]}
          alt=""
          width={200}
          height={225}
          unoptimized={images[0].startsWith('data:')}
          className="w-full h-full object-cover row-span-2"
        />
        <Image 
          src={images[1]} 
          alt="" 
          width={200}
          height={112}
          unoptimized={images[1].startsWith('data:')}
          className="w-full h-full object-cover" 
        />
        <Image 
          src={images[2]} 
          alt="" 
          width={200}
          height={112}
          unoptimized={images[2].startsWith('data:')}
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
      {images.slice(0, 4).map((src, i) => (
        <Image 
          key={i} 
          src={src} 
          alt="" 
          width={200}
          height={112}
          unoptimized={src.startsWith('data:')}
          className="w-full h-full object-cover" 
        />
      ))}
    </div>
  );
}
