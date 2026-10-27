import { BoxRenderable, type RenderContext } from '@opentui/core'
import { memoize } from '../../../decorators.ts'
import { RepoPathPromptView } from './steps/repo-path-prompt.ts'
import { GlobalPathPromptView } from './steps/global-path-prompt.ts'
import { EnvPromptView } from './steps/env-prompt.ts'
import { IgnorePromptView } from './steps/ignore-prompt.ts'
import { AdditionalReadPromptView } from './steps/additional-read-prompt.ts'
import { AdditionalWritePromptView } from './steps/additional-write-prompt.ts'
import { EscalateReadPromptView } from './steps/escalate-read-prompt.ts'
import { EscalateWritePromptView } from './steps/escalate-write-prompt.ts'
import { AllowedLocalScriptsPromptView } from './steps/allowed-local-scripts-prompt.ts'
import { ProviderPromptView } from './steps/provider-prompt.ts'
import { ConfirmPromptView } from './steps/confirm-prompt.ts'
import { SetupProgressView } from './steps/setup-progress.ts'
import { DoneMessageView } from './steps/done-message.ts'
import type {
  InstallStep,
  StepValues,
  StepView,
  StepViewClass,
} from '../types.ts'

// Shown for a step with no prompt of its own.
class EmptyStepView {
  private renderer: RenderContext

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    return new BoxRenderable(this.renderer, {})
  }

  update(_values: StepValues) {}
}

// The current step's prompt, pinned to the bottom of the screen. A new step
// view replaces the old one, so focus and layout start fresh each step.
export class StepPromptsView {
  private renderer: RenderContext
  private viewClass: StepViewClass = EmptyStepView
  private view: StepView
  private readonly stepViews = new Map<InstallStep, StepViewClass>([
    ['repo', RepoPathPromptView],
    ['crowGlobalDirectory', GlobalPathPromptView],
    ['envFile', EnvPromptView],
    ['ignore', IgnorePromptView],
    ['additionalRead', AdditionalReadPromptView],
    ['additionalWrite', AdditionalWritePromptView],
    ['escalateRead', EscalateReadPromptView],
    ['escalateWrite', EscalateWritePromptView],
    ['allowedLocalScripts', AllowedLocalScriptsPromptView],
    ['providerName', ProviderPromptView],
    ['providerUrl', ProviderPromptView],
    ['providerCredentials', ProviderPromptView],
    ['confirm', ConfirmPromptView],
    ['completeSetup', SetupProgressView],
    ['done', DoneMessageView],
  ])

  constructor(renderer: RenderContext) {
    this.renderer = renderer
    this.view = new EmptyStepView(renderer)
  }

  @memoize
  root() {
    return new BoxRenderable(this.renderer, {
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
      justifyContent: 'flex-end',
    })
  }

  update(values: StepValues) {
    const viewClass = this.stepViews.get(values.step) || EmptyStepView
    if (viewClass !== this.viewClass) {
      this.swap(viewClass)
    }
    this.view.update(values)
  }

  private swap(viewClass: StepViewClass) {
    this.view.root().destroyRecursively()
    this.viewClass = viewClass
    this.view = new viewClass(this.renderer)
    this.root().add(this.view.root())
  }
}
