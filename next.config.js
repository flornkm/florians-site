/** @type {import('next').NextConfig} */
const { withContentlayer } = require("next-contentlayer")

const nextConfig = {
  // experimental: {
  //   serverActions: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = withContentlayer(nextConfig)
