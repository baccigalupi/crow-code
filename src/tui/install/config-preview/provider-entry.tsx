import type { ProviderRow } from '../types.ts'
import { ConfigLine } from './config-line.tsx'
import { Indented } from './indented.tsx'
import { providerEntryViewModel } from './provider-entry-view-model.ts'

type ProviderEntryProps = { selectedStep: string; row: ProviderRow }

type ProvidersProps = { selectedStep: string; rows: readonly ProviderRow[] }

type ClosingProps = { last: boolean }

// The entry's closing brace, with a comma when more providers follow.
const Closing = ({ last }: ClosingProps) => {
  if (last) return <text>{'}'}</text>

  return <text>{'},'}</text>
}

// { "name": "...", "baseUrl": "..." }
const ProviderEntry = ({ selectedStep, row }: ProviderEntryProps) => {
  const viewModel = providerEntryViewModel(row)
  return (
    <box flexDirection="column">
      <text>{'{'}</text>
      <Indented>
        <ConfigLine
          selectedStep={selectedStep}
          step="providerName"
          editable={viewModel.editable()}
        >
          "name": "{viewModel.name()}",
        </ConfigLine>
        <ConfigLine
          selectedStep={selectedStep}
          step="providerUrl"
          editable={viewModel.editable()}
        >
          "baseUrl": "{viewModel.baseUrl()}"
        </ConfigLine>
      </Indented>
      <Closing last={viewModel.last()} />
    </box>
  )
}

export const Providers = ({ selectedStep, rows }: ProvidersProps) => (
  <>
    {rows.map((row) => (
      <ProviderEntry key={row.index} selectedStep={selectedStep} row={row} />
    ))}
  </>
)
