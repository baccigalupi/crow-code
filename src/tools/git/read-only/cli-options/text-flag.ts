import { GitFlag } from './flag.ts'

export class TextFlag extends GitFlag {
  isValid() {
    return this.value !== undefined && this.value !== ''
  }
}
