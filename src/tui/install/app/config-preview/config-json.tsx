import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../interactions/use-signal-value.ts'
import { configJsonViewModel } from './config-json-view-model.ts'
import { ConfigLine } from './config-line.tsx'
import { watchHighlight } from './highlight-reveal.ts'
import { Indented } from './indented.tsx'
import { Providers } from './provider-entry.tsx'

type ConfigJsonProps = { store: DataStore }

// The config json, written out in its own shape, with the key the current
// panel edits highlighted. A new json or highlight remounts the scrollbox,
// which scrolls the highlighted line into view once.
export const ConfigJson = ({ store }: ConfigJsonProps) => {
  const inputs = useSignalValue(store.inputs)
  const selectedStep = useSignalValue(store.navigator.current)
  const viewModel = configJsonViewModel(inputs, selectedStep)
  return (
    <scrollbox
      key={viewModel.key()}
      id="config-json"
      ref={watchHighlight}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
    >
      <box
        flexDirection="column"
        alignSelf="flex-start"
        flexShrink={0}
        backgroundColor={viewModel.background}
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <text>{'{'}</text>
        <Indented>
          <ConfigLine selectedStep={selectedStep} step="crowGlobalDirectory">
            "crowGlobalDirectory": "{viewModel.crowGlobalDirectory()}",
          </ConfigLine>
          <ConfigLine selectedStep={selectedStep} step="envFile">
            "envFile": "{viewModel.envFile()}",
          </ConfigLine>
          <text>"permissions": {'{'}</text>
          <Indented>
            <ConfigLine selectedStep={selectedStep} step="ignore">
              "ignore": {viewModel.ignore()},
            </ConfigLine>
            <ConfigLine selectedStep={selectedStep} step="additionalRead">
              "additionalRead": {viewModel.additionalRead()},
            </ConfigLine>
            <ConfigLine selectedStep={selectedStep} step="additionalWrite">
              "additionalWrite": {viewModel.additionalWrite()},
            </ConfigLine>
            <ConfigLine selectedStep={selectedStep} step="escalateRead">
              "escalateRead": {viewModel.escalateRead()},
            </ConfigLine>
            <ConfigLine selectedStep={selectedStep} step="escalateWrite">
              "escalateWrite": {viewModel.escalateWrite()},
            </ConfigLine>
            <ConfigLine selectedStep={selectedStep} step="allowedLocalScripts">
              "allowedLocalScripts": {viewModel.allowedLocalScripts()}
            </ConfigLine>
          </Indented>
          <text>{'},'}</text>
          <text>"providers": [</text>
          <Indented>
            <Providers
              selectedStep={selectedStep}
              rows={viewModel.providers()}
            />
          </Indented>
          <text>]</text>
        </Indented>
        <text>{'}'}</text>
      </box>
    </scrollbox>
  )
}
