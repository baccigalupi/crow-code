import { computed } from '@preact/signals-core'
import { TextFieldStore } from './text-field-store.ts'

// Where crow keeps its repo config, its global data and its .env file.
export class DirectoriesStore {
  readonly defaultRepoDirectory = '.crow'
  readonly defaultGlobalDirectory = '~/.crow'
  readonly repoDirectory = new TextFieldStore()
  readonly globalDirectory = new TextFieldStore()
  readonly envFile = new TextFieldStore()
  readonly values = computed(() => this.texts())

  private texts() {
    return {
      repoDirectory: this.repoDirectory.text.value,
      globalDirectory: this.globalDirectory.text.value,
      envFile: this.envFile.text.value,
    }
  }
}
