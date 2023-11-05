import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#121212",
        tile: "var(--color-tile)",
        slate: "var(--color-slate)",
        liked: "var(--color-liked)",
      },
      gridTemplateColumns: {
        main: "1fr 2fr",
      },
      boxShadow: {
        album: "0 4px 60px rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [],
};
export default config;
