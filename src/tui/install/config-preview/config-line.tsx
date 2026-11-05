import type { ReactNode } from 'react'
import { configLineViewModel } from './config-line-view-model.ts'

type ConfigLineProps = {
  selectedStep: string
  step: string
  editable?: boolean
  children?: ReactNode
}

// The one line the scroll looks for.
const HighlightedLine = (props: ConfigLineProps) => {
  const viewModel = configLineViewModel(props)
  return (
    <text id="config-highlight">
      <span fg={viewModel.textColor} bg={viewModel.background}>
        {props.children}
      </span>
    </text>
  )
}

// One config line, highlighted when the selected step is the step that edits
// it.
export const ConfigLine = (props: ConfigLineProps) => {
  if (configLineViewModel(props).highlighted()) {
    return <HighlightedLine {...props} />
  }

  return <text>{props.children}</text>
}
