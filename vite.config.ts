import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
// @ts-ignore

export default defineConfig(({ mode }) => {
  const baseConfig = {
    plugins: [
      vue(),
      wasm()
    ],
    base: mode === "production" ? "/cpp-repl/" : "/",
    worker: {
      format: "es", // 使用 ES 模块格式
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    }
  };

  return baseConfig;
});
