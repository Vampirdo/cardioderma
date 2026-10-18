/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAF7F3",
          100: "#D2EEE5",
          500: "#11967F",
          600: "#0E7C6B",
          700: "#0B6355",
          800: "#0A4A41",
          900: "#072F2A",
        },
        coral: { DEFAULT: "#FF6B5B", soft: "#FFE9E5" },
        sand: { DEFAULT: "#FAF6EF", dark: "#F0E9DC" },
        honey: "#F2B35E",
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};