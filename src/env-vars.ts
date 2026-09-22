import { parse } from '@std/dotenv'
import { existsSync } from '@std/fs'
import { join } from '@std/path'
import type { EnvironmentValues } from './model-info/types.ts'

const defaultEnvironmentPath = () => join(Deno.cwd(), '.env')

const fileValues = (path: string): EnvironmentValues => {
  if (!existsSync(path)) {
    return {}
  }

  return parse(Deno.readTextFileSync(path))
}

export class Environment {
  private values: EnvironmentValues

  constructor(values: EnvironmentValues) {
    this.values = values
  }

  hasValue(name: string) {
    return this.values[name] !== undefined
  }

  value(name: string) {
    if (!this.hasValue(name)) {
      return ''
    }

    return this.values[name]
  }
}

export const loadEnvironmentalVariables = (
  environmentPath: string = defaultEnvironmentPath(),
) => {
  const values = { ...fileValues(environmentPath), ...Deno.env.toObject() }
  return new Environment(values)
}
