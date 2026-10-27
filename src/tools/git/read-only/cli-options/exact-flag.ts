import { GitFlag } from './flag.ts'

export class ExactFlag extends GitFlag {
  isValid() {
    return true
  }
}
