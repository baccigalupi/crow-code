import type { DataStore } from '../data-store.ts'
import type { Router } from '../router.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { ConfigPreviewViewModel } from './config-preview-view-model.ts'
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
  const visible = useSignalValue(model.showsConfig)
  const viewModel = new ConfigPreviewViewModel(inputs)
  return (
    <box
      visible={visible}
      flexDirection="column"
      paddingX={1}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
    >
      <text flexShrink={0}>{viewModel.pathLine()}</text>
      <ConfigJson model={model} router={router} />
    </box>
  )
}
