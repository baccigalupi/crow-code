import { inputTextViewModel } from '../../input-text-view-model.ts'
import type { InputText } from '../../types.ts'

type PromptViewModelArguments = {
  readonly input: InputText
  readonly masked?: boolean
}

const maskCharacter = '•'

const shownText = ({ input, masked }: PromptViewModelArguments) => {
  if (!masked) return input
  return { ...input, text: maskCharacter.repeat(input.text.length) }
}

// Splits the input around the cursor; masked inputs show only bullets.
export const promptViewModel = (
  promptViewModelArguments: PromptViewModelArguments,
) => {
  return inputTextViewModel(shownText(promptViewModelArguments))
}
