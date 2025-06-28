import type { Configuration as WebpackConfig } from 'webpack';
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  webpack: (config: WebpackConfig) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  }
}

export default config;
