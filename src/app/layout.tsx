import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shapeit",
  description: "a social media where you react with shapes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${redHatDisplay.variable} antialiased`}
        style={{ fontFamily: "var(--font-red-hat-display)" }}
      >
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
