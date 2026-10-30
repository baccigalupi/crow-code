import { BoxRenderable, type RenderContext } from '@opentui/core'
import { memoize } from '../../../decorators.ts'
import { PromptView } from './prompt-view.ts'
import { ProviderPromptView } from './steps/provider-prompt-view.ts'
import { ConfirmPromptView } from './steps/confirm-prompt-view.ts'
import { SetupProgressView } from './steps/setup-progress-view.ts'
import { DoneMessageView } from './steps/done-message-view.ts'
import type {
  InstallStep,
  StepPromptsProps,
  StepProps,
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

  update(_props: StepProps) {}
}

// The current step's prompt, pinned to the bottom of the screen. A new step
// view replaces the old one, so focus and layout start fresh each kind of
// prompt.
export class StepPromptsView {
  private renderer: RenderContext
  private viewClass: StepViewClass = EmptyStepView
  private view: StepView
  private readonly stepViews = new Map<InstallStep, StepViewClass>([
    ['repo', PromptView],
    ['crowGlobalDirectory', PromptView],
    ['envFile', PromptView],
    ['ignore', PromptView],
    ['additionalRead', PromptView],
    ['additionalWrite', PromptView],
    ['escalateRead', PromptView],
    ['escalateWrite', PromptView],
    ['allowedLocalScripts', PromptView],
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

  update({ step, props }: StepPromptsProps) {
    const viewClass = this.stepViews.get(step) || EmptyStepView
    if (viewClass !== this.viewClass) {
      this.swap(viewClass)
    }
    this.view.update(props)
  }

  private swap(viewClass: StepViewClass) {
    this.view.root().destroyRecursively()
    this.viewClass = viewClass
    this.view = new viewClass(this.renderer)
    this.root().add(this.view.root())
  }
}
