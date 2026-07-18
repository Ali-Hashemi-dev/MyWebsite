import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        wood: {
          deep: "var(--wood-deep)",
          DEFAULT: "var(--wood)",
          warm: "var(--wood-warm)"
        },
        parchment: {
          DEFAULT: "var(--parchment)",
          dim: "var(--parchment-dim)"
        },
        "warm-gray": "var(--warm-gray)",
        bronze: "var(--bronze)",
        gold: "var(--gold)",
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)"
        }
      },
      fontFamily: {
        sans: ["var(--font-plex-arabic)", "system-ui", "sans-serif"],
        display: ["var(--font-ruqaa)", "serif"],
        naskh: ["var(--font-naskh)", "serif"]
      },
      boxShadow: {
        book: "0 24px 60px rgba(0, 0, 0, 0.55)",
        glow: "0 0 40px var(--accent-glow)"
      }
    }
  },
  plugins: []
};

export default config;
