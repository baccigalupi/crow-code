import { parse } from '@std/dotenv'
import type { EnvironmentValues } from '../model-discovery/types.ts'
import { expandHome } from './path-permissions/expand-home.ts'

export class Environment {
  private deno: typeof Deno
  private path: string
  private processValues: EnvironmentValues
  private fileValues: EnvironmentValues = {}

  constructor(deno: typeof Deno = Deno, path = '') {
    this.deno = deno
    this.path = path
    this.processValues = deno.env.toObject()
  }

  async run() {
    const text = await this.deno.readTextFile(this.expandedPath())
      .catch(() => '')
    this.fileValues = parse(text)
    return this
  }

  hasValue(name: string): boolean {
    return this.values()[name] !== undefined
  }

  value(name: string): string {
    if (!this.hasValue(name)) {
      return ''
    }

    return this.values()[name]
  }

  private values() {
    return { ...this.fileValues, ...this.processValues }
  }

  private expandedPath() {
    return expandHome({ directories: [this.path], envars: this })
      .directories()[0] || ''
  }
}

export const loadEnvironmentalVariables = (
  environmentPath: string,
  deno: typeof Deno = Deno,
) => {
  return new Environment(deno, environmentPath).run()
}
