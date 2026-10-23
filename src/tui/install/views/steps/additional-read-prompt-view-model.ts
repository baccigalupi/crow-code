import { defaultCrowConfig } from '../../../../domain/config.ts'

export const additionalReadPromptViewModel = () => {
  const { additionalRead } = defaultCrowConfig().permissions
  return { defaultValue: JSON.stringify(additionalRead) }
}
