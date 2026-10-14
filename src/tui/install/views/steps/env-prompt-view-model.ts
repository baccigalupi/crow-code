import { buildCrowConfig } from '../../crow-config/build.ts'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InputBuffer } from '../../../types.ts'

type EnvPromptViewModelArguments = {
  readonly globalDirectory: InputBuffer
}

export const envPromptViewModel = (
  { globalDirectory }: EnvPromptViewModelArguments,
) => {
  const { config } = buildCrowConfig({
    globalDirectory,
    repoDirectory: emptyBuffer(),
    envFile: emptyBuffer(),
  }).all()
  return { fallback: config.envFile }
}
