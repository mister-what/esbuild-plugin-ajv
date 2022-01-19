[![npm](https://img.shields.io/npm/v/esbuild-plugin-ajv.svg)](https://www.npmjs.com/package/esbuild-plugin-ajv)

# esbuild-plugin-ajv

## Installation

With npm:

```sh
npm i -D esbuild-plugin-ajv ajv
```

Or yarn:

```sh
yarn add -D esbuild-plugin-ajv ajv
```

## Use-cases

**The motivation to pre-compile schemas<sup>[1](#ref-1)</sup>:**

- avoids dynamic code evaluation with Function constructor (used for schema
  compilation) - _useful in browser environments where `'unsafe-eval'` is not
  allowed by CSP (Content Security Policy)_
- faster startup times
- lower memory footprint/bundle size
- compatible with strict content security policies
- almost no risk to compile schema more than once
- better for short-lived environments

## Usage

### Build config

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

### Precompile imported schema

```js
import validator from "./someJsonSchema.json?ajv";

/**
 * @description use compiled schema in your code
 */
const validate = (x) => {
  if (!validator(x)) throw validator.errors;
  return x;
};
```

## References

- <b name="ref-1">[1]</b>: _Standalone Validation Code_ in _Ajv documentation_
  https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
