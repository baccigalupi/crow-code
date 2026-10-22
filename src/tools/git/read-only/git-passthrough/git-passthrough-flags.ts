import type { GitFlagKind } from '../../../types.ts'

const isNumber = (value: string) => /^\d+$/.test(value)

export class GitFlagValidator {
  readonly offenders: string[] = []
  readonly badNumbers: string[] = []
  private flags: Map<string, GitFlagKind>
  private tokens: string[]
  private consumed = new Set<number>()

  constructor(flags: Record<string, GitFlagKind>, tokens: string[]) {
    this.flags = new Map(Object.entries(flags))
    this.tokens = tokens
  }

  validate() {
    this.tokens.forEach((token, index) => this.visit(token, index))
    return this
  }

  private visit(token: string, index: number) {
    if (this.consumed.has(index) || !token.startsWith('-')) return
    if (token.startsWith('--')) this.long(token)
    else this.short(token, index)
  }

  private long(token: string) {
    const at = token.indexOf('=')
    if (at === -1) this.longName(token, token, null)
    else this.longName(token.slice(0, at), token, token.slice(at + 1))
  }

  private longName(name: string, token: string, value: string | null) {
    const kind = this.kindOf(name)
    if (kind === undefined) this.offenders.push(token)
    else if (kind === 'switch' && value !== null) this.offenders.push(token)
    else if (kind !== 'switch' && value === null) this.offenders.push(token)
    else if (kind === 'number' && !isNumber(`${value}`))
      this.badNumbers.push(token)
  }

  private short(token: string, index: number) {
    const kind = this.kindOf(token)
    if (kind === undefined) this.attached(token)
    else if (kind !== 'switch') this.separate(token, index, kind)
  }

  private separate(token: string, index: number, kind: GitFlagKind) {
    const value = this.tokens[index + 1]
    this.consumed.add(index + 1)
    if (value === undefined) this.offenders.push(token)
    else if (kind === 'number' && !isNumber(value)) {
      this.badNumbers.push(`${token} ${value}`)
    }
  }

  private attached(token: string) {
    const kind = this.kindOf(token.slice(0, 2))
    const value = token.slice(2)
    if (kind === undefined || kind === 'switch' || value === '') {
      this.offenders.push(token)
    } else if (kind === 'number' && !isNumber(value)) {
      this.offenders.push(token)
    }
  }

  private kindOf(name: string) {
    return this.flags.get(name)
  }
}
