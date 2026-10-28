import type { Tree } from 'web-tree-sitter'
import type { ApplicationOperationArguments } from '../../types.ts'
import type {
  FileOutline,
  Grammar,
  OutlineSymbol,
  ParsedFile,
} from './language-parsers/types.ts'
import { Languages } from './language-parsers/languages.ts'
import { ReadOnlyFileOperation } from '../files/read-only/base-operation.ts'
import { Definitions } from './outline/definitions.ts'
import { SymbolTree } from './outline/symbol-tree.ts'
import { parseFile } from './parse-file.ts'

type TaskArguments = { path: string }

type OutlineArguments = ApplicationOperationArguments<TaskArguments>

export class Outline extends ReadOnlyFileOperation<TaskArguments, FileOutline> {
  protected override logPrefix = 'Code outline: '
  private languages = new Languages()
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
    const languageParser = this.languages.languageParserFor(parsed.language)
    const captures = await this.captures(parsed, this.grammar(parsed.language))
    const definitions = new Definitions(captures, languageParser).list()
    this.language = parsed.language
    this.symbols = new SymbolTree(definitions).roots()
  }

  private async captures(parsed: ParsedFile, grammar: Grammar) {
    const tree = parsed.tree as Tree
    const query = await this.applicationData.parsers().tagsQueryFor(grammar)
    return query.captures(tree.rootNode)
  }

  private grammar(language: string) {
    return this.languages
      .grammars()
      .find((grammar) => grammar.language === language)!
  }
}

export const outline = (args: OutlineArguments) => {
  return new Outline(args)
}
