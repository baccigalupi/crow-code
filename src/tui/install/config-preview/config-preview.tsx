import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { ConfigJson } from './config-json.tsx'

type ConfigPreviewProps = { store: DataStore }

// The crow config being built, with the line the current panel edits
// highlighted. Hidden on the first question. Shrinks to the rows the prompt
// leaves, scrolling the json.
export const ConfigPreview = ({ store }: ConfigPreviewProps) => {
  const path = useSignalValue(store.directories.configPath)
  const visible = useSignalValue(store.showsConfig)
  return (
    <box
      visible={visible}
      flexDirection="column"
      paddingX={1}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
    >
      <text flexShrink={0}>Installing repo config in: {path}</text>
      <ConfigJson store={store} />
    </box>
  )
}
