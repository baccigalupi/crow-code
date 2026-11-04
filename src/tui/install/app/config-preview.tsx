import type { DataStore } from '../data-store.ts'
import type { Router } from '../router.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import { highlightJson } from './config-preview/highlight.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { ConfigJson } from './config-preview/config-json.tsx'

type ConfigPreviewProps = {
  model: DataStore
  router: Router
}

// The crow config being built, with the line the current panel edits
// highlighted. Hidden on the first question. Shrinks to the rows the prompt
// leaves, scrolling the json.
export const ConfigPreview = ({ model, router }: ConfigPreviewProps) => {
  const inputs = useSignalValue(model.inputs)
  const current = useSignalValue(model.navigator.current)
  const visible = useSignalValue(model.showsConfig)
  const config = crowConfigFromInputs(inputs)
  const json = config.crowConfigJson()
  const sections = highlightJson({ json, ...router.get(current).highlights })
  return (
    <box
      visible={visible}
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
