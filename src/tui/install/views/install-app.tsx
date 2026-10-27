/** @jsxImportSource @opentui/react */
import { useTerminalDimensions } from '@opentui/react'
import { useSignalValue } from '../../use-signal-value.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = ({ model }: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  const inputs = useSignalValue(model.inputs)
  const values = useSignalValue(model.stepValues)
  useKeypress(model)

  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPanel {...inputs} />
      <StepPrompts model={model} values={values} />
    </box>
  )
}
