import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  images: {
    // cách 1: đơn giản
    domains: ["res.cloudinary.com"],

    // cách 2: nếu bạn muốn kiểm soát rõ pattern
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // cho phép tất cả path
      },
    ],

    qualities: [25, 50, 75, 100],
  },
};

export default nextConfig;
