import * as esbuild from "esbuild";
import path from "path";
import vm from "vm";
import { AjvPlugin } from "./plugin";
import { format } from "prettier";

describe("AjvPlugin", () => {
  it("bundles built schemas", async () => {
    const result = await esbuild.build({
      entryPoints: {
        main: path.resolve(__dirname, "__fixtures__", "test-entrypoint.js"),
      },

      target: "node16",
      bundle: true,
      plugins: [AjvPlugin({ ajvOptions: { coerceTypes: true } })],
      outdir: path.resolve(__dirname, "build"),
      write: false,
      format: "cjs",
      minify: false,
    });

    const source = Object.fromEntries(
      result.outputFiles.map((out) => [
        path.relative(path.resolve(__dirname, "build"), out.path),
        format(Buffer.from(out.contents).toString("utf8"), {
          parser: "babel",
        }),
      ])
    )["main.js"];

    const wrapper = vm.runInNewContext(
      [
        "((module, exports,require, __dirname, __filename ) => {",
        source
          .split("\n")
          .map((line) => "  " + line)
          .join("\n"),
        "})",
      ].join("\n")
    );

    const moduleObj = { exports: {} as any };

    wrapper(moduleObj, moduleObj.exports, jest.fn(), "/test", "/test/file.js");

    expect(() =>
      moduleObj.exports.default({ foo: "test", bar: 123, baz: [123, 456] })
    ).not.toThrow();

    expect(() =>
      moduleObj.exports.default({
        foo: "test",
        bar: 123,
        baz: [123, "abc", 789],
      })
    ).toThrow();

    expect(source).toMatchInlineSnapshot(`
      "var __create = Object.create;
      var __defProp = Object.defineProperty;
      var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames = Object.getOwnPropertyNames;
      var __getProtoOf = Object.getPrototypeOf;
      var __hasOwnProp = Object.prototype.hasOwnProperty;
      var __markAsModule = (target) =>
        __defProp(target, \\"__esModule\\", { value: true });
      var __commonJS = (cb, mod) =>
        function __require() {
          return (
            mod ||
              (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
            mod.exports
          );
        };
      var __export = (target, all) => {
        for (var name in all)
          __defProp(target, name, { get: all[name], enumerable: true });
      };
      var __reExport = (target, module2, copyDefault, desc) => {
        if (
          (module2 && typeof module2 === \\"object\\") ||
          typeof module2 === \\"function\\"
        ) {
          for (let key of __getOwnPropNames(module2))
            if (!__hasOwnProp.call(target, key) && (copyDefault || key !== \\"default\\"))
              __defProp(target, key, {
                get: () => module2[key],
                enumerable:
                  !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable,
              });
        }
        return target;
      };
      var __toESM = (module2, isNodeMode) => {
        return __reExport(
          __markAsModule(
            __defProp(
              module2 != null ? __create(__getProtoOf(module2)) : {},
              \\"default\\",
              !isNodeMode && module2 && module2.__esModule
                ? { get: () => module2.default, enumerable: true }
                : { value: module2, enumerable: true }
            )
          ),
          module2
        );
      };
      var __toCommonJS = /* @__PURE__ */ ((cache) => {
        return (module2, temp) => {
          return (
            (cache && cache.get(module2)) ||
            ((temp = __reExport(__markAsModule({}), module2, 1)),
            cache && cache.set(module2, temp),
            temp)
          );
        };
      })(typeof WeakMap !== \\"undefined\\" ? /* @__PURE__ */ new WeakMap() : 0);

      // ajv-validator:/Users/napalm/projects/esbuild-plugin-ajv/src/__fixtures__/testSchema.json
      var require_testSchema = __commonJS({
        \\"ajv-validator:/Users/napalm/projects/esbuild-plugin-ajv/src/__fixtures__/testSchema.json\\"(
          exports,
          module2
        ) {
          \\"use strict\\";
          module2.exports = validate10;
          module2.exports.default = validate10;
          function validate10(
            data,
            {
              instancePath = \\"\\",
              parentData,
              parentDataProperty,
              rootData = data,
            } = {}
          ) {
            let vErrors = null;
            let errors = 0;
            if (errors === 0) {
              if (data && typeof data == \\"object\\" && !Array.isArray(data)) {
                let missing0;
                if (
                  (data.foo === void 0 && (missing0 = \\"foo\\")) ||
                  (data.baz === void 0 && (missing0 = \\"baz\\"))
                ) {
                  validate10.errors = [
                    {
                      instancePath,
                      schemaPath: \\"#/required\\",
                      keyword: \\"required\\",
                      params: { missingProperty: missing0 },
                      message: \\"must have required property '\\" + missing0 + \\"'\\",
                    },
                  ];
                  return false;
                } else {
                  if (data.foo !== void 0) {
                    let data0 = data.foo;
                    const _errs1 = errors;
                    if (typeof data0 !== \\"string\\") {
                      let dataType0 = typeof data0;
                      let coerced0 = void 0;
                      if (!(coerced0 !== void 0)) {
                        if (dataType0 == \\"number\\" || dataType0 == \\"boolean\\") {
                          coerced0 = \\"\\" + data0;
                        } else if (data0 === null) {
                          coerced0 = \\"\\";
                        } else {
                          validate10.errors = [
                            {
                              instancePath: instancePath + \\"/foo\\",
                              schemaPath: \\"#/properties/foo/type\\",
                              keyword: \\"type\\",
                              params: { type: \\"string\\" },
                              message: \\"must be string\\",
                            },
                          ];
                          return false;
                        }
                      }
                      if (coerced0 !== void 0) {
                        data0 = coerced0;
                        if (data !== void 0) {
                          data[\\"foo\\"] = coerced0;
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
                        validate10.errors = [
                          {
                            instancePath: instancePath + \\"/bar\\",
                            schemaPath: \\"#/properties/bar/const\\",
                            keyword: \\"const\\",
                            params: { allowedValue: 123 },
                            message: \\"must be equal to constant\\",
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
                                  typeof data3 == \\"number\\" &&
                                  !(data3 % 1) &&
                                  !isNaN(data3) &&
                                  isFinite(data3)
                                )
                              ) {
                                let dataType1 = typeof data3;
                                let coerced1 = void 0;
                                if (!(coerced1 !== void 0)) {
                                  if (
                                    dataType1 === \\"boolean\\" ||
                                    data3 === null ||
                                    (dataType1 === \\"string\\" &&
                                      data3 &&
                                      data3 == +data3 &&
                                      !(data3 % 1))
                                  ) {
                                    coerced1 = +data3;
                                  } else {
                                    validate10.errors = [
                                      {
                                        instancePath: instancePath + \\"/baz/\\" + i0,
                                        schemaPath: \\"#/properties/baz/items/type\\",
                                        keyword: \\"type\\",
                                        params: { type: \\"integer\\" },
                                        message: \\"must be integer\\",
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
                            validate10.errors = [
                              {
                                instancePath: instancePath + \\"/baz\\",
                                schemaPath: \\"#/properties/baz/type\\",
                                keyword: \\"type\\",
                                params: { type: \\"array\\" },
                                message: \\"must be array\\",
                              },
                            ];
                            return false;
                          }
                        }
                        var valid0 = _errs4 === errors;
                      } else {
                        var valid0 = true;
                      }
                    }
                  }
                }
              } else {
                validate10.errors = [
                  {
                    instancePath,
                    schemaPath: \\"#/type\\",
                    keyword: \\"type\\",
                    params: { type: \\"object\\" },
                    message: \\"must be object\\",
                  },
                ];
                return false;
              }
            }
            validate10.errors = vErrors;
            return errors === 0;
          }
        },
      });

      // src/__fixtures__/test-entrypoint.js
      var test_entrypoint_exports = {};
      __export(test_entrypoint_exports, {
        default: () => test_entrypoint_default,
      });
      var import_testSchema = __toESM(require_testSchema());
      var checkValid = (value) => {
        if (!(0, import_testSchema.default)(value))
          throw import_testSchema.default.errors;
        return value;
      };
      var test_entrypoint_default = checkValid;
      module.exports = __toCommonJS(test_entrypoint_exports);
      "
    `);
  });
});
