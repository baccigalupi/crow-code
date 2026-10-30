import { memoize } from '../../../decorators.ts'
import type {
  InstallStep,
  StepPromptsViewModelArguments,
  StepPropsBuilders,
  StepValues,
  TextPromptStep,
} from '../types.ts'
import type { ConfirmPromptViewModel } from './confirm-prompt-view-model.ts'
import type { DoneMessageViewModel } from './done-message-view-model.ts'
import type { ProviderPromptViewModel } from './provider-prompt-view-model.ts'
import type { SetupProgressViewModel } from './setup-progress-view-model.ts'
import type { TextPromptViewModel } from './text-prompt-view-model.ts'

// Picks the view model for the current step and returns the step with the
// props its prompt view draws. A step with no prompt gets empty props.
export class StepPromptsViewModel {
  private text: TextPromptViewModel
  private provider: ProviderPromptViewModel
  private confirm: ConfirmPromptViewModel
  private progress: SetupProgressViewModel
  private done: DoneMessageViewModel
  private readonly textSteps: readonly TextPromptStep[] = [
    'repo',
    'crowGlobalDirectory',
    'envFile',
    'ignore',
    'additionalRead',
    'additionalWrite',
    'escalateRead',
    'escalateWrite',
    'allowedLocalScripts',
  ]
  private readonly providerSteps: readonly InstallStep[] = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ]

  constructor({
    text,
    provider,
    confirm,
    progress,
    done,
  }: StepPromptsViewModelArguments) {
    this.text = text
    this.provider = provider
    this.confirm = confirm
    this.progress = progress
    this.done = done
  }

  props(values: StepValues) {
    return { step: values.step, props: this.stepProps(values) }
  }

  private stepProps(values: StepValues) {
    const build = this.builders()[values.step] || (() => ({}))
    return build(values)
  }

  @memoize
  private builders(): StepPropsBuilders {
    return {
      ...this.textBuilders(),
      ...this.providerBuilders(),
      ...this.otherBuilders(),
    }
  }

  private textBuilders() {
    return Object.fromEntries(
      this.textSteps.map((step) => [
        step,
        (values: StepValues) => this.text.props(step, values),
      ]),
    )
  }

  private providerBuilders() {
    return Object.fromEntries(
      this.providerSteps.map((step) => [
        step,
        (values: StepValues) => this.provider.props(values),
      ]),
    )
  }

  private otherBuilders() {
    return {
      confirm: (values: StepValues) => this.confirm.props(values),
      completeSetup: (values: StepValues) => this.progress.props(values),
      done: (values: StepValues) => this.done.props(values),
    }
  }
}
