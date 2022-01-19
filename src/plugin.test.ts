import path from "path";
import { runInThisContext } from "vm";
import * as esbuild from "esbuild";
import { format } from "prettier";
import { AjvPlugin } from "./plugin";

const wrapInCjs = (source: string) =>
  [
    "(function({module, exports = module.exports, require, __dirname, __filename}) {",
    source,
    "});",
  ].join("\n");

const runBuild = async (moduleFormat: "esm" | "cjs") => {
  const result = await esbuild.build({
    entryPoints: {
      main: path.resolve(__dirname, "__fixtures__", "test-entrypoint.js"),
    },
    target: "node16",
    bundle: true,
    plugins: [AjvPlugin({ ajvOptions: { coerceTypes: true } })],
    outdir: path.resolve(__dirname, "build"),
    write: false,
    format: moduleFormat,
    minify: false,
  });

  return format(
    Object.fromEntries(
      result.outputFiles.map((out) => [
        path.relative(path.resolve(__dirname, "build"), out.path),
        Buffer.from(out.contents).toString("utf8"),
      ])
    )["main.js"],
    {
      parser: "babel",
    }
  );
};

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
    // language=JavaScript
    expect(source).toMatchCode(`
      // ajv-validator:/Users/napalm/projects/esbuild-plugin-ajv/src/__fixtures__/testSchema.json
      var testSchema_default = validate11;
      function validate11(
        data,
        { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
      ) {
        let vErrors = null;
        let errors = 0;
        if (errors === 0) {
          if (data && typeof data == "object" && !Array.isArray(data)) {
            let missing0;
            if (
              (data.foo === void 0 && (missing0 = "foo")) ||
              (data.baz === void 0 && (missing0 = "baz"))
            ) {
              validate11.errors = [
                {
                  instancePath,
                  schemaPath: "#/required",
                  keyword: "required",
                  params: { missingProperty: missing0 },
                  message: "must have required property '" + missing0 + "'",
                },
              ];
              return false;
            } else {
              if (data.foo !== void 0) {
                let data0 = data.foo;
                const _errs1 = errors;
                if (typeof data0 !== "string") {
                  let dataType0 = typeof data0;
                  let coerced0 = void 0;
                  if (!(coerced0 !== void 0)) {
                    if (dataType0 == "number" || dataType0 == "boolean") {
                      coerced0 = "" + data0;
                    } else if (data0 === null) {
                      coerced0 = "";
                    } else {
                      validate11.errors = [
                        {
                          instancePath: instancePath + "/foo",
                          schemaPath: "#/properties/foo/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        },
                      ];
                      return false;
                    }
                  }
                  if (coerced0 !== void 0) {
                    data0 = coerced0;
                    if (data !== void 0) {
                      data["foo"] = coerced0;
                    }
                  }
                }
                var valid0 = _errs1 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.bar !== void 0) {
                  const _errs3 = errors;
                  if (data.bar !== 123) {
                    validate11.errors = [
                      {
                        instancePath: instancePath + "/bar",
                        schemaPath: "#/properties/bar/const",
                        keyword: "const",
                        params: { allowedValue: 123 },
                        message: "must be equal to constant",
                      },
                    ];
                    return false;
                  }
                  var valid0 = _errs3 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.baz !== void 0) {
                    let data2 = data.baz;
                    const _errs4 = errors;
                    if (errors === _errs4) {
                      if (Array.isArray(data2)) {
                        var valid1 = true;
                        const len0 = data2.length;
                        for (let i0 = 0; i0 < len0; i0++) {
                          let data3 = data2[i0];
                          const _errs6 = errors;
                          if (
                            !(
                              typeof data3 == "number" &&
                              !(data3 % 1) &&
                              !isNaN(data3) &&
                              isFinite(data3)
                            )
                          ) {
                            let dataType1 = typeof data3;
                            let coerced1 = void 0;
                            if (!(coerced1 !== void 0)) {
                              if (
                                dataType1 === "boolean" ||
                                data3 === null ||
                                (dataType1 === "string" &&
                                  data3 &&
                                  data3 == +data3 &&
                                  !(data3 % 1))
                              ) {
                                coerced1 = +data3;
                              } else {
                                validate11.errors = [
                                  {
                                    instancePath: instancePath + "/baz/" + i0,
                                    schemaPath: "#/properties/baz/items/type",
                                    keyword: "type",
                                    params: { type: "integer" },
                                    message: "must be integer",
                                  },
                                ];
                                return false;
                              }
                            }
                            if (coerced1 !== void 0) {
                              data3 = coerced1;
                              if (data2 !== void 0) {
                                data2[i0] = coerced1;
                              }
                            }
                          }
                          var valid1 = _errs6 === errors;
                          if (!valid1) {
                            break;
                          }
                        }
                      } else {
                        validate11.errors = [
                          {
                            instancePath: instancePath + "/baz",
                            schemaPath: "#/properties/baz/type",
                            keyword: "type",
                            params: { type: "array" },
                            message: "must be array",
                          },
                        ];
                        return false;
                      }
                    }
                    var valid0 = _errs4 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.external !== void 0) {
                      let data4 = data.external;
                      const _errs8 = errors;
                      if (typeof data4 !== "string") {
                        let dataType2 = typeof data4;
                        let coerced2 = void 0;
                        if (!(coerced2 !== void 0)) {
                          if (dataType2 == "number" || dataType2 == "boolean") {
                            coerced2 = "" + data4;
                          } else if (data4 === null) {
                            coerced2 = "";
                          } else {
                            validate11.errors = [
                              {
                                instancePath: instancePath + "/external",
                                schemaPath:
                                  "./externalSchema.json#/definitions/name/type",
                                keyword: "type",
                                params: { type: "string" },
                                message: "must be string",
                              },
                            ];
                            return false;
                          }
                        }
                        if (coerced2 !== void 0) {
                          data4 = coerced2;
                          if (data !== void 0) {
                            data["external"] = coerced2;
                          }
                        }
                      }
                      var valid0 = _errs8 === errors;
                    } else {
                      var valid0 = true;
                    }
                  }
                }
              }
            }
          } else {
            validate11.errors = [
              {
                instancePath,
                schemaPath: "#/type",
                keyword: "type",
                params: { type: "object" },
                message: "must be object",
              },
            ];
            return false;
          }
        }
        validate11.errors = vErrors;
        return errors === 0;
      }

      // src/__fixtures__/test-entrypoint.js
      var validate = (value) => {
        if (!testSchema_default(value)) throw testSchema_default.errors;
        return value;
      };
      export { validate };

    `);
  });
});
