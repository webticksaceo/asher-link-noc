import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
  plugins: [...tanstackStart(), react(), cloudflare()],
  resolve: {
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: resolve(__dirname, "src/$1"),
      },
    ],
  },
});
