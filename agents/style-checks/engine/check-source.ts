import ts from 'typescript'
import type { Diagnostic, Plugin } from './types.ts'
import { walk } from './walk.ts'

export const checkSource = (
  plugin: Plugin,
  fileName: string,
  source: string,
): Diagnostic[] => {
  const scriptKind = fileName.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  )
  const rules = plugin.rules.filter((rule) => rule.applies(fileName))
  return walk(sourceFile, plugin.name, rules)
}
