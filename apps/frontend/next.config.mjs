import process from "node:process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  async rewrites() {
    const backendBase = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";
    return [
      {
        source: "/v1/:path*",
        destination: `${backendBase}/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
