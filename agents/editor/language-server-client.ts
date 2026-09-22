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

type IncomingMessage = { id?: unknown; method?: unknown; params?: unknown }
type PublishDiagnostics = { uri: string; diagnostics: Diagnostic[] }

const languageId = 'typescript'
const initializeId = 1

export class LanguageServer {
  private stream: JsonRpcStream
  private received = new Map<string, Diagnostic[]>()
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
