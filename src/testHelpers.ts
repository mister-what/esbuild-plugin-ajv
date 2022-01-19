import { toMatchSnapshot } from "jest-snapshot";
import { format, Options } from "prettier";
import { complement as not } from "ramda";

type CodeRef = { toString(): string };
const codeRefs = new WeakSet<CodeRef>();
const isCodeRef = (x: unknown): x is CodeRef =>
  x != null && typeof x === "object" && x.toString != null && codeRefs.has(x);
const isString = (x: unknown): x is string =>
  x != null && typeof x === "string";

const createCode = (
  codeString: string,
  options: Options = { parser: "babel" }
) => {
  const code = Object.create(null, {
    toString: {
      value: () => format(codeString, options),
      enumerable: false,
      configurable: false,
      writable: false,
    },
  }) as CodeRef;
  codeRefs.add(code);
  return code;
};

expect.addSnapshotSerializer({
  test(val: unknown) {
    return isCodeRef(val);
  },
  serialize(val: CodeRef) {
    return val.toString();
  },
});
const matchers: jest.ExpectExtendMap = {
  toMatchCode(received: string, options?: Options, testName?: string) {
    return toMatchSnapshot.call(
      this as never,
      createCode(received, options),
      testName ?? ""
    );
  },
};
expect.extend(matchers);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchCode(options: Options, testName?: string): R;
      toMatchCode(options?: Options): R;
    }
  }
}
