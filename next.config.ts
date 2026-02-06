import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =====================================================
  // Performance Optimizations
  // =====================================================

  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Optimize images
  images: {
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Remote patterns for user avatars
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
    // Minimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Experimental features for performance
  experimental: {
    // Enable optimized package imports to reduce bundle size
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@carbon/icons-react",
      "framer-motion",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // =====================================================
  // Security Headers
  // =====================================================
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS prefetch for faster navigation
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // HSTS - force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict permissions
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(js|css|woff|woff2|ttf|otf|ico|png|jpg|jpeg|gif|svg|webp|avif)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // =====================================================
  // Build Optimizations
  // =====================================================

  // Disable source maps in production for security and smaller builds
  productionBrowserSourceMaps: false,

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable gzip compression
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Powered by header (disable for security)
  poweredByHeader: false,
};

export default nextConfig;
