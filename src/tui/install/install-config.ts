import {
  defaultRepoDirectory,
  defaultUserDirectory,
} from './interactions/state/config-buffer.ts'
import type { InputBuffer } from '../types.ts'
import type {
  CrowConfig,
  InstallConfig as InstallConfigData,
  InstallConfigArguments,
  InstallConfigSaver,
} from './types.ts'

const defaultIgnore = ['node_modules', '.git']

export class InstallConfig {
  private user: InputBuffer
  private repo: InputBuffer

  constructor({ user, repo }: InstallConfigArguments) {
    this.user = user
    this.repo = repo
  }

  all(): InstallConfigData {
    return {
      repoDirectory: this.repoDirectory(),
      userDirectory: this.userDirectory(),
      filePath: this.filePath(),
      config: this.crowConfig(),
      json: this.json(),
    }
  }

  private filePath() {
    return `${this.repoDirectory()}/config.json`
  }

  private json() {
    return JSON.stringify(this.crowConfig(), null, 2)
  }

  private userDirectory() {
    return this.directory(this.user, defaultUserDirectory)
  }

  private repoDirectory() {
    return this.directory(this.repo, defaultRepoDirectory)
  }

  private directory(input: InputBuffer, fallback: string) {
    if (input.text.length === 0) return fallback
    return input.text
  }

  private crowConfig(): CrowConfig {
    return {
      userDirectory: this.userDirectory(),
      permissions: this.permissions(),
    }
  }

  private permissions(): CrowConfig['permissions'] {
    return {
      ignore: [...defaultIgnore],
      additionalRead: [],
      additionalWrite: [],
    }
  }
}

export const installConfig = (
  installConfigArguments: InstallConfigArguments,
) => {
  return new InstallConfig(installConfigArguments)
}

export const writeInstallConfig: InstallConfigSaver = (
  { repoDirectory, filePath, json },
) => {
  Deno.mkdirSync(repoDirectory, { recursive: true })
  Deno.writeTextFileSync(filePath, `${json}\n`)
}
