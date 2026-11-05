import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { ConfigJsonViewModel } from './config-json-view-model.ts'
import { watchHighlight } from './highlight-reveal.ts'
import { Indented } from './indented.tsx'
import { ListField } from './list-field.tsx'
import { StringField } from './string-field.tsx'
import { Providers } from './provider-entry.tsx'

type ConfigJsonProps = { model: DataStore }

// The config json, laid out in its own shape, with the key the current panel
// edits highlighted and scrolled into view each time its value changes.
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
          <StringField
            model={model}
            name="crowGlobalDirectory"
            value={viewModel.value('crowGlobalDirectory')}
          />
          <StringField
            model={model}
            name="envFile"
            value={viewModel.value('envFile')}
          />
          <text>"permissions": {'{'}</text>
          <Indented>
            <ListField
              model={model}
              name="ignore"
              value={viewModel.permission('ignore')}
            />
            <ListField
              model={model}
              name="additionalRead"
              value={viewModel.permission('additionalRead')}
            />
            <ListField
              model={model}
              name="additionalWrite"
              value={viewModel.permission('additionalWrite')}
            />
            <ListField
              model={model}
              name="escalateRead"
              value={viewModel.permission('escalateRead')}
            />
            <ListField
              model={model}
              name="escalateWrite"
              value={viewModel.permission('escalateWrite')}
            />
            <ListField
              model={model}
              name="allowedLocalScripts"
              value={viewModel.permission('allowedLocalScripts')}
              last
            />
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
