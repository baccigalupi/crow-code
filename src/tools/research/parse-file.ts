import type { Tree } from 'web-tree-sitter'
import type { ApplicationOperationArguments } from '../../types.ts'
import type { Grammar, ParsedFile } from './language-parsers/types.ts'
import { Grammars } from './language-parsers/grammars.ts'
import { Languages } from './language-parsers/languages.ts'
import { ReadOnlyFileOperation } from '../files/read-only/base-operation.ts'

type TaskArguments = { path: string }

type ParseFileArguments = ApplicationOperationArguments<TaskArguments>

export class ParseFile extends ReadOnlyFileOperation<
  TaskArguments,
  ParsedFile
> {
  protected override logPrefix = 'Parse file: '
  private language = ''
  private tree: Tree | null = null

  result() {
    const path = this.operationArguments.path
    return { path, language: this.language, tree: this.tree }
  }

  protected override async perform() {
    const path = this.operationArguments.path
    const text = await this.applicationData.filesystem.readTextFile(path)
    await this.parseWith(
      new Grammars(new Languages().grammars()).grammarFor(path, text),
      text,
    )
  }

  private async parseWith(grammar: Grammar | undefined, text: string) {
    if (grammar === undefined) {
      this.fail(`no grammar for path: ${this.operationArguments.path}`)
    } else {
      await this.parse(grammar, text)
    }
  }

  private async parse(grammar: Grammar, text: string) {
    const parser = await this.applicationData.parsers().parserFor(grammar)
    this.record(grammar, parser.parse(text))
  }

  private record(grammar: Grammar, tree: Tree | null) {
    if (tree === null) {
      this.fail(`parse cancelled: ${this.operationArguments.path}`)
    } else {
      this.language = grammar.language
      this.tree = tree
    }
  }
}

export const parseFile = (args: ParseFileArguments) => {
  return new ParseFile(args)
}
