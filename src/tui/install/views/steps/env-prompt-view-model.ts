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
  additionalWrite: emptyText(),
  additionalRead: emptyText(),
  escalateRead: emptyText(),
  escalateWrite: emptyText(),
  allowedLocalScripts: emptyText(),
  providerName: emptyText(),
  providerUrl: emptyText(),
  providerCredentials: emptyText(),
  providers: [],
}

export const envPromptViewModel = ({
  globalDirectory,
}: EnvPromptViewModelArguments) => {
  const { config } = buildCrowConfig({ ...blankInputs, globalDirectory }).all()
  return { defaultValue: config.envFile }
}
