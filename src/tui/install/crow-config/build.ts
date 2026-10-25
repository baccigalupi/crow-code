import { join } from 'node:path'
import { buildPermissions } from './permissions.ts'
import { buildProviders } from './providers.ts'
import {
  defaultCrowGlobalDirectory,
  defaultCrowRepoDirectory,
} from '../interactions/state/config-text.ts'
import type { InputText } from '../../types.ts'
import type {
  BuildCrowConfigArguments,
  PermissionInputs,
  ProviderInputs,
} from '../types.ts'

// READ side: builds the config the installer would write from the typed
// inputs. Pure; touches no files. Writing lives in write.ts.
export class CrowConfigBuilder {
  private globalDirectoryInput: InputText
  private repoDirectoryInput: InputText
  private envFileInput: InputText
  private sectionInputs: PermissionInputs & ProviderInputs

  constructor({
    globalDirectory,
    repoDirectory,
    envFile,
    ...sectionInputs
  }: BuildCrowConfigArguments) {
    this.globalDirectoryInput = globalDirectory
    this.repoDirectoryInput = repoDirectory
    this.envFileInput = envFile
    this.sectionInputs = sectionInputs
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

  private directory(input: InputText, defaultValue: string) {
    if (input.text.length === 0) return defaultValue
    return input.text
  }

  private crowConfig() {
    return {
      crowGlobalDirectory: this.crowGlobalDirectory(),
      envFile: this.envFile(),
      permissions: this.permissions(),
      providers: this.providers(),
    }
  }

  private permissions() {
    return buildPermissions(this.sectionInputs)
  }

  private providers() {
    return buildProviders(this.sectionInputs)
  }
}

export const buildCrowConfig = (
  buildCrowConfigArguments: BuildCrowConfigArguments,
) => {
  return new CrowConfigBuilder(buildCrowConfigArguments)
}
