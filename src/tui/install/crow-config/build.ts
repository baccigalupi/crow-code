import { join } from 'node:path'
import { buildPermissions } from './permissions.ts'
import {
  defaultCrowGlobalDirectory,
  defaultCrowRepoDirectory,
} from '../interactions/state/config-buffer.ts'
import type { InputBuffer } from '../../types.ts'
import type { BuildCrowConfigArguments } from '../types.ts'

// READ side: builds the config the installer would write from the typed
// inputs. Pure; touches no files. Writing lives in write.ts.
export class CrowConfigBuilder {
  private globalDirectoryInput: InputBuffer
  private repoDirectoryInput: InputBuffer
  private envFileInput: InputBuffer
  private escalateReadInput: InputBuffer
  private escalateWriteInput: InputBuffer

  constructor(
    {
      globalDirectory,
      repoDirectory,
      envFile,
      escalateRead,
      escalateWrite,
    }: BuildCrowConfigArguments,
  ) {
    this.globalDirectoryInput = globalDirectory
    this.repoDirectoryInput = repoDirectory
    this.envFileInput = envFile
    this.escalateReadInput = escalateRead
    this.escalateWriteInput = escalateWrite
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

  private directory(input: InputBuffer, defaultValue: string) {
    if (input.text.length === 0) return defaultValue
    return input.text
  }

  private crowConfig() {
    return {
      crowGlobalDirectory: this.crowGlobalDirectory(),
      envFile: this.envFile(),
      permissions: this.permissions(),
    }
  }

  private permissions() {
    return buildPermissions({
      escalateRead: this.escalateReadInput,
      escalateWrite: this.escalateWriteInput,
    })
  }
}

export const buildCrowConfig = (
  buildCrowConfigArguments: BuildCrowConfigArguments,
) => {
  return new CrowConfigBuilder(buildCrowConfigArguments)
}
