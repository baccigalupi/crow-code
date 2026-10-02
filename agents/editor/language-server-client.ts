// A client for the Deno language server, the same server the VS Code Deno
// extension drives, so callers see the diagnostics an editor would show.

import { toFileUrl } from '@std/path'
import { JsonRpcStream } from './json-rpc-stream.ts'

export type Diagnostic = {
  source?: string
  code?: string | number
  message: string
  severity?: number
  tags?: number[]
  range: { start: { line: number; character: number } }
}

type IncomingMessage = {
  id?: unknown
  method?: unknown
  params?: unknown
  result?: unknown
}
type PublishDiagnostics = { uri: string; diagnostics: Diagnostic[] }

const languageId = 'typescript'
const initializeId = 1

type PendingRequest = (result: unknown) => void

export class LanguageServer {
  private stream: JsonRpcStream
  private received = new Map<string, Diagnostic[]>()
  private pending = new Map<number, PendingRequest>()
  private nextRequestId = 100
  ready = false

  constructor(child: Deno.ChildProcess) {
    this.stream = new JsonRpcStream(
      child,
      (message) => this.consume(message as IncomingMessage),
    )
  }

  async start() {
    const rootUri = toFileUrl(Deno.cwd()).href
    await this.stream.send({
      id: initializeId,
      method: 'initialize',
      params: {
        processId: Deno.pid,
        rootUri,
        workspaceFolders: [{ uri: rootUri, name: 'crow-code' }],
        capabilities: { workspace: { configuration: false } },
      },
    })
  }

  async announceInitialized() {
    await this.stream.send({ method: 'initialized', params: {} })
  }

  async request(method: string, params: Record<string, unknown>) {
    const id = this.nextRequestId++
    const result = new Promise<unknown>((resolve) => {
      this.pending.set(id, resolve)
    })
    await this.stream.send({ id, method, params })
    return result
  }

  async hover(file: string, line: number, character: number) {
    return await this.request('textDocument/hover', {
      textDocument: { uri: toFileUrl(file).href },
      position: { line, character },
    })
  }

  async openDocument(file: string) {
    await this.stream.send({
      method: 'textDocument/didOpen',
      params: {
        textDocument: {
          uri: toFileUrl(file).href,
          languageId,
          version: 1,
          text: await Deno.readTextFile(file),
        },
      },
    })
  }

  async listen() {
    await this.stream.listen()
  }

  private consume(message: IncomingMessage) {
    const id = message.id
    if (typeof id === 'number' && this.pending.has(id)) {
      const resolve = this.pending.get(id) as PendingRequest
      this.pending.delete(id)
      resolve(message.result)
      return
    }
    if (message.id === initializeId) {
      this.ready = true
    }
    if (message.method !== 'textDocument/publishDiagnostics') {
      return
    }
    const params = message.params as PublishDiagnostics
    this.received.set(params.uri, params.diagnostics)
  }

  diagnosticsFor(file: string) {
    const found = this.received.get(toFileUrl(file).href)
    if (found === undefined) {
      return []
    }
    return found
  }

  get receivedCount() {
    return this.received.size
  }

  stop() {
    this.stream.stop()
  }
}
