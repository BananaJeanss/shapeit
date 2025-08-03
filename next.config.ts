import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "github.com",
      "avatars.githubusercontent.com",
      "raw.githubusercontent.com",
    ],
  },
};

export default nextConfig;
