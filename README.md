## esbuild-plugin-ajv

### Usage

```ts
import esbuild from "esbuild";
import AjvPlugin from "esbuild-plugin-ajv";

esbuild.build({
  /* ... */
  plugins: [
    AjvPlugin({
      extraKeywords: [
        /* Ajv.CodeKeywordDefinition */
      ],
      ajvOptions: {
        coerceTypes: true,
      },
    }),
  ],
  /* ... */
});
```
