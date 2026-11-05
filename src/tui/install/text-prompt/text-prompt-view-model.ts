import type { TextStepName } from '../types.ts'
import { TextSteps } from '../steps/text-steps.ts'

// A question's label, and the default its input shows until something is
// typed.
export class TextPromptViewModel {
  private readonly steps = new TextSteps()
  private step: TextStepName
  private defaults: Readonly<Record<TextStepName, string>>

  constructor(
    step: TextStepName,
    defaults: Readonly<Record<TextStepName, string>>,
  ) {
    this.step = step
    this.defaults = defaults
  }

  label() {
    return this.textStep().label
  }

  placeholder() {
    return this.textStep().placeholder(this.defaults[this.step])
  }

  private textStep() {
    return this.steps.named(this.step)
  }
}

export const textPromptViewModel = (
  step: TextStepName,
  defaults: Readonly<Record<TextStepName, string>>,
) => new TextPromptViewModel(step, defaults)
