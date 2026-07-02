import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12"
        },
        night: "#080706",
        ink: "#11100f",
        paper: "#f8f4ee"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "var(--font-noto-arabic)", "system-ui", "sans-serif"],
        arabic: ["var(--font-noto-arabic)", "var(--font-geist-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 28px 90px rgba(0, 0, 0, 0.42)",
        ember: "0 0 70px rgba(249, 115, 22, 0.22)"
      },
      backgroundImage: {
        "mesh-radial":
          "radial-gradient(circle at 18% 20%, rgba(249,115,22,.30), transparent 30%), radial-gradient(circle at 78% 12%, rgba(255,255,255,.13), transparent 24%), radial-gradient(circle at 56% 78%, rgba(194,65,12,.28), transparent 34%)"
      }
    }
  },
  plugins: []
};

export default config;
