// Ambient types for the files still running under Deno (hooks, style-check
// plugins and their tests). Covers only the members they use.
// Delete this file when the last Deno consumer is ported to Bun.

declare module '@std/expect' {
  export const expect: typeof import('bun:test').expect
}

declare module '@std/fs' {
  export const exists: (path: string) => Promise<boolean>
  export const walk: (
    root: string,
    options?: Record<string, unknown>,
  ) => AsyncIterable<{ path: string; name: string; isFile: boolean }>
}

declare namespace Deno {
  const args: string[]
  const cwd: () => string
  const exit: (code?: number) => never

  const env: { get: (key: string) => string | undefined }

  const stdin: { readable: ReadableStream<Uint8Array> }
  const stdout: {
    write: (data: Uint8Array) => Promise<number>
    writeSync: (data: Uint8Array) => number
  }
  const stderr: { write: (data: Uint8Array) => Promise<number> }

  type FileInfo = {
    isFile: boolean
    isDirectory: boolean
    size: number
  }
  type DirEntry = { name: string; isFile: boolean; isDirectory: boolean }

  const readTextFile: (path: string | URL) => Promise<string>
  const readTextFileSync: (path: string | URL) => string
  const writeTextFile: (path: string | URL, data: string) => Promise<void>
  const readDir: (path: string | URL) => AsyncIterable<DirEntry>
  const stat: (path: string | URL) => Promise<FileInfo>
  const mkdir: (
    path: string | URL,
    options?: { recursive?: boolean },
  ) => Promise<void>
  const remove: (
    path: string | URL,
    options?: { recursive?: boolean },
  ) => Promise<void>
  const makeTempDir: (options?: { prefix?: string }) => Promise<string>
  const makeTempDirSync: (options?: { prefix?: string }) => string

  type StdioOption = 'piped' | 'inherit' | 'null'
  type CommandOptions = {
    args?: string[]
    cwd?: string | URL
    env?: Record<string, string>
    stdin?: StdioOption
    stdout?: StdioOption
    stderr?: StdioOption
  }
  type CommandStatus = { success: boolean; code: number }
  type CommandOutput = CommandStatus & {
    stdout: Uint8Array
    stderr: Uint8Array
  }
  interface ChildProcess {
    readonly pid: number
    readonly stdin: WritableStream<Uint8Array>
    readonly stdout: ReadableStream<Uint8Array>
    readonly stderr: ReadableStream<Uint8Array>
    readonly status: Promise<CommandStatus>
    output: () => Promise<CommandOutput>
    kill: (signal?: string) => void
  }
  class Command {
    constructor(command: string | URL, options?: CommandOptions)
    output(): Promise<CommandOutput>
    spawn(): ChildProcess
  }

  namespace lint {
    type Node = {
      type: string
      range: [number, number]
      // oxlint-disable-next-line typescript/no-explicit-any
      [key: string]: any
    }
    type Statement = Node
    type IfStatement = Node
    type ReturnStatement = Node
    type BlockStatement = Node
    type Program = Node
    type Parameter = Node
    type CallExpression = Node
    type Fix = Record<string, unknown>
    type Diagnostic = { id: string; message: string; hint?: string }
    interface RuleContext {
      id: string
      filename: string
      sourceCode: {
        text: string
        ast: Program
        getAncestors: (node: Node) => Node[]
        getText: (node?: Node) => string
      }
      report: (data: {
        node?: Node
        range?: [number, number]
        message: string
        hint?: string
        fix?: (fixer: Record<string, unknown>) => Fix | Fix[]
      }) => void
    }
    type Visitor = Record<string, ((node: Node) => void) | undefined>
    interface Rule {
      create: (context: RuleContext) => Visitor
    }
    interface Plugin {
      name: string
      rules: Record<string, Rule>
    }
    const runPlugin: (
      plugin: Plugin,
      fileName: string,
      source: string,
    ) => Diagnostic[]
  }
}
