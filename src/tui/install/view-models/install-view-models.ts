import { memoize } from '../../../decorators.ts'
import type { TextPromptViewModelArguments } from '../types.ts'
import { ConfigPanelViewModel } from './config-panel-view-model.ts'
import { ConfirmPromptViewModel } from './confirm-prompt-view-model.ts'
import { DoneMessageViewModel } from './done-message-view-model.ts'
import { ProviderPromptViewModel } from './provider-prompt-view-model.ts'
import { SetupProgressViewModel } from './setup-progress-view-model.ts'
import { StepPromptsViewModel } from './step-prompts-view-model.ts'
import { TextPromptViewModel } from './text-prompt-view-model.ts'

// The view models the install screen draws from, built once over the stores
// whose defaults the prompts show.
export class InstallViewModels {
  private stores: TextPromptViewModelArguments

  constructor(stores: TextPromptViewModelArguments) {
    this.stores = stores
  }

  @memoize
  configPanel() {
    return new ConfigPanelViewModel()
  }

  @memoize
  stepPrompts() {
    return new StepPromptsViewModel(this.stepPromptsArguments())
  }

  private stepPromptsArguments() {
    return {
      text: new TextPromptViewModel(this.stores),
      provider: new ProviderPromptViewModel(),
      confirm: new ConfirmPromptViewModel(),
      progress: this.progress(),
      done: new DoneMessageViewModel(this.progress()),
    }
  }

  @memoize
  private progress() {
    return new SetupProgressViewModel()
  }
}
