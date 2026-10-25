import type { InstallStep, ProviderPromptProps } from '../../types.ts'

const fieldDefinitions = [
  { id: 'providerName', label: 'Name', masked: false },
  { id: 'providerUrl', label: 'Url', masked: false },
  { id: 'providerCredentials', label: 'API key', masked: true },
] as const

const fieldSteps: readonly InstallStep[] = fieldDefinitions.map(({ id }) => id)

const statuses = ['done', 'active', 'pending'] as const

const fieldStatus = (field: InstallStep, step: InstallStep) => {
  const offset = fieldSteps.indexOf(field) - fieldSteps.indexOf(step)
  return statuses[Math.sign(offset) + 1]
}

const fields = (props: ProviderPromptProps) => {
  return fieldDefinitions.map((field) => ({
    ...field,
    input: props[field.id],
    status: fieldStatus(field.id, props.step),
  }))
}

// Groups the three provider steps into one "Provider N" block: earlier
// fields show their values, the current one is live, later ones wait.
export const providerPromptViewModel = (props: ProviderPromptProps) => {
  return {
    title: `Provider ${props.providers.length + 1}`,
    fields: fields(props),
  }
}
