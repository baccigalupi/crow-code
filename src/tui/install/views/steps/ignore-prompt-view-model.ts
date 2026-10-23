import { defaultCrowConfig } from '../../../../domain/config.ts'

export const ignorePromptViewModel = () => {
  const { ignore } = defaultCrowConfig().permissions
  return { defaultValue: JSON.stringify(ignore) }
}
