import { computed } from '@preact/signals-core'
import { join } from 'node:path'
import { TextFieldStore } from './text-field-store.ts'

// Where crow keeps its repo config, its global data and its .env file. An
// empty field stands for its default.
export class DirectoriesStore {
  readonly defaultRepoDirectory = '.crow'
  readonly defaultGlobalDirectory = '~/.crow'
  readonly repoDirectory = new TextFieldStore()
  readonly globalDirectory = new TextFieldStore()
  readonly envFile = new TextFieldStore()
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
    if (field.text.value.text === '') return defaultValue

    return field.text.value.text
  }

  private texts() {
    return {
      repoDirectory: this.repoDirectory.text.value,
      globalDirectory: this.globalDirectory.text.value,
      envFile: this.envFile.text.value,
    }
  }
}
