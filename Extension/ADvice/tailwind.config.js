/** @type {import('tailwindcss').Config} */
export default {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  content: ["./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      grayscale: {
        50: "50%",
        30: "30%",
        10: "10%",
      },
      colors: {
        "theme-blue": "#4379EE",
        "theme-green" : "#03C75A"
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
