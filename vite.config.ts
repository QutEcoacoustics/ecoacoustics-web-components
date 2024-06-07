import { defineConfig } from "vite";
import VitePluginCustomElementsManifest from "vite-plugin-cem";
import svgLoader from "vite-svg-loader";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// vite config for the dev server and documentation
export default defineConfig({
  plugins: [
    VitePluginCustomElementsManifest({
      files: ["./src/components/**/*.ts"],
      lit: true,
    }) as any,
    nodePolyfills(),
    svgLoader(),
    {
      name: "remove-esm-suffix",
      configureServer(server) {
        server.middlewares.use((req: any, res, next) => {
          if (req.url.endsWith("+esm")) {
            req.url = req.url.replace("+esm", "");
          }
          next();
        });
      },
    },
  ],
  // we have to enable a secure context and set the Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy
  // headers to use the SharedArrayBuffer
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
    },
  },
  build: {
    outDir: "./",
    copyPublicDir: false,
    lib: {
      name: "components",
      fileName: "components",
      entry: "src/components/index.ts",
      formats: ["es"],
    },
  },
});
