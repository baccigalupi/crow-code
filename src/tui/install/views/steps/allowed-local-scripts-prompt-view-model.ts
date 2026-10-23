import { defaultCrowConfig } from '../../../../domain/config.ts'

export const allowedLocalScriptsPromptViewModel = () => {
  const { allowedLocalScripts } = defaultCrowConfig().permissions
  return { defaultValue: allowedLocalScripts.join(', ') }
}
