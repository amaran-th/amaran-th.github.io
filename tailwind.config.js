/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors")
module.exports = {
  purge: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      title: ["MaplestoryOTFBold"],
      content: ["GowunBatang-Regular"],
      logo: ["PyeongChangPeace-Bold"],
    },
    extend: {
      colors: {
        main: "var(--color-main)",
        point: "var(--color-point)",
        sub: "var(--color-sub)",
        shadow: "var(--color-shadow)",
        rose: colors.rose,
      },
    },
  },
  darkMode: "class",
  plugins: [],
}
