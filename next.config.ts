import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // i18n 설정 (middleware에서 처리)
  trailingSlash: false, // URL 정규화: trailing slash 제거
};

export default nextConfig;
