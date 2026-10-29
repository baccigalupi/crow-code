import type { ApplicationOperationArguments } from '../../types.ts'
import type {
  FileOutline,
  OutlineSymbol,
  ParsedFile,
} from './language-parsers/types.ts'
import { ReadOnlyFileOperation } from '../files/read-only/base-operation.ts'
import { FileDefinitions } from './outline/file-definitions.ts'
import { SymbolTree } from './outline/symbol-tree.ts'
import { parseFile } from './parse-file.ts'

type TaskArguments = { path: string }

type OutlineArguments = ApplicationOperationArguments<TaskArguments>

export class Outline extends ReadOnlyFileOperation<TaskArguments, FileOutline> {
  protected override logPrefix = 'Code outline: '
  private language = ''
  private symbols: OutlineSymbol[] = []

  result() {
    const path = this.operationArguments.path
    return { path, language: this.language, symbols: this.symbols }
  }

  protected override async perform() {
    const parsed = await this.runSubOperation(
      parseFile({
        applicationData: this.applicationData,
        operationArguments: this.operationArguments,
      }),
    )
    if (this.succeeded) await this.outline(parsed.result())
  }

  private async outline(parsed: ParsedFile) {
    const definitions = new FileDefinitions(this.applicationData, parsed)
    this.language = parsed.language
    this.symbols = new SymbolTree(await definitions.list()).roots()
  }
}

export const outline = (args: OutlineArguments) => {
  return new Outline(args)
}
