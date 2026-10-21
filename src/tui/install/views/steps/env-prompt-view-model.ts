import { buildCrowConfig } from '../../crow-config/build.ts'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InputBuffer } from '../../../types.ts'

type EnvPromptViewModelArguments = {
  readonly globalDirectory: InputBuffer
}

const blankInputs = {
  repoDirectory: emptyBuffer(),
  envFile: emptyBuffer(),
  escalateRead: emptyBuffer(),
  escalateWrite: emptyBuffer(),
}

export const envPromptViewModel = (
  { globalDirectory }: EnvPromptViewModelArguments,
) => {
  const { config } = buildCrowConfig({ ...blankInputs, globalDirectory }).all()
  return { defaultValue: config.envFile }
}
