import { toMatchInlineSnapshot } from "jest-snapshot";

type CodeRef = { toString(): string };
const codeRefs = new WeakSet<CodeRef>();
const isCodeRef = (x: unknown): x is CodeRef =>
  x != null && typeof x === "object" && x.toString != null && codeRefs.has(x);

const createCode = (codeString: string) => {
  const code = Object.create(null, {
    toString: {
      value: () => codeString,
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

expect.extend({
  toMatchCode(received: string) {
    return toMatchInlineSnapshot.call(this as any, createCode(received));
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchCode(code?: string): R;
    }
  }
}
