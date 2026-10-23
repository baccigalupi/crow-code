import { defaultCrowConfig } from '../../../../domain/config.ts'

export const additionalWritePromptViewModel = () => {
  const { additionalWrite } = defaultCrowConfig().permissions
  return { defaultValue: JSON.stringify(additionalWrite) }
}
