import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["artworks.thetvdb.com", "image.tmdb.org"],
  },
  async redirects() {
    return [
      // {
      //   source: "/social-links",
      //   destination: "/links",
      //   permanent: true,
      // },
    ]
  },
}

export default nextConfig
