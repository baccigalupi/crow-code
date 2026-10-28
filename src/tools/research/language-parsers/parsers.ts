import { fileURLToPath } from 'node:url'
import { Language, Parser, Query } from 'web-tree-sitter'
import type { ApplicationData } from '../../../application-data/application-data.ts'
import { memoize } from '../../../decorators.ts'
import type { Grammar } from './types.ts'

export class Parsers {
  private applicationData: ApplicationData
  private parsers = new Map<string, Promise<Parser>>()
  private tagsQueries = new Map<string, Promise<Query>>()

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  parserFor(grammar: Grammar) {
    if (!this.parsers.has(grammar.language)) {
      this.parsers.set(grammar.language, this.load(grammar))
    }

    return this.parsers.get(grammar.language)!
  }

  tagsQueryFor(grammar: Grammar) {
    if (!this.tagsQueries.has(grammar.language)) {
      this.tagsQueries.set(grammar.language, this.loadTagsQuery(grammar))
    }

    return this.tagsQueries.get(grammar.language)!
  }

  private async load(grammar: Grammar) {
    await this.initialized()
    const wasm = await this.wasm(grammar.file)
    return new Parser().setLanguage(await Language.load(wasm))
  }

  private async loadTagsQuery(grammar: Grammar) {
    const parser = await this.parserFor(grammar)
    const sources = await Promise.all(
      grammar.tags.map((file) => this.queryText(file)),
    )
    return new Query(parser.language!, sources.join('\n'))
  }

  @memoize
  private async initialized() {
    const wasmBinary = await this.runtimeWasm()
    await Parser.init({ wasmBinary })
  }

  private runtimeWasm() {
    const runtime = import.meta.resolve('web-tree-sitter/web-tree-sitter.wasm')
    return this.applicationData.filesystem.readBytes(fileURLToPath(runtime))
  }

  private wasm(file: string) {
    return this.applicationData.filesystem.readBytes(this.appPath(file))
  }

  private queryText(file: string) {
    return this.applicationData.filesystem.readTextFile(this.appPath(file))
  }

  private appPath(file: string) {
    return fileURLToPath(new URL(file, import.meta.url))
  }
}
