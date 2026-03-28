/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/notes",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/rants",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/notes/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/rants/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
