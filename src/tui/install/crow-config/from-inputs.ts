import { join } from 'node:path'
import { buildPermissions } from './from-inputs/permissions.ts'
import { buildProviders } from './from-inputs/providers.ts'
import { DirectoriesStore } from '../data-stores/directories-store.ts'
import type { InputText } from '../../types.ts'
import type {
  CrowConfigInputs,
  PermissionInputs,
  ProviderInputs,
} from './types.ts'

// READ side: builds the config the installer would write from the typed
// inputs. Pure; touches no files. Writing lives in write.ts.
export class CrowConfigFromInputs {
  private globalDirectoryInput: InputText
  private repoDirectoryInput: InputText
  private envFileInput: InputText
  private sectionInputs: PermissionInputs & ProviderInputs
  private readonly directories = new DirectoriesStore()

  constructor({
    globalDirectory,
    repoDirectory,
    envFile,
    ...sectionInputs
  }: CrowConfigInputs) {
    this.globalDirectoryInput = globalDirectory
    this.repoDirectoryInput = repoDirectory
    this.envFileInput = envFile
    this.sectionInputs = sectionInputs
  }

  crowConfigPath() {
    return `${this.crowRepoDirectory()}/config.json`
  }

  crowConfigJson() {
    return JSON.stringify(this.crowConfig(), null, 2)
  }

  crowGlobalDirectory() {
    return this.directory(
      this.globalDirectoryInput,
      this.directories.defaultGlobalDirectory,
    )
  }

  crowRepoDirectory() {
    return this.directory(
      this.repoDirectoryInput,
      this.directories.defaultRepoDirectory,
    )
  }

  crowConfig() {
    return {
      crowGlobalDirectory: this.crowGlobalDirectory(),
      envFile: this.envFile(),
      permissions: this.permissions(),
      providers: this.providers(),
    }
  }

  private envFile() {
    return this.directory(
      this.envFileInput,
      join(this.crowGlobalDirectory(), '.env'),
    )
  }

  private directory(input: InputText, defaultValue: string) {
    if (input.text.length === 0) return defaultValue
    return input.text
  }

  private permissions() {
    return buildPermissions(this.sectionInputs)
  }

  private providers() {
    return buildProviders(this.sectionInputs)
  }
}

export const crowConfigFromInputs = (crowConfigInputs: CrowConfigInputs) => {
  return new CrowConfigFromInputs(crowConfigInputs)
}
