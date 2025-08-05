"use client";

import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ProgressBar />
      </Suspense>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "var(--font-red-hat-display)",
            background: "#333",
            color: "#fff",
            border: "1px solid #999",
          },
        }}
      />
    </>
  );
}
