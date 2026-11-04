import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../../use-signal-value.ts'

const options = [
  { name: 'Yes', description: '' },
  { name: 'No', description: '' },
]

type ConfirmPromptProps = { model: DataStore }

// "Complete setup?" over a focused Yes/No select. The store holds the answer;
// the select only shows it.
export const ConfirmPrompt = ({ model }: ConfirmPromptProps) => {
  const confirmed = useSignalValue(model.confirm.confirmed)
  return (
    <box paddingX={1} flexDirection="column">
      <text>Complete setup?</text>
      <select
        focused
        options={options}
        selectedIndex={confirmed ? 0 : 1}
        showDescription={false}
        height={2}
      />
    </box>
  )
}
