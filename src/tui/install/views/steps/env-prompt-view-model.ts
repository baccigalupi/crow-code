import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { initialUserInputState } from '../../interactions/state/config-text.ts'
import type { InputText } from '../../../types.ts'

type EnvPromptViewModelArguments = {
  readonly globalDirectory: InputText
}

export const envPromptViewModel = ({
  globalDirectory,
}: EnvPromptViewModelArguments) => {
  const builder = crowConfigFromInputs({
    ...initialUserInputState(),
    globalDirectory,
  })
  return { defaultValue: builder.crowConfig().envFile }
}
