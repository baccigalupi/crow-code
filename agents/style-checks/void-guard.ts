import { relative } from 'node:path'
import ts from 'typescript'

const message =
  'guard clause return resolves to void/Promise<void>; call the function, then return'

const compilerOptions = () => {
  const { config } = ts.readConfigFile('tsconfig.json', ts.sys.readFile)
  return ts.parseJsonConfigFileContent(config, ts.sys, process.cwd()).options
}

const guardReturn = (node: ts.IfStatement) => {
  if (node.elseStatement) return undefined
  const { parent } = node
  if (ts.isIfStatement(parent) && parent.elseStatement === node)
    return undefined
  const consequent = node.thenStatement
  if (ts.isReturnStatement(consequent)) return consequent
  if (!ts.isBlock(consequent) || consequent.statements.length !== 1)
    return undefined
  const [only] = consequent.statements
  if (ts.isReturnStatement(only)) return only
  return undefined
}

type Wrapper =
  | ts.AwaitExpression
  | ts.ParenthesizedExpression
  | ts.NonNullExpression
  | ts.AsExpression
  | ts.SatisfiesExpression

const isWrapper = (node: ts.Expression): node is Wrapper =>
  ts.isAwaitExpression(node) ||
  ts.isParenthesizedExpression(node) ||
  ts.isNonNullExpression(node) ||
  ts.isAsExpression(node) ||
  ts.isSatisfiesExpression(node)

const unwrap = (node: ts.Expression): ts.Expression => {
  if (!isWrapper(node)) return node
  return unwrap(node.expression)
}

const guardCall = (node: ts.IfStatement) => {
  const returned = guardReturn(node)?.expression
  if (returned === undefined) return undefined
  const expression = unwrap(returned)
  if (ts.isCallExpression(expression)) return expression
  return undefined
}

const calleeName = (call: ts.CallExpression) => {
  const callee = call.expression
  if (ts.isPropertyAccessExpression(callee)) return callee.name
  return callee
}

const returnsVoid = (checker: ts.TypeChecker, call: ts.CallExpression) => {
  const signature = checker.getResolvedSignature(call)
  if (signature === undefined) return false
  const returned = checker.getReturnTypeOfSignature(signature)
  const type = checker.getAwaitedType(returned) ?? returned
  return (type.flags & ts.TypeFlags.Void) !== 0
}

const violations = (checker: ts.TypeChecker, sourceFile: ts.SourceFile) => {
  const lines: string[] = []
  const visit = (node: ts.Node) => {
    const call = ts.isIfStatement(node) ? guardCall(node) : undefined
    if (call && returnsVoid(checker, call)) {
      const position = calleeName(call).getStart(sourceFile)
      const { line, character } =
        sourceFile.getLineAndCharacterOfPosition(position)
      const file = relative(process.cwd(), sourceFile.fileName)
      lines.push(`${file}:${line + 1}:${character + 1}: ${message}`)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return lines
}

export const voidGuardViolations = (files: string[]) => {
  const program = ts.createProgram(files, compilerOptions())
  const checker = program.getTypeChecker()
  return files.flatMap((file) => {
    const sourceFile = program.getSourceFile(file)
    if (sourceFile === undefined) return []
    return violations(checker, sourceFile)
  })
}
