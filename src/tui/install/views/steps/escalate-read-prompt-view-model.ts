import { defaultCrowConfig } from '../../../../domain/config.ts'

export const escalateReadPromptViewModel = () => {
  const { escalateRead } = defaultCrowConfig().permissions
  return { defaultValue: JSON.stringify(escalateRead) }
}
