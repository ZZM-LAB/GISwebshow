/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 湿地主题色系
        wetland: {
          50: "#f0f7f4",
          100: "#dceee7",
          200: "#bbddcf",
          300: "#8dc4ac",
          400: "#5da589",
          500: "#3d8869",
          600: "#2f6e54",
          700: "#1a5f4a", // 主色：深青绿
          800: "#164d3c",
          900: "#0f3a2d",
          950: "#082519",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706", // 强调色：琥珀
          700: "#b45309",
        },
        cream: "#faf8f3", // 背景：米白
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
