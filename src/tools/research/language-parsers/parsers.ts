import { fileURLToPath } from 'node:url'
import { Language, Parser } from 'web-tree-sitter'
import type { ApplicationData } from '../../../application-data/application-data.ts'
import { memoize } from '../../../decorators.ts'
import type { Grammar } from './types.ts'

export class Parsers {
  private applicationData: ApplicationData
  private parsers = new Map<string, Promise<Parser>>()

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  parserFor(grammar: Grammar) {
    if (!this.parsers.has(grammar.language)) {
      this.parsers.set(grammar.language, this.load(grammar))
    }

    return this.parsers.get(grammar.language)!
  }

  private async load(grammar: Grammar) {
    await this.initialized()
    const wasm = await this.wasm(`${grammar.packageName}/${grammar.file}`)
    return new Parser().setLanguage(await Language.load(wasm))
  }

  @memoize
  private async initialized() {
    const wasmBinary = await this.wasm('web-tree-sitter/web-tree-sitter.wasm')
    await Parser.init({ wasmBinary })
  }

  private wasm(specifier: string) {
    const path = fileURLToPath(import.meta.resolve(specifier))
    return this.applicationData.filesystem.readBytes(path)
  }
}
