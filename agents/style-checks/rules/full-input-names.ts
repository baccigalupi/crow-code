import ts from 'typescript'
import { isInstallFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const fullNames: Record<string, string> = {
  repo: 'repoDirectory',
  user: 'globalDirectory',
  env: 'envFile',
}

export const fullInputNames: Rule = {
  name: 'full-input-names',
  applies: isInstallFile,
  enter(node, ctx) {
    if (!ts.isIdentifier(node)) return
    if (!Object.hasOwn(fullNames, node.text)) return
    ctx.report(
      node,
      `install inputs are named ${fullNames[node.text]}, not ${node.text}`,
    )
  },
}
