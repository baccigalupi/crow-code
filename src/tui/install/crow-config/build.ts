import { join } from '@std/path'
import {
  defaultCrowGlobalDirectory,
  defaultCrowRepoDirectory,
} from '../interactions/state/config-buffer.ts'
import type { InputBuffer } from '../../types.ts'
import type { BuildCrowConfigArguments, CrowConfig } from '../types.ts'

// READ side: builds the config the installer would write from the typed
// inputs. Pure; touches no files. Writing lives in write.ts.
export class CrowConfigBuilder {
  private globalDirectoryInput: InputBuffer
  private repoDirectoryInput: InputBuffer
  private envFileInput: InputBuffer

  constructor(
    { globalDirectory, repoDirectory, envFile }: BuildCrowConfigArguments,
  ) {
    this.globalDirectoryInput = globalDirectory
    this.repoDirectoryInput = repoDirectory
    this.envFileInput = envFile
  }

  all() {
    return {
      crowRepoDirectory: this.crowRepoDirectory(),
      crowGlobalDirectory: this.crowGlobalDirectory(),
      crowConfigPath: this.crowConfigPath(),
      config: this.crowConfig(),
      crowConfigJson: this.crowConfigJson(),
    }
  }

  private crowConfigPath() {
    return `${this.crowRepoDirectory()}/config.json`
  }

  private crowConfigJson() {
    return JSON.stringify(this.crowConfig(), null, 2)
  }

  private crowGlobalDirectory() {
    return this.directory(this.globalDirectoryInput, defaultCrowGlobalDirectory)
  }

  private envFile() {
    return this.directory(
      this.envFileInput,
      join(this.crowGlobalDirectory(), '.env'),
    )
  }

  private crowRepoDirectory() {
    return this.directory(this.repoDirectoryInput, defaultCrowRepoDirectory)
  }

  private directory(input: InputBuffer, fallback: string) {
    if (input.text.length === 0) return fallback
    return input.text
  }

  private crowConfig(): CrowConfig {
    return {
      crowGlobalDirectory: this.crowGlobalDirectory(),
      envFile: this.envFile(),
      permissions: this.permissions(),
    }
  }

  private permissions(): CrowConfig['permissions'] {
    return {
      ignore: ['node_modules', '.git'],
      additionalRead: [],
      additionalWrite: [],
    }
  }
}

export const buildCrowConfig = (
  buildCrowConfigArguments: BuildCrowConfigArguments,
) => {
  return new CrowConfigBuilder(buildCrowConfigArguments)
}
