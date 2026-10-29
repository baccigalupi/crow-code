import type { Tree } from 'web-tree-sitter'
import type { ApplicationData } from '../../../application-data/application-data.ts'
import type { Grammar, ParsedFile } from '../language-parsers/types.ts'
import { Languages } from '../language-parsers/languages.ts'
import { Definitions } from './definitions.ts'

export class FileDefinitions {
  private applicationData: ApplicationData
  private parsed: ParsedFile
  private languages = new Languages()

  constructor(applicationData: ApplicationData, parsed: ParsedFile) {
    this.applicationData = applicationData
    this.parsed = parsed
  }

  async list() {
    const language = this.parsed.language
    const languageParser = this.languages.languageParserFor(language)
    const captures = await this.captures(this.grammar(language))
    return new Definitions(captures, languageParser).list()
  }

  private async captures(grammar: Grammar) {
    const tree = this.parsed.tree as Tree
    const query = await this.applicationData.parsers().tagsQueryFor(grammar)
    return query.captures(tree.rootNode)
  }

  private grammar(language: string) {
    return this.languages
      .grammars()
      .find((grammar) => grammar.language === language)!
  }
}
