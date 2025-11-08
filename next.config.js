// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { allowedOrigins: ["*"] } }, // harmless default; can remove if you prefer
};

module.exports = nextConfig;
