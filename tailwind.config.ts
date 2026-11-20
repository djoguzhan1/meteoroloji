import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"]
      },
      colors: {
        night: {
          950: "#030612",
          900: "#050816",
          800: "#0a1026",
          700: "#121a38"
        },
        neon: {
          white: "#f5f7ff",
          orange: "#ff8a3c",
          cyan: "#38bdf8",
          violet: "#a78bfa",
          emerald: "#34d399"
        }
      },
      boxShadow: {
        glass: "0 16px 48px rgba(0, 0, 0, 0.55)"
      },
      backdropBlur: {
        glass: "20px"
      }
    }
  },
  plugins: []
};

export default config;
