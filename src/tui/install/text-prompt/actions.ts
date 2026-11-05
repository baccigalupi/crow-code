import type { PromptArguments, TextStepName } from '../types.ts'
import { textSteps } from './steps.ts'

// What a text question's input does: typing goes into the step's field,
// return moves on.
export class TextPromptActions {
  private actionArguments: PromptArguments<TextStepName>

  constructor(actionArguments: PromptArguments<TextStepName>) {
    this.actionArguments = actionArguments
  }

  input() {
    const { step, store } = this.actionArguments
    return (value: string) => store.textFields[step].replace(value)
  }

  submit() {
    const { step, navigation } = this.actionArguments
    return () => navigation.goTo(textSteps[step].next)
  }
}
