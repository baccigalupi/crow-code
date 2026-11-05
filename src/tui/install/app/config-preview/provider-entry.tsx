import type { DataStore } from '../../data-store.ts'
import type { ProviderRow } from '../../types.ts'
import { Field } from './field.tsx'
import { Indented } from './indented.tsx'
import { ProviderEntryViewModel } from './provider-entry-view-model.ts'

type ProviderEntryProps = { store: DataStore; row: ProviderRow }

type ProvidersProps = { store: DataStore; rows: readonly ProviderRow[] }

const LastClosing = () => <text>{'}'}</text>

const MoreClosing = () => <text>{'},'}</text>

const closings = { last: LastClosing, more: MoreClosing }

// { "name": "...", "baseUrl": "..." }
const ProviderEntry = ({ store, row }: ProviderEntryProps) => {
  const view = new ProviderEntryViewModel(row)
  const Closing = closings[view.closing()]
  return (
    <box flexDirection="column">
      <text>{'{'}</text>
      <Indented>
        <Field store={store} name="name" editable={view.editable()}>
          "name": "{view.name()}",
        </Field>
        <Field store={store} name="baseUrl" editable={view.editable()}>
          "baseUrl": "{view.baseUrl()}"
        </Field>
      </Indented>
      <Closing />
    </box>
  )
}

export const Providers = ({ store, rows }: ProvidersProps) => (
  <>
    {rows.map((row) => (
      <ProviderEntry key={row.index} store={store} row={row} />
    ))}
  </>
)
