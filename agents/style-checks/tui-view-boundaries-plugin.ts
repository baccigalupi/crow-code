import type { Plugin } from './engine/types.ts'
import { tuiViewImports } from './rules/tui-import-boundaries.ts'

export const tuiViewBoundariesPlugin: Plugin = {
  name: 'crow-style-tui-views',
  rules: [tuiViewImports],
}
