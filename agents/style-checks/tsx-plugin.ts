import type { Plugin } from './engine/types.ts'
import { arrowFunctionComponents } from './rules/arrow-function-components.ts'
import { noFunctionsInComponents } from './rules/no-functions-in-components.ts'
import { noIfElseInTsx } from './rules/no-if-else-in-tsx.ts'
import { noInlinePropsType } from './rules/no-inline-props-type.ts'
import { noJsxLogicalAnd } from './rules/no-jsx-logical-and.ts'
import { noReactState } from './rules/no-react-state.ts'

export const tsxPlugin: Plugin = {
  name: 'crow-style-tsx',
  rules: [
    arrowFunctionComponents,
    noReactState,
    noInlinePropsType,
    noJsxLogicalAnd,
    noIfElseInTsx,
    noFunctionsInComponents,
  ],
}
