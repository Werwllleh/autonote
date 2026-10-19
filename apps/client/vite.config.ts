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
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) {
            return "recharts"
          }
          if (id.includes("node_modules/framer-motion")) {
            return "framer-motion"
          }
          if (
            id.includes("node_modules/@radix-ui/react-dialog") ||
            id.includes("node_modules/@radix-ui/react-dropdown-menu") ||
            id.includes("node_modules/@radix-ui/react-select") ||
            id.includes("node_modules/@radix-ui/react-tabs")
          ) {
            return "radix-ui"
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/@radix-ui/react-slot") ||
            id.includes("node_modules/@radix-ui/react-compose-refs")
          ) {
            return "vendor"
          }
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
