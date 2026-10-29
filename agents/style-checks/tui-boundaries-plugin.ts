import type { Plugin } from './engine/types.ts'
import { tuiImportBoundaries } from './rules/tui-import-boundaries.ts'

export const tuiBoundariesPlugin: Plugin = {
  name: 'crow-style-tui',
  rules: [tuiImportBoundaries],
}
