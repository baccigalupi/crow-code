import { defaultCrowConfig } from '../../../../domain/config.ts'

export const escalateWritePromptViewModel = () => {
  const { escalateWrite } = defaultCrowConfig().permissions
  return { defaultValue: escalateWrite.join(', ') }
}
