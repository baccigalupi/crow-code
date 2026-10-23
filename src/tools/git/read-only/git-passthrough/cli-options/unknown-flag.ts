import { GitFlag } from './flag.ts'

export class UnknownFlag extends GitFlag {
  isValid() {
    return false
  }
}
