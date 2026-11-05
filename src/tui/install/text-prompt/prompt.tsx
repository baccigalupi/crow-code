import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextStepName } from '../types.ts'
import type { InputText } from '../../types.ts'
import { PromptNavigation } from '../interactions/prompt-navigation.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { TextPromptActions } from './actions.ts'
import { promptLineViewModel } from './prompt-line-view-model.ts'
import { textPromptViewModel } from './text-prompt-view-model.ts'

type PromptLineProps = {
  label: string
  input: InputText
  placeholder: string
  masked: boolean
}

// One `label: value` line with a block cursor and the dimmed placeholder.
export const PromptLine = ({
  label,
  input,
  placeholder,
  masked,
}: PromptLineProps) => {
  const viewModel = promptLineViewModel(input, masked)
  return (
    <box paddingX={1}>
      <text>
        {label}: {viewModel.beforeCursor()}
        <span attributes={TextAttributes.DIM}>{placeholder}</span>
        <span attributes={TextAttributes.INVERSE}>{viewModel.atCursor()}</span>
        {viewModel.afterCursor()}
      </text>
    </box>
  )
}

type TextPromptProps = {
  store: DataStore
  step: TextStepName
}

// A one-line question beside a focused input holding its answer.
export const TextPrompt = ({ store, step }: TextPromptProps) => {
  const defaults = useSignalValue(store.textDefaults)
  const input = useSignalValue(store.textFields[step].text)
  const viewModel = textPromptViewModel(step, defaults)
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
        value={input.text}
        placeholder={viewModel.placeholder()}
        onInput={actions.input()}
        onSubmit={actions.submit()}
      />
    </box>
  )
}
