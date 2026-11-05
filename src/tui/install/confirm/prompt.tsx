import type { SelectKeyBinding } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { PromptNavigation } from '../interactions/prompt-navigation.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { ConfirmActions } from './actions.ts'
import { confirmPromptViewModel } from './prompt-view-model.ts'

const options = [
  { name: 'Yes', description: '' },
  { name: 'No', description: '' },
]

// Besides the select's own up/down/j/k and return: left and y lean to Yes,
// right and n to No.
const keyBindings: SelectKeyBinding[] = [
  { name: 'left', action: 'move-up' },
  { name: 'y', action: 'move-up' },
  { name: 'right', action: 'move-down' },
  { name: 'n', action: 'move-down' },
]

type ConfirmPromptProps = { store: DataStore }

// "Complete setup?" over a focused Yes/No select; return picks.
export const ConfirmPrompt = ({ store }: ConfirmPromptProps) => {
  const confirmed = useSignalValue(store.confirm.confirmed)
  const viewModel = confirmPromptViewModel(confirmed)
  const actions = new ConfirmActions({
    store,
    navigation: new PromptNavigation(store),
  })
  return (
    <box paddingX={1} flexDirection="column">
      <text>Complete setup?</text>
      <select
        focused
        options={options}
        selectedIndex={viewModel.selectedIndex()}
        keyBindings={keyBindings}
        showDescription={false}
        height={2}
        onChange={actions.change()}
        onSelect={actions.select()}
      />
    </box>
  )
}
