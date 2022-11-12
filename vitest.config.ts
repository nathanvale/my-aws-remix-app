/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    coverage: {
      exclude: ["app/models/note/**"],
      provider: "c8",
      reporter: ["text", "json", "html"],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});
