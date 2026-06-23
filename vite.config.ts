import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { global: "globalThis" },
  resolve: {
    alias: {
      // freighter-api ships a UMD bundle; re-export named ESM bindings for dev + build.
      "@stellar/freighter-api": path.resolve(
        __dirname,
        "src/shims/freighter-api.ts",
      ),
    },
  },
});
