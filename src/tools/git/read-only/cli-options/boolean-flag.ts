import { GitFlag } from './flag.ts'

export class BooleanFlag extends GitFlag {
  isValid() {
    return this.value === undefined
  }
}
