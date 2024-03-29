/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
