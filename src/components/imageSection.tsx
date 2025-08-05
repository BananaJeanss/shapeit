import React, { useState, useCallback, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export function ImageSection({ images }: { images: string[] }) {
  const count = Math.min(images.length, 4);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [singleImageDimensions, setSingleImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // close on esc key
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIdx]);

  // load single image dimensions
  useEffect(() => {
    if (count !== 1) return;

    const img = new window.Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      const maxWidth = 400;
      const maxHeight = 300;
      const minHeight = 150; // min height

      let displayWidth, displayHeight;

      if (aspectRatio > 1) {
        // for wide images fit to width
        displayWidth = maxWidth;
        displayHeight = Math.max(minHeight, displayWidth / aspectRatio);

        if (displayHeight > maxHeight) {
          displayHeight = maxHeight;
          displayWidth = displayHeight * aspectRatio;
        }
      } else {
        // for tall images fit to height
        displayHeight = Math.min(
          maxHeight,
          Math.max(minHeight, maxWidth / aspectRatio)
        );
        displayWidth = displayHeight * aspectRatio;
      }

      setSingleImageDimensions({
        width: Math.round(displayWidth),
        height: Math.round(displayHeight),
      });
    };
    img.src = images[0];
  }, [count, images]);

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  // lightbox modal
  const Lightbox = () =>
    lightboxIdx !== null ? (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={closeLightbox}
      >
        <div
          className="inline-block relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[lightboxIdx]}
            alt=""
            width={800}
            height={600}
            unoptimized={images[lightboxIdx].startsWith("data:")}
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
          />
        </div>
        <button
          className="fixed cursor-pointer top-4 right-4 text-white text-2xl border rounded-full bg-black/50 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center z-[60]"
          onClick={closeLightbox}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    ) : null;

  const renderImage = (
    src: string,
    i: number,
    props: Partial<ImageProps> = {}
  ) => (
    <Image
      key={i}
      src={src}
      alt=""
      fill
      unoptimized={src.startsWith("data:")}
      className={`object-cover cursor-pointer ${props.className ?? ""}`}
      onClick={() => openLightbox(i)}
      sizes="(max-width: 768px) 50vw, (max-width: 400px) 100vw, 200px"
    />
  );

  // if single image, use it's dimensions unlike >= 2
  if (count === 1) {
    if (!singleImageDimensions) {
      return (
        <div className="w-full max-w-sm aspect-video rounded-lg bg-gray-200 animate-pulse" />
      );
    }

    return (
      <>
        <div
          className="rounded-lg overflow-hidden relative w-full max-w-sm"
          style={{
            maxWidth: `${singleImageDimensions.width}px`,
            height: `${singleImageDimensions.height}px`,
          }}
        >
          <Image
            src={images[0]}
            alt=""
            fill
            unoptimized={images[0].startsWith("data:")}
            className="object-contain cursor-pointer"
            onClick={() => openLightbox(0)}
            sizes="(max-width: 400px) 100vw, 400px"
          />
        </div>
        <Lightbox />
      </>
    );
  }

  if (count === 2) {
    return (
      <>
        <div className="w-full max-w-sm aspect-video rounded-lg overflow-hidden grid grid-cols-2 gap-1">
          <div className="relative">{renderImage(images[0], 0)}</div>
          <div className="relative">{renderImage(images[1], 1)}</div>
        </div>
        <Lightbox />
      </>
    );
  }

  if (count === 3) {
    return (
      <>
        <div className="w-full max-w-sm aspect-video rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
          <div className="relative row-span-2">{renderImage(images[0], 0)}</div>
          <div className="relative">{renderImage(images[1], 1)}</div>
          <div className="relative">{renderImage(images[2], 2)}</div>
        </div>
        <Lightbox />
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-sm aspect-video rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
        <div className="relative">{renderImage(images[0], 0)}</div>
        <div className="relative">{renderImage(images[1], 1)}</div>
        <div className="relative">{renderImage(images[2], 2)}</div>
        <div className="relative">{renderImage(images[3], 3)}</div>
      </div>
      <Lightbox />
    </>
  );
}
