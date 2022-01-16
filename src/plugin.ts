import path from "path";
import fs from "fs/promises";
import type { Plugin } from "esbuild";
import type { CodeKeywordDefinition, Options as AjvOptions } from "ajv";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone";
import { __, curryN, mergeDeepLeft } from "ramda";
import { format } from "prettier";

export interface Options {
  extraKeywords?: CodeKeywordDefinition[];
  ajvOptions?: AjvOptions;
}

const formatJs = curryN(2, format)(__, { parser: "babel" });

export const AjvPlugin = ({
  extraKeywords = [],
  ajvOptions = {},
}: Options = {}): Plugin => ({
  name: "ajv-plugin",
  setup(build) {
    const ajv = new Ajv(
      mergeDeepLeft(
        {
          code: {
            source: true,
            optimize: 1,
          },
        },
        ajvOptions
      )
    );
    for (const keywordDef of extraKeywords) {
      ajv.addKeyword(keywordDef);
    }

    build.onResolve(
      { filter: /^ajv:.+\.json$/i },
      async ({ path: rawPath, resolveDir }) => {
        return {
          path: (
            await build.resolve(rawPath.replace(/^ajv:/i, ""), { resolveDir })
          ).path,
          namespace: "ajv-validator",
        };
      }
    );
    build.onLoad(
      { namespace: "ajv-validator", filter: /.*/ },
      async ({ path: filePath }) => {
        const schema = JSON.parse(await fs.readFile(filePath, "utf8"));
        return {
          contents: formatJs(standaloneCode(ajv, ajv.compile(schema))),
          loader: "js" as const,
          resolveDir: path.dirname(filePath),
        };
      }
    );
  },
});
