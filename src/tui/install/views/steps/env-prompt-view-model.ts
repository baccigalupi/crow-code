import { buildCrowConfig } from '../../crow-config/build.ts'
import { initialInstallState } from '../../interactions/state/config-text.ts'
import type { InputText } from '../../../types.ts'

type EnvPromptViewModelArguments = {
  readonly globalDirectory: InputText
}

export const envPromptViewModel = ({
  globalDirectory,
}: EnvPromptViewModelArguments) => {
  const { config } = buildCrowConfig({
    ...initialInstallState(),
    globalDirectory,
  }).all()
  return { defaultValue: config.envFile }
}
