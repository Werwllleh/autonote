import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          "framer-motion": ["framer-motion"],
          vendor: ["react", "react-dom", "react-router-dom"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-separator", "@radix-ui/react-avatar", "@radix-ui/react-label", "@radix-ui/react-slot"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
