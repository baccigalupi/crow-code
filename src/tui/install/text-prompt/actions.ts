import type { PromptArguments } from '../types.ts'
import type { TextPromptPanel } from './text-prompt.tsx'

// What a text prompt's input does: typing goes into the panel's field,
// return moves on.
export class TextPromptActions {
  private actionArguments: PromptArguments<TextPromptPanel>

  constructor(actionArguments: PromptArguments<TextPromptPanel>) {
    this.actionArguments = actionArguments
  }

  input() {
    const { panel, store } = this.actionArguments
    return (value: string) => panel.field(store).replace(value)
  }

  submit() {
    const { panel, navigation } = this.actionArguments
    return () => navigation.goTo(panel.next)
  }
}
