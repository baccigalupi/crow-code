import { existsSync } from 'jsr:@std/fs'
import { parse } from 'jsr:@std/dotenv'
import { join } from 'jsr:@std/path'

type EnvironmentValues = Record<string, string>

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

  hasValue(name: string): boolean {
    return this.values[name] !== undefined
  }

  value(name: string): string {
    if (!this.hasValue(name)) {
      return ''
    }

    return this.values[name]
  }
}

export const loadEnvironmentalVariables = (
  envPath: string = defaultEnvironmentPath(),
): Environment => {
  const values = { ...fileValues(envPath), ...Deno.env.toObject() }
  return new Environment(values)
}
