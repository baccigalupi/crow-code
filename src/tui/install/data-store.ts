import { computed } from '@preact/signals-core'
import type { DataStoreArguments } from './types.ts'
import { Navigator } from './navigator.ts'
import { ConfirmStore } from './interactions/data-stores/confirm-store.ts'
import { DirectoriesStore } from './interactions/data-stores/directories-store.ts'
import { QuitStore } from './interactions/data-stores/quit-store.ts'
import { PermissionsStore } from './interactions/data-stores/permissions-store.ts'
import { ProviderEditFormStore } from './interactions/data-stores/provider-edit-form-store.ts'
import { ProviderStore } from './interactions/data-stores/provider-store.ts'
import { SetupProgressStore } from './interactions/data-stores/setup-progress-store.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'

// The whole installer: the steps' stores, whether to quit, the answers they
// add up to, the setup progress, and the navigator that says which step is
// showing.
export class DataStore {
  readonly confirm = new ConfirmStore()
  readonly directories = new DirectoriesStore()
  readonly quit = new QuitStore()
  readonly permissions = new PermissionsStore()
  readonly providerEditForm = new ProviderEditFormStore()
  readonly providers = new ProviderStore()
  readonly navigator = new Navigator(this)
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

  constructor({ applicationData }: DataStoreArguments) {
    this.applicationData = applicationData
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
