import type { Plugin } from './engine/types.ts'
import { arrowFunctionComponents } from './rules/arrow-function-components.ts'
import { noInlinePropsType } from './rules/no-inline-props-type.ts'
import { noInlineUseInput } from './rules/no-inline-use-input.ts'
import { noJsxLogicalAnd } from './rules/no-jsx-logical-and.ts'
import { noReactState } from './rules/no-react-state.ts'
import { viewsOnlyCallViewModels } from './rules/views-only-call-view-models.ts'

export const tsxPlugin: Plugin = {
  name: 'crow-style-tsx',
  rules: [
    arrowFunctionComponents,
    noReactState,
    noInlineUseInput,
    viewsOnlyCallViewModels,
    noInlinePropsType,
    noJsxLogicalAnd,
  ],
}
