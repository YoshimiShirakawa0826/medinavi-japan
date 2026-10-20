import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/api/clinics/*': ['./data/generated/clinics.sqlite'],
  },
};

export default nextConfig;
