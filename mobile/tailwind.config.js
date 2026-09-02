/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#197fe6", // Stitch Blue
                secondary: "#3b82f6",
                accent: "#f59e0b",
                background: "#f6f7f8", // Stitch Light Gray
                foreground: "#0f172a",
                card: "#ffffff",
                muted: "#f1f5f9",
                "muted-foreground": "#64748b",
                border: "#e2e8f0",
                input: "#f1f5f9",
                ring: "#197fe6",
                destructive: "#ef4444",
                "destructive-foreground": "#ffffff",
            },
        },
    },
    plugins: [],
}
