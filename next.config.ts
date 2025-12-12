import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace Node-only modules with empty mocks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        'why-is-node-running': false,
      };
    }
    return config;
  },
  // Empty turbopack config to satisfy Next.js requirements
  turbopack: {},
};

export default nextConfig;
