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
