import type { DataStore } from '../data-store.ts'
import type { TextStepName } from '../types.ts'
import { PromptNavigation } from '../interactions/prompt-navigation.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { TextPromptActions } from '../interactions/handlers/text-prompt-actions.ts'
import { textPromptViewModel } from './text-prompt-view-model.ts'

type TextPromptProps = {
  store: DataStore
  step: TextStepName
}

// A one-line question beside a focused input holding its answer.
export const TextPrompt = ({ store, step }: TextPromptProps) => {
  const input = useSignalValue(store.textFields[step].text)
  const viewModel = textPromptViewModel(step, store)
  const actions = new TextPromptActions({
    step,
    store,
    navigation: new PromptNavigation(store),
  })
  return (
    <box paddingX={1} flexDirection="row">
      <text>{viewModel.label()}: </text>
      <input
        focused
        flexGrow={1}
        value={input}
        placeholder={viewModel.placeholder()}
        onInput={actions.input()}
        onSubmit={actions.submit()}
      />
    </box>
  )
}
