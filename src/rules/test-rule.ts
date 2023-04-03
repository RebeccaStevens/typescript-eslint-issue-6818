import type { JSONSchema4 } from "json-schema";
import {
  type NamedCreateRuleMeta,
  RuleCreator,
  getParserServices,
} from "@typescript-eslint/utils/eslint-utils";
import {
  TypeOrValueSpecifier,
  typeMatchesSpecifier,
} from "@typescript-eslint/type-utils";
import {
  ReportDescriptor,
  RuleContext,
} from "@typescript-eslint/utils/ts-eslint";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

export const name = "test-rule" as const;

type Options = readonly [
  {
    specifier: TypeOrValueSpecifier | undefined;
  }
];

const schema: JSONSchema4 = [
  {
    type: "object",
    properties: {},
  },
];

const defaultOptions: Options = [
  {
    specifier: undefined,
  },
];

const errorMessages = {
  generic: "Error",
} as const;

const meta: NamedCreateRuleMeta<keyof typeof errorMessages> = {
  type: "problem",
  docs: {
    description: "",
  },
  messages: errorMessages,
  schema,
};

type RuleResult<
  MessageIds extends string,
  Options extends readonly unknown[]
> = {
  context: RuleContext<MessageIds, Options>;
  descriptors: Array<ReportDescriptor<MessageIds>>;
};

function isTSParameterProperty(
  node: TSESTree.Node
): node is TSESTree.TSParameterProperty {
  return node.type === AST_NODE_TYPES.TSParameterProperty;
}

function checkFunctionDeclaration(
  node: TSESTree.FunctionDeclaration,
  context: RuleContext<keyof typeof errorMessages, Options>,
  options: Options
): RuleResult<keyof typeof errorMessages, Options> {
  const [optionsObject] = options;
  const { specifier } = optionsObject;

  return {
    context,
    descriptors: node.params
      .map(
        (param): ReportDescriptor<keyof typeof errorMessages> | undefined => {
          const parameterProperty = isTSParameterProperty(param);
          const actualParam = parameterProperty ? param.parameter : param;

          const parserServices = getParserServices(context);
          const paramType = parserServices.getTypeAtLocation(actualParam);
          const matches =
            specifier === undefined
              ? true
              : typeMatchesSpecifier(
                  paramType,
                  specifier,
                  parserServices.program
                );

          if (matches) {
            return undefined;
          }

          return {
            node: actualParam,
            messageId: "generic",
          };
        }
      )
      .filter(<T>(v: T | undefined): v is T => v !== undefined),
  };
}

export const rule = RuleCreator((ruleName) => "")({
  name,
  meta,
  defaultOptions,
  create: (context, options) => {
    return {
      FunctionDeclaration: (node) =>
        checkFunctionDeclaration(node, context, options),
    };
  },
});
