import { name, rule } from "../../src/rules/test-rule";
import { RuleTester } from "@typescript-eslint/utils/eslint-utils";

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.test.json",
  },
});

ruleTester.run(name, rule, {
  valid: [
    {
      code: "type RegExp = { foo: string }; function foo(arg: RegExp) { return arg.foo; }",
      options: [
        {
          specifier: { from: "file", name: "RegExp" },
        },
      ],
      filename: "file.ts",
    },
  ],
  invalid: [
    {
      code: "function foo(arg: RegExp) { }",
      options: [
        {
          specifier: { from: "file", name: "RegExp" },
        },
      ],
      errors: [
        {
          messageId: "generic",
        },
      ],
      filename: "file.ts",
    },
  ],
});
