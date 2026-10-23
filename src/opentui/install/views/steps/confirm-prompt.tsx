/** @jsxImportSource @opentui/react */
import { confirmPromptViewModel } from './confirm-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type ConfirmPromptProps = Pick<StepValues, 'crowConfigPath' | 'confirmation'>

export const ConfirmPrompt = ({
  crowConfigPath,
  confirmation,
}: ConfirmPromptProps) => {
  const { options, selectedIndex } = confirmPromptViewModel({ confirmation })
  return (
    <box paddingX={1} flexDirection="column">
      <text>Write config to {crowConfigPath}?</text>
      <select
        focused
        options={options}
        selectedIndex={selectedIndex}
        showDescription={false}
        height={2}
      />
    </box>
  )
}
