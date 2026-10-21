import type { Plugin } from './engine/types.ts'
import { arrangeActAssert } from './rules/arrange-act-assert.ts'
import { declarationsInsideIt } from './rules/declarations-inside-it.ts'
import { nestedDescribeMinimum } from './rules/nested-describe-minimum.ts'
import { noLogicInTests } from './rules/no-logic-in-tests.ts'
import { noTemporaryDirectories } from './rules/no-temporary-directories.ts'
import { oneTopLevelDescribe } from './rules/one-top-level-describe.ts'

export const unitTestsPlugin: Plugin = {
  name: 'crow-style-test',
  rules: [
    oneTopLevelDescribe,
    declarationsInsideIt,
    arrangeActAssert,
    nestedDescribeMinimum,
    noTemporaryDirectories,
    noLogicInTests,
  ],
}
