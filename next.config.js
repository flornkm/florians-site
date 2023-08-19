/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			}
    ]
  }
}

module.exports = nextConfig