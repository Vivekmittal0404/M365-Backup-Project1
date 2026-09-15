/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12161C",
          soft: "#1B212B",
          line: "#2C3542",
        },
        paper: {
          DEFAULT: "#F3F1EC",
          dim: "#E9E5DC",
        },
        vault: {
          teal: "#1B6B73",
          tealDeep: "#134F56",
          amber: "#B8863B",
          rust: "#9C4A3C",
          ok: "#3E6B4F",
        },
      },
      fontFamily: {
        serif: ["'Newsreader'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
