import type { Plugin } from './engine/types.ts'
import { chainedConditionals } from './rules/chained-conditionals.ts'
import { constructorAssignOnly } from './rules/constructor-assign-only.ts'
import { guardClauseFirstLine } from './rules/guard-clause-first-line.ts'
import { maxFileLines } from './rules/max-file-lines.ts'
import { maxFunctionLines } from './rules/max-function-lines.ts'
import { noForLoops } from './rules/no-for-loops.ts'
import { noModuleFunctionDeclaration } from './rules/no-module-function-declaration.ts'
import { noNestedFunctionDeclarations } from './rules/no-nested-function-declarations.ts'
import { noNullishCoalescing } from './rules/no-nullish-coalescing.ts'
import { noOptionalChaining } from './rules/no-optional-chaining.ts'
import { noParameterProperties } from './rules/no-parameter-properties.ts'
import { noReExports } from './rules/no-re-exports.ts'
import { noReturnUndefined } from './rules/no-return-undefined.ts'
import { noScreamingCase } from './rules/no-screaming-case.ts'
import { noStatic } from './rules/no-static.ts'
import { noSuper } from './rules/no-super.ts'
import { noTernary } from './rules/no-ternary.ts'
import { noThrow } from './rules/no-throw.ts'
import { typesOnlyInTypesFiles } from './rules/types-only-in-types-files.ts'
import { whileOnlyInfinite } from './rules/while-only-infinite.ts'

export const codePlugin: Plugin = {
  name: 'crow-style-code',
  rules: [
    noModuleFunctionDeclaration,
    noParameterProperties,
    constructorAssignOnly,
    noStatic,
    noSuper,
    noTernary,
    noNullishCoalescing,
    noOptionalChaining,
    noReturnUndefined,
    noThrow,
    noForLoops,
    whileOnlyInfinite,
    noReExports,
    typesOnlyInTypesFiles,
    noScreamingCase,
    maxFunctionLines,
    noNestedFunctionDeclarations,
    chainedConditionals,
    guardClauseFirstLine,
    maxFileLines,
  ],
}
