import jsTs from './js-ts/grammars.json'
import type { Grammar } from './types.ts'

export class Languages {
  grammars(): Grammar[] {
    return [...jsTs]
  }
}
