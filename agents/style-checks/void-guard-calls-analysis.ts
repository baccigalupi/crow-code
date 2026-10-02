// Candidate collection and hover parsing for the void-guard-call check.
// A candidate is a guard-shaped `if` (no else, single-return consequent) whose
// return value is a function or method call. Candidates are then resolved via
// the language server; only callees returning void or Promise<void> violate.
//
// The default export is the lint plugin loaded by `deno lint --config
// void-guard-calls.deno.json`; `collectGuardCallCandidates` wraps the same
// plugin through `Deno.lint.runPlugin`, which only exists under `deno test`.

import { fromFileUrl, resolve } from '@std/path'

export type GuardCallCandidate = {
  line: number
  character: number
}

const candidatePattern = /^void-guard-candidate:(\d+):(\d+)$/

type LintNode = Deno.lint.Node

const singleReturn = (
  node: Deno.lint.Statement,
): Deno.lint.ReturnStatement | null => {
  if (node.type === 'ReturnStatement') return node
  if (
    node.type === 'BlockStatement' &&
    node.body.length === 1 &&
    node.body[0].type === 'ReturnStatement'
  ) return node.body[0]
  return null
}

const unwrapExpression = (node: LintNode): LintNode => {
  if (node.type === 'AwaitExpression') {
    return unwrapExpression(node.argument)
  }
  if (
    node.type === 'TSNonNullExpression' ||
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression'
  ) {
    return unwrapExpression(node.expression)
  }
  return node
}

const isElseIfBranch = (
  context: Deno.lint.RuleContext,
  node: Deno.lint.IfStatement,
): boolean => {
  const ancestors = context.sourceCode.getAncestors(node)
  const parent = ancestors[ancestors.length - 1]
  return parent !== undefined && parent.type === 'IfStatement' &&
    (parent as Deno.lint.IfStatement).alternate === node
}

const calleeTarget = (call: Deno.lint.CallExpression): LintNode => {
  const callee = call.callee
  if (callee.type === 'MemberExpression' && !callee.computed) {
    return callee.property
  }
  return callee
}

const positionOf = (source: string, offset: number): GuardCallCandidate => {
  const before = source.slice(0, offset)
  const line = before.split('\n').length - 1
  const character = offset - (before.lastIndexOf('\n') + 1)
  return { line, character }
}

const plugin: Deno.lint.Plugin = {
  name: 'void-guard-call-candidates',
  rules: {
    collect: {
      create(context) {
        return {
          IfStatement(node) {
            if (node.alternate !== null) return
            if (isElseIfBranch(context, node)) return
            const returned = singleReturn(node.consequent)
            if (returned === null || returned.argument === null) return
            const argument = unwrapExpression(returned.argument)
            if (argument.type !== 'CallExpression') return
            const target = calleeTarget(argument)
            const position = positionOf(
              context.sourceCode.text,
              target.range[0],
            )
            context.report({
              node: target,
              message:
                `void-guard-candidate:${position.line}:${position.character}`,
            })
          },
        }
      },
    },
  },
}

export default plugin

export const collectGuardCallCandidates = (
  fileName: string,
  source: string,
): GuardCallCandidate[] => {
  const diagnostics = Deno.lint.runPlugin(plugin, fileName, source)
  const candidates: GuardCallCandidate[] = []
  for (const diagnostic of diagnostics) {
    const match = candidatePattern.exec(diagnostic.message)
    if (match === null) continue
    candidates.push({ line: Number(match[1]), character: Number(match[2]) })
  }
  return candidates
}

type LintDiagnostic = { filename?: unknown; message?: unknown }

export const candidatesByFile = (
  lintJson: string,
): Map<string, GuardCallCandidate[]> => {
  const map = new Map<string, GuardCallCandidate[]>()
  let data: { diagnostics?: LintDiagnostic[] }
  try {
    data = JSON.parse(lintJson)
  } catch {
    return map
  }
  for (const diagnostic of data.diagnostics ?? []) {
    const match = candidatePattern.exec(String(diagnostic.message))
    if (match === null || typeof diagnostic.filename !== 'string') continue
    const candidate = { line: Number(match[1]), character: Number(match[2]) }
    const candidates = map.get(diagnostic.filename) ?? []
    candidates.push(candidate)
    map.set(diagnostic.filename, candidates)
  }
  return map
}

export const lintFilePath = (filename: string): string => {
  if (filename.startsWith('file://')) return fromFileUrl(filename)
  return resolve(Deno.cwd(), filename)
}

const signatureText = (hoverText: string): string => {
  const match = /```\w*\r?\n([\s\S]*?)```/.exec(hoverText)
  const body = match === null ? hoverText : match[1]
  return body.split('\n').join(' ')
}

const returnTypeTail = (signature: string): string => {
  let parens = 0
  let angles = 0
  for (let i = 0; i < signature.length; i++) {
    const character = signature[i]
    if (character === '=' && signature[i + 1] === '>') {
      if (parens === 0 && angles === 0) return signature.slice(i + 2).trim()
      i += 1
      continue
    }
    if (character === '<') angles += 1
    else if (character === '>') angles -= 1
    else if (character === '(') parens += 1
    else if (character === ')') parens -= 1
    else if (
      character === ':' && parens === 0 && angles === 0 &&
      signature[i - 1] === ')'
    ) {
      return signature.slice(i + 1).trim()
    }
  }
  return ''
}

export const returnTypeIsVoid = (hoverText: string): boolean => {
  const tail = returnTypeTail(signatureText(hoverText))
  return tail === 'void' || tail === 'Promise<void>'
}
