import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack (Next.js 16+) - WASM support is built-in
  turbopack: {},
  serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],

  // Webpack configuration (fallback when using --webpack flag)
  webpack: (config, { isServer }) => {
    // Enable WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Ignore node-specific modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "15mb", // Server Actions 제한
    },
  },
};

export default nextConfig;
