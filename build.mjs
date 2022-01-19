import { build } from "esbuild";

const run = async () =>
  build({
    bundle: true,
    format: "cjs",
    outdir: "./dist",
    entryPoints: { index: "./src/index.cjs" },
    platform: "node",
    mainFields: ["module", "main"],
    target: ["node12"],
    external: ["ajv", "ajv/dist/standalone"],
  });

run().catch((error) => {
  console.error(error);
});
