import { buildCrowConfig } from '../../crow-config/build.ts'
import { emptyText } from '../../../input-text.ts'
import type { InputText } from '../../../types.ts'

type EnvPromptViewModelArguments = {
  readonly globalDirectory: InputText
}

const blankInputs = {
  repoDirectory: emptyText(),
  envFile: emptyText(),
  ignore: emptyText(),
  additionalRead: emptyText(),
  escalateRead: emptyText(),
  escalateWrite: emptyText(),
  allowedLocalScripts: emptyText(),
}

export const envPromptViewModel = ({
  globalDirectory,
}: EnvPromptViewModelArguments) => {
  const { config } = buildCrowConfig({ ...blankInputs, globalDirectory }).all()
  return { defaultValue: config.envFile }
}
