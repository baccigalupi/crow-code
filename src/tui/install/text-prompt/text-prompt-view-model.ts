import type { TextStepName } from '../types.ts'
import { textSteps } from './steps.ts'

// A question's label, and the default its input shows until something is
// typed, bare or in parentheses.
export class TextPromptViewModel {
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
    return textSteps[this.step].label
  }

  placeholder() {
    if (textSteps[this.step].bare) return this.defaults[this.step]

    return `(${this.defaults[this.step]})`
  }
}

export const textPromptViewModel = (
  step: TextStepName,
  defaults: Readonly<Record<TextStepName, string>>,
) => new TextPromptViewModel(step, defaults)
