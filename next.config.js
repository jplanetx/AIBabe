const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next",
  outputFileTracingRoot: path.join(__dirname, "../"),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
