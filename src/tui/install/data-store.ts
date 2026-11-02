import { computed } from '@preact/signals-core'
import type { PanelName, DataStoreArguments } from './types.ts'
import { Navigator } from '../navigator.ts'
import { ConfirmStore } from './data-stores/confirm-store.ts'
import { DirectoriesStore } from './data-stores/directories-store.ts'
import { PermissionsStore } from './data-stores/permissions-store.ts'
import { ProviderEditFormStore } from './data-stores/provider-edit-form-store.ts'
import { ProviderStore } from './data-stores/provider-store.ts'
import { SetupProgressStore } from './data-stores/setup-progress-store.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import { Panels } from './panels.ts'

// The whole installer: the prompts' stores, the answers they add up to, the
// setup progress, and the navigator that keys drive.
export class DataStore {
  readonly confirm = new ConfirmStore()
  readonly directories = new DirectoriesStore()
  readonly permissions = new PermissionsStore()
  readonly providerEditForm = new ProviderEditFormStore()
  readonly providers = new ProviderStore()
  readonly navigator = new Navigator<PanelName>({
    initial: 'repo',
    panels: new Panels().flows(this),
  })
  readonly progress = new SetupProgressStore()
  readonly applicationData: ApplicationData
  readonly inputs = computed(() => this.answers())

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
