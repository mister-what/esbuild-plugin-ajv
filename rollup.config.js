import dts from "rollup-plugin-dts";

export default {
  input: "./dist/index.d.ts",
  output: [
    {
      file: "./types/index.d.ts",
      format: "es",
    },
  ],
  plugins: [dts()],
};
