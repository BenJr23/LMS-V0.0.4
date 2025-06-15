/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'irknmlxwevdlhfqjdytv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/lms/subject-icons/**',
      },
    ],
  },
}

module.exports = nextConfig 