import type { DataStore } from '../../data-store.ts'
import type { ProviderRow } from '../../types.ts'
import { Indented } from './indented.tsx'
import { StringField } from './string-field.tsx'
import { ProviderEntryViewModel } from './provider-entry-view-model.ts'

type ProviderEntryProps = { model: DataStore; row: ProviderRow }

type ProvidersProps = { model: DataStore; rows: readonly ProviderRow[] }

// { "name": "...", "baseUrl": "..." },
const ProviderEntry = ({ model, row }: ProviderEntryProps) => {
  const view = new ProviderEntryViewModel(row)
  return (
    <box flexDirection="column">
      <text>{'{'}</text>
      <Indented>
        <StringField
          model={model}
          name="name"
          value={view.name()}
          editable={view.editable()}
        />
        <StringField
          model={model}
          name="baseUrl"
          value={view.baseUrl()}
          editable={view.editable()}
          last
        />
      </Indented>
      <text>
        {'}'}
        {view.comma()}
      </text>
    </box>
  )
}

export const Providers = ({ model, rows }: ProvidersProps) => (
  <>
    {rows.map((row) => (
      <ProviderEntry key={row.index} model={model} row={row} />
    ))}
  </>
)
