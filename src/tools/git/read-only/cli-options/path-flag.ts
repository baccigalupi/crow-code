import { TextFlag } from './text-flag.ts'

export class PathFlag extends TextFlag {
  override paths() {
    if (this.isValid()) {
      return [`${this.value}`]
    } else {
      return []
    }
  }
}
