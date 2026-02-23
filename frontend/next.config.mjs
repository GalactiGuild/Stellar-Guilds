import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we are not forcing turbo in config
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false,
  },
};

export default withNextIntl(nextConfig);
