import type { PanelFlow } from '../types.ts'
import type { InstallFlowArguments, InstallStep } from './types.ts'
import { ProviderFlow } from './flow/provider-flow.ts'
import { TextFlow } from './flow/text-flow.ts'
import { ConfirmController } from './panels/confirm/controller.ts'
import { IdleController } from './panels/shared/idle-controller.ts'

// Where each install panel sends its keys and what next and cancel mean. An
// interim table until panels carry their own flow.
export class InstallFlow {
  private stores: InstallFlowArguments

  constructor(stores: InstallFlowArguments) {
    this.stores = stores
  }

  panels(): Record<string, PanelFlow<InstallStep>> {
    const { directories, permissions, providers } = this.stores
    return {
      ...new TextFlow({ directories, permissions }).panels(),
      ...new ProviderFlow(providers).panels(),
      ...this.closing(),
    }
  }

  private closing() {
    const controller = new ConfirmController(this.stores.confirm)
    return {
      confirm: { controller, next: 'completeSetup' as const },
      completeSetup: { controller: new IdleController('stay') },
      done: { controller: new IdleController('exit') },
    }
  }
}
