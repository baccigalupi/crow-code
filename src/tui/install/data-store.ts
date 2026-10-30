import { computed } from '@preact/signals-core'
import type { InstallStep, DataStoreArguments } from './types.ts'
import { Navigator } from '../navigator.ts'
import { crowConfigFromInputs } from './crow-config/from-inputs.ts'
import { ConfirmStore } from './data-stores/confirm-store.ts'
import { DirectoriesStore } from './data-stores/directories-store.ts'
import { PermissionsStore } from './data-stores/permissions-store.ts'
import { ProvidersStore } from './data-stores/providers-store.ts'
import { SetupStore } from './data-stores/setup-store.ts'
import { InstallFlow } from './flow.ts'

// The whole installer: the prompts' stores, the answers they add up to, the
// setup that runs once they are confirmed, and the navigator that keys drive.
export class DataStore {
  readonly confirm = new ConfirmStore()
  readonly directories = new DirectoriesStore()
  readonly permissions = new PermissionsStore()
  readonly providers = new ProvidersStore()
  readonly navigator = new Navigator<InstallStep>({
    initial: 'repo',
    panels: new InstallFlow(this).panels(),
  })
  readonly setup: SetupStore
  readonly inputs = computed(() => this.answers())
  readonly stepValues = computed(() => this.promptValues())

  constructor({ applicationData }: DataStoreArguments) {
    const { inputs, navigator } = this
    this.setup = new SetupStore({ applicationData, inputs, navigator })
  }

  listen() {
    this.setup.listen()
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
      step: this.navigator.current.value,
      confirmation: this.confirm.confirmed.value,
    }
  }

  // What the current prompt shows: the answers, the config path they lead
  // to and the setup progress.
  private promptValues() {
    return {
      ...this.inputs.value,
      crowConfigPath: crowConfigFromInputs(this.inputs.value).crowConfigPath(),
      setupTasks: this.setup.tasks.value,
    }
  }
}
