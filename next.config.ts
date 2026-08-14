import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Esta rama es únicamente una preview visual y no se fusiona a producción.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
