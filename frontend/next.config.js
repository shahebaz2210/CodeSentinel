/** @type {import('next').NextConfig} */
let rawBackendUrl = process.env.BACKEND_URL?.trim();

// Sanitize BACKEND_URL: prevent invalid values like literal "BACKEND_URL" or missing protocol
if (!rawBackendUrl || rawBackendUrl === 'BACKEND_URL') {
  rawBackendUrl = 'http://127.0.0.1:8000';
} else if (!rawBackendUrl.startsWith('http://') && !rawBackendUrl.startsWith('https://')) {
  rawBackendUrl = `https://${rawBackendUrl}`;
}
const backendUrl = rawBackendUrl.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
