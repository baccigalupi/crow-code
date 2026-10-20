import dotenv from 'dotenv'
import type { EnvironmentValues } from '../model-discovery/types.ts'
import type { Filesystem } from './filesystem.ts'
import { expandHome } from './allowed-paths/expand-home.ts'

type EnvironmentArguments = {
  runtimeEnvironment: EnvironmentValues
  filesystem: Filesystem
  path?: string
}

export class Environment {
  private filesystem: Filesystem
  private path: string
  private runtimeEnvironment: EnvironmentValues
  private fileValues: EnvironmentValues = {}

  constructor(
    { runtimeEnvironment, filesystem, path = '' }: EnvironmentArguments,
  ) {
    this.runtimeEnvironment = runtimeEnvironment
    this.filesystem = filesystem
    this.path = path
  }

  async run() {
    const text = await this.filesystem.readTextFile(this.expandedPath())
      .catch(() => '')
    this.fileValues = dotenv.parse(text)
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
    return { ...this.fileValues, ...this.runtimeEnvironment }
  }

  private expandedPath() {
    return expandHome({ directories: [this.path], envars: this })
      .directories()[0] || ''
  }
}

export const loadEnvironmentalVariables = (
  environmentArguments: EnvironmentArguments,
) => {
  return new Environment(environmentArguments).run()
}
