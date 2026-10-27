import { batch, computed } from '@preact/signals-core'
import type { ExitApp, KeyFlags } from '../types.ts'
import type { DataStoreArguments } from './types.ts'
import { Keypress } from './interactions/keypress.ts'
import { configPathViewModel } from './views/config-path-view-model.ts'
import { ConfirmStore } from './data-stores/confirm-store.ts'
import { DirectoriesStore } from './data-stores/directories-store.ts'
import { PermissionsStore } from './data-stores/permissions-store.ts'
import { ProvidersStore } from './data-stores/providers-store.ts'
import { SetupStore } from './data-stores/setup-store.ts'
import { StepStore } from './data-stores/step-store.ts'

// The whole installer: the prompts' stores, the answers they add up to, the
// setup that runs once they are confirmed, and the keys that drive them.
export class DataStore {
  readonly step = new StepStore()
  readonly confirm = new ConfirmStore()
  readonly directories = new DirectoriesStore()
  readonly permissions = new PermissionsStore()
  readonly providers = new ProvidersStore(this.step)
  readonly setup: SetupStore
  readonly inputs = computed(() => this.answers())
  readonly stepValues = computed(() => this.promptValues())

  constructor({ applicationData }: DataStoreArguments) {
    const { inputs, step } = this
    this.setup = new SetupStore({ applicationData, inputs, step })
  }

  listen() {
    this.setup.listen()
  }

  press(input: string, key: KeyFlags, exit: ExitApp) {
    batch(() => new Keypress({ model: this, exit, input, key }).handle())
  }

  // A paste is typed input that arrives all at once, with newlines dropped.
  paste(text: string, exit: ExitApp) {
    this.press(text.replace(/[\r\n]/g, ''), {}, exit)
  }

  dispose() {
    this.setup.dispose()
  }

  // Every answer typed so far, as one value for the config builder.
  private answers() {
    return {
      ...this.directories.values.value,
      ...this.permissions.values.value,
      ...this.providers.values.value,
      step: this.step.current.value,
      confirmation: this.confirm.confirmed.value,
    }
  }

  // What the current prompt shows: the answers, the config path they lead
  // to and the setup progress.
  private promptValues() {
    return {
      ...this.inputs.value,
      ...configPathViewModel(this.inputs.value),
      setupTasks: this.setup.tasks.value,
    }
  }
}
