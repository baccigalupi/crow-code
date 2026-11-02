import type { InstallProvider, PanelName, ProviderInputs } from '../../types.ts'

const providerConfig = ({ name, url }: InstallProvider) => {
  return { name, baseUrl: url }
}

const providerSteps: readonly (PanelName | undefined)[] = [
  'providerName',
  'providerUrl',
  'providerCredentials',
]

// While on a provider step a new record is open, even when still blank, so
// the preview never makes a finished provider look like it is being edited.
const draftProviders = ({
  providerName,
  providerUrl,
  step,
}: ProviderInputs) => {
  if (!providerSteps.includes(step)) return []
  return [{ name: providerName.text, url: providerUrl.text }]
}

// Finished providers plus the one being typed, shaped for config.json.
export const buildProviders = (providerInputs: ProviderInputs) => {
  return [...providerInputs.providers, ...draftProviders(providerInputs)].map(
    providerConfig,
  )
}
