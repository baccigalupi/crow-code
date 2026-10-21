import type ts from 'typescript'

export type Diagnostic = {
  rule: string
  message: string
  line: number
  column: number
}

export type Context = {
  ancestors: ts.Node[]
  text: (node: ts.Node) => string
  lineOf: (position: number) => number
  report: (node: ts.Node, message: string) => void
  skipParentheses: (node: ts.Node) => ts.Node
}

export type Rule = {
  name: string
  applies: (fileName: string) => boolean
  enter?: (node: ts.Node, ctx: Context) => void
  exit?: (node: ts.Node, ctx: Context) => void
}

export type Plugin = {
  name: string
  rules: Rule[]
}
