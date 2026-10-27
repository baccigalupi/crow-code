import { GitFlag } from './flag.ts'

const isNumber = (value: string | undefined) => /^\d+$/.test(`${value}`)

export class NumberFlag extends GitFlag {
  isValid() {
    return isNumber(this.value)
  }

  override reason() {
    if (this.value === undefined || this.value === '') {
      return 'notAllowed' as const
    } else {
      return 'notNumber' as const
    }
  }
}
