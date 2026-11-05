import type { PromptArguments } from '../../types.ts'
import type { TextStep } from '../../steps/text-step.tsx'

// What a text question's input does: typing goes into the step's field,
// return moves on.
export class TextPromptActions {
  private actionArguments: PromptArguments<TextStep>

  constructor(actionArguments: PromptArguments<TextStep>) {
    this.actionArguments = actionArguments
  }

  input() {
    const { step, store } = this.actionArguments
    return (value: string) => store.textFields[step.name].replace(value)
  }

  submit() {
    const { step, navigation } = this.actionArguments
    return () => navigation.goTo(step.next)
  }
}
