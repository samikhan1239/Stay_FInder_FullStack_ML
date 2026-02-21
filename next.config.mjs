/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "images.pexels.com",
      "maps.googleapis.com",
      "api.dicebear.com",
    ],
  },
};

export default nextConfig;
