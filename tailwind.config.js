/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "inma": "#2eb8b8"
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-blue-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-orange-200",
    "bg-red-200",
    "bg-pink-200",
    "bg-gray-200",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-orange-400",
    "bg-red-400",
    "bg-pink-400",
    "bg-gray-400",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-gray-500",
    "bg-inma"
  ]
}

