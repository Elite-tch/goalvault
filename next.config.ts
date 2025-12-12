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
        // React Native dependencies from MetaMask SDK
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
        // Optional pino dependencies
        'pino-pretty': false,
      };
    }
    return config;
  },
  // Empty turbopack config to satisfy Next.js requirements
  turbopack: {},
};

export default nextConfig;
