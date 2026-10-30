import type { ApplicationOperationArguments } from '../../types.ts'
import type {
  Definition,
  ParsedFile,
  SymbolSource,
} from './language-parsers/types.ts'
import { ReadOnlyFileOperation } from '../files/read-only/base-operation.ts'
import { FileDefinitions } from './outline/file-definitions.ts'
import { parseFile } from './parse-file.ts'
import { SymbolMatch } from './read-symbol/symbol-match.ts'
import { SymbolText } from './read-symbol/symbol-text.ts'

type TaskArguments = { path: string; name: string }

type ReadSymbolArguments = ApplicationOperationArguments<TaskArguments>

export class ReadSymbol extends ReadOnlyFileOperation<
  TaskArguments,
  SymbolSource
> {
  protected override logPrefix = 'Read code symbol: '
  private kind = ''
  private startLine = 0
  private endLine = 0
  private docComment = ''
  private source = ''

  result() {
    const { path, name } = this.operationArguments
    const { kind, startLine, endLine, docComment, source } = this
    return { path, name, kind, startLine, endLine, docComment, source }
  }

  protected override async perform() {
    const parsed = await this.runSubOperation(
      parseFile({
        applicationData: this.applicationData,
        operationArguments: { path: this.operationArguments.path },
      }),
    )
    if (this.succeeded) await this.read(parsed.result())
  }

  private async read(parsed: ParsedFile) {
    const definitions = new FileDefinitions(this.applicationData, parsed)
    const match = new SymbolMatch(await definitions.list())
    await this.select(
      match.matches(this.operationArguments.name),
      parsed.language,
    )
  }

  private async select(matches: Definition[], language: string) {
    if (matches.length === 0) {
      this.fail(`symbol not found: ${this.qualifiedName()}`)
    } else if (matches.length > 1) {
      this.fail(`ambiguous symbol: ${this.listing(matches)}`)
    } else {
      await this.record(matches[0], language)
    }
  }

  private listing(matches: Definition[]) {
    return matches
      .map(({ symbol }) => {
        return `${this.qualifiedName()} (lines ${symbol.startLine}-${symbol.endLine})`
      })
      .join(', ')
  }

  private qualifiedName() {
    const { path, name } = this.operationArguments
    return `${path}::${name}`
  }

  private async record(definition: Definition, language: string) {
    const text = new SymbolText(definition, language, await this.readText())
    this.kind = definition.symbol.kind
    this.startLine = definition.symbol.startLine
    this.endLine = definition.symbol.endLine
    this.docComment = text.docComment()
    this.source = text.source()
  }

  private readText() {
    const path = this.operationArguments.path
    return this.applicationData.filesystem.readTextFile(path)
  }
}

export const readSymbol = (args: ReadSymbolArguments) => {
  return new ReadSymbol(args)
}
