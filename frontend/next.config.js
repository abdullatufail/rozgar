/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "via.placeholder.com", "placehold.co", "images.unsplash.com", "plus.unsplash.com", "images.pexels.com"],
  },
  webpack: (config, { isServer }) => {
    // Optimize chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      },
    };

    return config;
  },
};

module.exports = nextConfig; 