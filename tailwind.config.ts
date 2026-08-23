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
        hs: {
          bg: "#FBF9F7",
          dark: "#052326",
          ink: "#14151C",
          muted: "#7B7B85",
          line: "#E8E6E1",
          accent: "#D3FB52",
          cyan: "#7AF3FF",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgba(20, 21, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
