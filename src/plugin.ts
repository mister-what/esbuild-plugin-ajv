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
import { createBuildCache } from "./cache";

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

    const compileWithCache = createBuildCache(async (filePath, fileContent) => {
      ajv.removeSchema();
      const schema = JSON.parse(fileContent) as AnySchemaObject;
      schema.$id = `http://example.com/${path.relative(
        process.cwd(),
        filePath
      )}`;
      return standaloneCode(ajv, await ajv.compileAsync(schema));
    });

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
        return {
          contents: await compileWithCache(
            filePath,
            await fs.readFile(filePath, "utf8")
          ),
          loader: "js" as const,
          resolveDir: path.dirname(filePath),
        };
      }
    );
  },
});
