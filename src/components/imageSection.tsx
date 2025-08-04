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
      // calculate display size maintaining aspect ratio
      const maxWidth = 400;
      const maxHeight = 400;
      // min heights cause u dont want it to be unreadable
      const minWidth = 200;
      const minHeight = 150;

      const aspectRatio = img.naturalWidth / img.naturalHeight;

      let displayWidth, displayHeight;

      if (aspectRatio > 1) {
        // for wide images, prioritize fitting within maxWidth
        displayWidth = Math.min(maxWidth, img.naturalWidth);
        displayHeight = displayWidth / aspectRatio;

        // if height is too small, adjust based on min height
        if (displayHeight < minHeight) {
          displayHeight = minHeight;
          displayWidth = displayHeight * aspectRatio;
          // make sure it doesn't exceed maxWidth
          if (displayWidth > maxWidth) {
            displayWidth = maxWidth;
            displayHeight = displayWidth / aspectRatio;
          }
        }

        // apply minimum width constraint last
        if (displayWidth < minWidth) {
          displayWidth = minWidth;
          displayHeight = displayWidth / aspectRatio;
        }
      } else {
        displayHeight = Math.max(
          minHeight,
          Math.min(maxHeight, img.naturalHeight)
        );
        displayWidth = displayHeight * aspectRatio;

        // if width becomes too small, adjust based on min width
        if (displayWidth < minWidth) {
          displayWidth = minWidth;
          displayHeight = displayWidth / aspectRatio;
        }

        // also check that it doesn't exceed maxWidth for tall images
        if (displayWidth > maxWidth) {
          displayWidth = maxWidth;
          displayHeight = displayWidth / aspectRatio;
        }
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
          className="fixed top-4 right-4 text-white text-2xl border rounded-full bg-black/50 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center z-[60]"
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
      sizes="(max-width: 400px) 100vw, 400px"
    />
  );

  // if single image, use it's dimensions unlike >= 2
  if (count === 1) {
    if (!singleImageDimensions) {
      return (
        <div className="w-[400px] h-[225px] rounded-lg bg-gray-200 animate-pulse" />
      );
    }

    return (
      <>
        <div
          className="rounded-lg overflow-hidden relative"
          style={{
            width: `${singleImageDimensions.width}px`,
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
        <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 gap-1">
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
        <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
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
      <div className="w-[400px] h-[225px] rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1">
        <div className="relative">{renderImage(images[0], 0)}</div>
        <div className="relative">{renderImage(images[1], 1)}</div>
        <div className="relative">{renderImage(images[2], 2)}</div>
        <div className="relative">{renderImage(images[3], 3)}</div>
      </div>
      <Lightbox />
    </>
  );
}
