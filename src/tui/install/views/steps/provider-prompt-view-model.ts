import type { InstallStep, ProviderPromptProps } from '../../types.ts'

const fieldSteps: readonly InstallStep[] = [
  'providerName',
  'providerUrl',
  'providerCredentials',
]

const statuses = ['done', 'active', 'pending'] as const

const fieldStatus = (field: InstallStep, step: InstallStep) => {
  const offset = fieldSteps.indexOf(field) - fieldSteps.indexOf(step)
  return statuses[Math.sign(offset) + 1]
}

// Groups the three provider steps into one "Provider N" block: earlier
// fields show their values, the current one is live, later ones wait.
export const providerPromptViewModel = (props: ProviderPromptProps) => {
  return {
    title: `Provider ${props.providers.length + 1}`,
    nameStatus: fieldStatus('providerName', props.step),
    urlStatus: fieldStatus('providerUrl', props.step),
    credentialsStatus: fieldStatus('providerCredentials', props.step),
  }
}
