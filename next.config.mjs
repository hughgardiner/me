/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return Promise.resolve([
      {
        source: "/",
        destination: "/about",
        permanent: true,
      },
    ]);
  },
  images: {
    domains: ["i.scdn.co"],
  },

};

export default config;
