import withPWA from "next-pwa";

const withPWAModule = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
};

export default withPWAModule(nextConfig);
