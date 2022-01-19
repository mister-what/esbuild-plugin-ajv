import path from "path";
import { runInThisContext } from "vm";
import * as esbuild from "esbuild";
import getTransformKeywordDef from "ajv-keywords/dist/definitions/transform";
import type { Options } from "./plugin";
import { AjvPlugin } from "./plugin";

const wrapInCjs = (source: string) =>
  [
    "(function({module, exports = module.exports, require, __dirname, __filename}) {",
    source,
    "});",
  ].join("\n");

const runBuild = async (
  outputFormat: "esm" | "cjs",
  options: esbuild.BuildOptions = {
    entryPoints: {
      main: path.resolve(__dirname, "__fixtures__", "test-entrypoint.js"),
    },
    outdir: path.resolve(__dirname, "build"),
  },
  ajvOptions: Options = {}
) => {
  const result = await esbuild.build({
    /* 
   
     */
    target: "node16",
    bundle: true,
    plugins: [
      AjvPlugin({
        ajvOptions: { coerceTypes: true },
        ...ajvOptions,
      }),
    ],
    format: outputFormat,
    minify: false,
    ...options,
    write: false,
  });

  return Object.fromEntries(
    result.outputFiles.map((out) => [
      path.relative(path.resolve(__dirname, "build"), out.path),
      Buffer.from(out.contents).toString("utf8"),
    ])
  )["main.js"];
};

const runBuildWithInput = (code: string, ajvOptions?: Options) =>
  runBuild(
    "cjs",
    {
      stdin: {
        contents: code,
        loader: "js",
        sourcefile: "test-entrypoint.js",
        resolveDir: path.resolve(__dirname, "__fixtures__"),
      },
      outfile: path.resolve(__dirname, "build", "main.js"),
    },
    ajvOptions
  );

const evaluateCjs = <M>(code: string): M => {
  const moduleObj = { exports: {} as M };
  const filename = "/test/file.js";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  runInThisContext(wrapInCjs(code), { filename })({
    module: moduleObj,
    require: jest.fn(),
    __dirname: path.dirname(filename),
    __filename: filename,
  });
  return moduleObj.exports;
};

describe("AjvPlugin", () => {
  it("builds a a validation with external keywords", async () => {
    const { validate } = evaluateCjs<{ validate: (x: unknown) => unknown }>(
      await runBuildWithInput(
        // language=JavaScript
        `
          import validator from "./transformSchema.json?ajv";

          export const validate = (data) => {
            if (!validator(data)) return false;
            return data;
          };`,
        { extraKeywords: [getTransformKeywordDef()] }
      )
    );

    expect(
      validate({ text: "         padded text                  " })
    ).toEqual({ text: "padded text" });
    expect(validate({ text: 123 })).toEqual({ text: "123" });

    expect(validate({ text: "padded text", invalid: 123 })).toBe(false);
    expect(validate({ invalid: "text" })).toBe(false);
  });

  it("validates using the built schema", async () => {
    const { validate } = evaluateCjs<{ validate: (x: unknown) => unknown }>(
      await runBuild("cjs")
    );

    expect(() =>
      validate({ foo: "test", bar: 123, baz: [123, 456] })
    ).not.toThrow();

    expect(() =>
      validate({
        foo: "test",
        bar: 123,
        baz: [123, "abc", 789],
      })
    ).toThrow();
  });

  it("bundles built schemas", async () => {
    const source = await runBuild("esm");
    expect(source).toMatchCode({
      parser: "babel",
      trailingComma: "none",
      printWidth: 120,
    });
  });
});
