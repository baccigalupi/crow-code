import type { DataStore } from '../data-store.ts'
import type { Panels } from '../panels.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import { highlightJson } from '../crow-config/highlight.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { ConfigJson } from './config-json.tsx'

type ConfigPreviewProps = {
  model: DataStore
  panels: Panels
}

// The crow config being built, with the line the current panel edits
// highlighted. Hidden on the first question. Shrinks to the rows the prompt
// leaves, scrolling the json.
export const ConfigPreview = ({ model, panels }: ConfigPreviewProps) => {
  const inputs = useSignalValue(model.inputs)
  const current = useSignalValue(model.navigator.current)
  if (current === 'repo') return null
  const config = crowConfigFromInputs(inputs)
  const json = config.crowConfigJson()
  const sections = highlightJson({ json, ...panels.get(current).highlights })
  return (
    <box
      flexDirection="column"
      paddingX={1}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
    >
      <text flexShrink={0}>
        {`Installing repo config in: ${config.crowConfigPath()}`}
      </text>
      <ConfigJson {...sections} />
    </box>
  )
}
