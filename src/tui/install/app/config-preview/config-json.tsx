import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { ConfigJsonViewModel } from './config-json-view-model.ts'
import { Field } from './field.tsx'
import { watchHighlight } from './highlight-reveal.ts'
import { Indented } from './indented.tsx'
import { Providers } from './provider-entry.tsx'

type ConfigJsonProps = { store: DataStore }

// The config json, written out in its own shape, with the key the current
// panel edits highlighted. A new json remounts it, so the highlight scrolls
// into view again.
export const ConfigJson = ({ store }: ConfigJsonProps) => {
  const inputs = useSignalValue(store.inputs)
  const viewModel = new ConfigJsonViewModel(inputs)
  return (
    <scrollbox
      id="config-json"
      ref={watchHighlight}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
    >
      <box
        key={viewModel.json()}
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
          <Field store={store} name="crowGlobalDirectory">
            "crowGlobalDirectory": "{viewModel.crowGlobalDirectory()}",
          </Field>
          <Field store={store} name="envFile">
            "envFile": "{viewModel.envFile()}",
          </Field>
          <text>"permissions": {'{'}</text>
          <Indented>
            <Field store={store} name="ignore">
              "ignore": {viewModel.ignore()},
            </Field>
            <Field store={store} name="additionalRead">
              "additionalRead": {viewModel.additionalRead()},
            </Field>
            <Field store={store} name="additionalWrite">
              "additionalWrite": {viewModel.additionalWrite()},
            </Field>
            <Field store={store} name="escalateRead">
              "escalateRead": {viewModel.escalateRead()},
            </Field>
            <Field store={store} name="escalateWrite">
              "escalateWrite": {viewModel.escalateWrite()},
            </Field>
            <Field store={store} name="allowedLocalScripts">
              "allowedLocalScripts": {viewModel.allowedLocalScripts()}
            </Field>
          </Indented>
          <text>{'},'}</text>
          <text>"providers": [</text>
          <Indented>
            <Providers store={store} rows={viewModel.providers()} />
          </Indented>
          <text>]</text>
        </Indented>
        <text>{'}'}</text>
      </box>
    </scrollbox>
  )
}
