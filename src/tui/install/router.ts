import { memoize } from '../../decorators.ts'
import type { Navigator } from '../navigator.ts'
import type { PanelFlow } from '../types.ts'
import type { DataStore } from './data-store.ts'
import type { PanelName, PromptPanel } from './types.ts'
import { AdditionalReadPanel } from './permissions/additional-read.ts'
import { AdditionalWritePanel } from './permissions/additional-write.ts'
import { AllowedLocalScriptsPanel } from './permissions/allowed-local-scripts.ts'
import { CompleteSetupPanel } from './complete-setup/complete-setup.tsx'
import { ConfirmPanel } from './confirm/confirm.tsx'
import { CrowGlobalDirectoryPanel } from './directories/crow-global-directory.ts'
import { DonePanel } from './done/done.tsx'
import { EnvFilePanel } from './directories/env-file.ts'
import { EscalateReadPanel } from './permissions/escalate-read.ts'
import { EscalateWritePanel } from './permissions/escalate-write.ts'
import { IgnorePanel } from './permissions/ignore.ts'
import { ProviderCredentialsPanel } from './provider/provider-credentials.ts'
import { ProviderNamePanel } from './provider/provider-name.ts'
import { ProviderUrlPanel } from './provider/provider-url.ts'
import { RepoPanel } from './directories/repo.ts'

// Every prompt of the install screen, declared once and in the order they
// are asked. The panel names and the navigator's flow come from here.
export class Router {
  readonly prompts = [
    new RepoPanel(),
    new CrowGlobalDirectoryPanel(),
    new EnvFilePanel(),
    new IgnorePanel(),
    new AdditionalReadPanel(),
    new AdditionalWritePanel(),
    new EscalateReadPanel(),
    new EscalateWritePanel(),
    new AllowedLocalScriptsPanel(),
    new ProviderNamePanel(),
    new ProviderUrlPanel(),
    new ProviderCredentialsPanel(),
    new ConfirmPanel(),
    new CompleteSetupPanel(),
    new DonePanel(),
  ]

  get(name: PanelName): PromptPanel {
    return this.byName()[name]
  }

  // What the navigator needs of each prompt: where its keys go and what next
  // and cancel mean.
  flows(store: DataStore): Record<string, PanelFlow<PanelName>> {
    return Object.fromEntries(
      this.prompts.map((panel) => [panel.name, this.flow(panel, store)]),
    )
  }

  private flow(panel: PromptPanel, store: DataStore): PanelFlow<PanelName> {
    const { next, cancel } = panel
    const controller = panel.controller(store)
    return { controller, next, cancel, entered: this.entered(panel, store) }
  }

  // The panel's own entered with the store bound, so the navigator never
  // sees the store.
  private entered(panel: PromptPanel, store: DataStore) {
    const { entered } = panel
    if (entered === undefined) {
      return
    } else {
      return (navigator: Navigator<PanelName>) =>
        entered.call(panel, store, navigator)
    }
  }

  @memoize
  private byName(): Record<string, PromptPanel> {
    return Object.fromEntries(this.prompts.map((panel) => [panel.name, panel]))
  }
}
