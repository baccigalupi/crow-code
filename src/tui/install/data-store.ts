import { computed } from '@preact/signals-core'
import type { StepName, DataStoreArguments, TextStepName } from './types.ts'
import { Navigator } from '../navigator.ts'
import { ConfirmStore } from './data-stores/confirm-store.ts'
import { DirectoriesStore } from './data-stores/directories-store.ts'
import { QuitStore } from './data-stores/quit-store.ts'
import { PermissionsStore } from './data-stores/permissions-store.ts'
import { ProviderEditFormStore } from './data-stores/provider-edit-form-store.ts'
import { ProviderStore } from './data-stores/provider-store.ts'
import { SetupProgressStore } from './data-stores/setup-progress-store.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import { RunSetup } from './interactions/run-setup.ts'

// The whole installer: the steps' stores, whether to quit, the answers they
// add up to, the setup progress, and the navigator that says which step is
// showing. Arriving at completeSetup starts setup.
export class DataStore {
  readonly confirm = new ConfirmStore()
  readonly directories = new DirectoriesStore()
  readonly quit = new QuitStore()
  readonly permissions = new PermissionsStore()
  readonly providerEditForm = new ProviderEditFormStore()
  readonly providers = new ProviderStore()
  readonly navigator = new Navigator<StepName>({
    initial: 'repoDirectory',
    entered: (name) => this.entered(name),
  })
  readonly progress = new SetupProgressStore()
  readonly applicationData: ApplicationData
  readonly inputs = computed(() => this.answers())
  readonly showsConfig = computed(
    () => this.navigator.current.value !== 'repoDirectory',
  )
  readonly textFields = {
    ...this.directories.fields,
    ...this.permissions.fields,
  }
  readonly textDefaults = computed(() => this.defaults())

  constructor({ applicationData }: DataStoreArguments) {
    this.applicationData = applicationData
  }

  private entered(name: StepName) {
    if (name === 'completeSetup') new RunSetup(this).start()
  }

  // What each one-line question stands for until something is typed.
  private defaults(): Record<TextStepName, string> {
    const { directories, permissions } = this
    return {
      repoDirectory: directories.defaultRepoDirectory,
      crowGlobalDirectory: directories.defaultGlobalDirectory,
      envFile: directories.defaultEnvFile.value,
      ...permissions.defaults,
    }
  }

  // Every answer typed so far, as one value for the config builder.
  private answers() {
    return {
      ...this.directories.values.value,
      ...this.permissions.values.value,
      ...this.providerAnswers(),
      step: this.navigator.current.value,
      confirmation: this.confirm.confirmed.value,
    }
  }

  private providerAnswers() {
    return {
      ...this.providerEditForm.values.value,
      ...this.providers.values.value,
    }
  }
}
