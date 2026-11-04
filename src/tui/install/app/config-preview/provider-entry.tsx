import type { ProviderEntryViewModel } from './provider-entry-view-model.ts'
import { Indented, StringField } from './json-rows.tsx'

type ProviderEntryProps = { provider: ProviderEntryViewModel }

// { "name": "...", "baseUrl": "..." },
export const ProviderEntry = ({ provider }: ProviderEntryProps) => (
  <box flexDirection="column">
    <text>{'{'}</text>
    <Indented>
      <StringField field={provider.name()} />
      <StringField field={provider.baseUrl()} />
    </Indented>
    <text>
      {'}'}
      {provider.comma()}
    </text>
  </box>
)
