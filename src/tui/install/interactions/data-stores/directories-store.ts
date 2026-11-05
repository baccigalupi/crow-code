import { computed } from '@preact/signals-core'
import { join } from 'node:path'
import { CrowGlobalDirectoryStep } from '../../steps/text/crow-global-directory-step.ts'
import { RepoDirectoryStep } from '../../steps/text/repo-directory-step.ts'
import { TextFieldStore } from './text-field-store.ts'

// Where crow keeps its repo config, its global data and its .env file. An
// empty field stands for its step's default path.
export class DirectoriesStore {
  readonly defaultRepoDirectory = new RepoDirectoryStep().defaultPath
  readonly defaultGlobalDirectory = new CrowGlobalDirectoryStep().defaultPath
  readonly repoDirectory = new TextFieldStore()
  readonly globalDirectory = new TextFieldStore()
  readonly envFile = new TextFieldStore()
  // The field each question types into, by step.
  readonly fields = {
    repoDirectory: this.repoDirectory,
    crowGlobalDirectory: this.globalDirectory,
    envFile: this.envFile,
  }
  readonly values = computed(() => this.texts())
  readonly configPath = computed(() => `${this.repoPath()}/config.json`)
  readonly globalPath = computed(() =>
    this.typedOr(this.globalDirectory, this.defaultGlobalDirectory),
  )
  readonly defaultEnvFile = computed(() => join(this.globalPath.value, '.env'))

  private repoPath() {
    return this.typedOr(this.repoDirectory, this.defaultRepoDirectory)
  }

  private typedOr(field: TextFieldStore, defaultValue: string) {
    if (field.text.value === '') return defaultValue

    return field.text.value
  }

  private texts() {
    return {
      repoDirectory: this.repoDirectory.text.value,
      globalDirectory: this.globalDirectory.text.value,
      envFile: this.envFile.text.value,
    }
  }
}
