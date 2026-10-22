import type { GitFlagKind } from '../../../types.ts'

const isNumber = (value: string) => /^\d+$/.test(value)

export class GitFlagValidator {
  readonly offenders: string[] = []
  readonly badNumbers: string[] = []
  readonly positionals: string[] = []
  readonly flagPaths: string[] = []
  private flags: Map<string, GitFlagKind>
  private values: string[]
  private consumed = new Set<number>()

  constructor({
    flags,
    values,
  }: {
    flags: Record<string, GitFlagKind>
    values: string[]
  }) {
    this.flags = new Map(Object.entries(flags))
    this.values = values
  }

  validate() {
    this.beforeSeparator().forEach((token, index) => this.visit(token, index))
    return this
  }

  get pathspecs() {
    return this.values.slice(this.separator() + 1)
  }

  private beforeSeparator() {
    return this.values.slice(0, this.separator())
  }

  private separator() {
    return [...this.values, '--'].indexOf('--')
  }

  private visit(token: string, index: number) {
    if (this.consumed.has(index)) return
    if (!token.startsWith('-')) this.positionals.push(token)
    else if (token.startsWith('--')) this.long(token)
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
    else if (kind === 'path') this.flagPaths.push(`${value}`)
  }

  private short(token: string, index: number) {
    const kind = this.kindOf(token)
    if (kind === undefined) this.attached(token)
    else if (kind !== 'switch') this.separate(token, index, kind)
  }

  private separate(token: string, index: number, kind: GitFlagKind) {
    const value = this.values[index + 1]
    this.consumed.add(index + 1)
    if (value === undefined) this.offenders.push(token)
    else if (kind === 'number' && !isNumber(value)) {
      this.badNumbers.push(`${token} ${value}`)
    } else if (kind === 'path') this.flagPaths.push(value)
  }

  private attached(token: string) {
    const kind = this.kindOf(token.slice(0, 2))
    const value = token.slice(2)
    if (kind === undefined || kind === 'switch' || value === '') {
      this.offenders.push(token)
    } else if (kind === 'number' && !isNumber(value)) {
      this.offenders.push(token)
    } else if (kind === 'path') this.flagPaths.push(value)
  }

  private kindOf(name: string) {
    return this.flags.get(name)
  }
}
