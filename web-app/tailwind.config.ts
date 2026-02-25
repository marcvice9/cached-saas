import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        switzer: ["Switzer", "sans-serif"],
      },
      colors: {
        brand: {
          dark: "#09090B",
          teal: "#06D6A0",
          gray: "#31313A",
          bg: "#09090B",
          surface: "#202026",
        },
      },
      letterSpacing: {
        tight5: "-2.5px",
      },
    },
  },
  plugins: [],
};

export default config;
