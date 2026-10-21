import type { Plugin } from './engine/types.ts'
import { fullInputNames } from './rules/full-input-names.ts'

export const installNamesPlugin: Plugin = {
  name: 'crow-style-install',
  rules: [fullInputNames],
}
