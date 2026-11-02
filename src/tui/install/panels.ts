import { memoize } from '../../decorators.ts'
import type { PanelFlow } from '../types.ts'
import type { DataStore } from './data-store.ts'
import type { PanelName, PromptPanel } from './types.ts'
import { AdditionalReadPanel } from './panels/additional-read.ts'
import { AdditionalWritePanel } from './panels/additional-write.ts'
import { AllowedLocalScriptsPanel } from './panels/allowed-local-scripts.ts'
import { CompleteSetupPanel } from './panels/complete-setup.ts'
import { ConfigPreviewPanel } from './panels/config-preview.ts'
import { ConfirmPanel } from './panels/confirm.ts'
import { CrowGlobalDirectoryPanel } from './panels/crow-global-directory.ts'
import { DonePanel } from './panels/done.ts'
import { EnvFilePanel } from './panels/env-file.ts'
import { EscalateReadPanel } from './panels/escalate-read.ts'
import { EscalateWritePanel } from './panels/escalate-write.ts'
import { HeaderPanel } from './panels/header.ts'
import { IgnorePanel } from './panels/ignore.ts'
import { ProviderCredentialsPanel } from './panels/provider-credentials.ts'
import { ProviderNamePanel } from './panels/provider-name.ts'
import { ProviderUrlPanel } from './panels/provider-url.ts'
import { RepoPanel } from './panels/repo.ts'

// Every panel of the install screen, declared once and in screen order: the
// header and config preview that take no keys, then the prompts in the order
// they are asked. The panel names, the navigator's flow and the layout all
// come from here.
export class Panels {
  readonly header = new HeaderPanel()
  readonly preview = new ConfigPreviewPanel()
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
  readonly all = [this.header, this.preview, ...this.prompts]

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
    return { controller: panel.controller(store), next, cancel }
  }

  @memoize
  private byName(): Record<string, PromptPanel> {
    return Object.fromEntries(this.prompts.map((panel) => [panel.name, panel]))
  }
}
