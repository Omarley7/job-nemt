/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{svelte,html}"],
  darkMode: "media",
  prefix: "jn-",
  theme: {
    extend: {
      backgroundImage: {
        "jobnet-green": "linear-gradient(#bfd345 25%,#8c9b33)",
        "jobnet-light-green": "linear-gradient(#e7ff4c 25%,#a2b335)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")]
}
