import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { ConfigJsonViewModel } from './config-json-view-model.ts'
import { Field } from './field.tsx'
import { watchHighlight } from './highlight-reveal.ts'
import { Indented } from './indented.tsx'
import { JsonArray } from './json-array.tsx'
import { Providers } from './provider-entry.tsx'

type ConfigJsonProps = { model: DataStore }

// The config json, written out in its own shape, with the key the current
// panel edits highlighted. A new json remounts it, so the highlight scrolls
// into view again.
export const ConfigJson = ({ model }: ConfigJsonProps) => {
  const inputs = useSignalValue(model.inputs)
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
          <Field model={model} name="crowGlobalDirectory">
            "crowGlobalDirectory": "{viewModel.value('crowGlobalDirectory')}",
          </Field>
          <Field model={model} name="envFile">
            "envFile": "{viewModel.value('envFile')}",
          </Field>
          <text>"permissions": {'{'}</text>
          <Indented>
            <Field model={model} name="ignore">
              "ignore": <JsonArray items={viewModel.permission('ignore')} />,
            </Field>
            <Field model={model} name="additionalRead">
              "additionalRead":{' '}
              <JsonArray items={viewModel.permission('additionalRead')} />,
            </Field>
            <Field model={model} name="additionalWrite">
              "additionalWrite":{' '}
              <JsonArray items={viewModel.permission('additionalWrite')} />,
            </Field>
            <Field model={model} name="escalateRead">
              "escalateRead":{' '}
              <JsonArray items={viewModel.permission('escalateRead')} />,
            </Field>
            <Field model={model} name="escalateWrite">
              "escalateWrite":{' '}
              <JsonArray items={viewModel.permission('escalateWrite')} />,
            </Field>
            <Field model={model} name="allowedLocalScripts">
              "allowedLocalScripts":{' '}
              <JsonArray items={viewModel.permission('allowedLocalScripts')} />
            </Field>
          </Indented>
          <text>{'},'}</text>
          <text>"providers": [</text>
          <Indented>
            <Providers model={model} rows={viewModel.providers()} />
          </Indented>
          <text>]</text>
        </Indented>
        <text>{'}'}</text>
      </box>
    </scrollbox>
  )
}
