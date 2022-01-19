import path from "path";
import fs from "fs/promises";
import { URL } from "url";
import type { Plugin } from "esbuild";
import type {
  CodeKeywordDefinition,
  Options as AjvOptions,
  AnySchemaObject,
} from "ajv";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone";
import { mergeDeepLeft } from "ramda";

export interface Options {
  extraKeywords?: CodeKeywordDefinition[];
  ajvOptions?: AjvOptions;
}

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
            esm: true,
            lines: true,
          },
          loadSchema: async (uri: string) =>
            JSON.parse(
              await fs.readFile(
                path.join(process.cwd(), new URL(uri).pathname),
                "utf8"
              )
            ) as AnySchemaObject,
        },
        ajvOptions
      )
    );

    for (const keywordDef of extraKeywords) {
      ajv.addKeyword(keywordDef);
    }

    build.onResolve(
      { filter: /\.json\?ajv$/i },
      async ({ path: rawPath, resolveDir }) => {
        return {
          path: (
            await build.resolve(rawPath.replace(/\?ajv$/i, ""), { resolveDir })
          ).path,
          namespace: "ajv-validator",
        };
      }
    );
    build.onLoad(
      { namespace: "ajv-validator", filter: /.*/ },
      async ({ path: filePath }) => {
        const schema = JSON.parse(
          await fs.readFile(filePath, "utf8")
        ) as AnySchemaObject;
        schema.$id = `http://example.com/${path.relative(
          process.cwd(),
          filePath
        )}`;
        return {
          contents: standaloneCode(ajv, await ajv.compileAsync(schema)),
          loader: "js" as const,
          resolveDir: path.dirname(filePath),
        };
      }
    );
  },
});
