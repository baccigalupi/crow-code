import type { DataStore } from '../../data-store.ts'
import type { Router } from '../../router.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { ConfigJsonViewModel } from './config-json-view-model.ts'
import { watchHighlight } from './highlight-reveal.ts'
import { Indented, ListField, StringField } from './json-rows.tsx'
import { Providers } from './provider-entry.tsx'

type ConfigJsonProps = {
  model: DataStore
  router: Router
}

// The config json, laid out in its own shape, with the key the current panel
// edits highlighted and scrolled into view each time the json changes.
export const ConfigJson = ({ model, router }: ConfigJsonProps) => {
  const inputs = useSignalValue(model.inputs)
  const panel = router.get(useSignalValue(model.navigator.current))
  const viewModel = new ConfigJsonViewModel(inputs, panel.highlights)
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
          <StringField field={viewModel.stringField('crowGlobalDirectory')} />
          <StringField field={viewModel.stringField('envFile')} />
          <text>"permissions": {'{'}</text>
          <Indented>
            <ListField field={viewModel.listField('ignore')} />
            <ListField field={viewModel.listField('additionalRead')} />
            <ListField field={viewModel.listField('additionalWrite')} />
            <ListField field={viewModel.listField('escalateRead')} />
            <ListField field={viewModel.listField('escalateWrite')} />
            <ListField field={viewModel.lastListField('allowedLocalScripts')} />
          </Indented>
          <text>{'},'}</text>
          <text>"providers": [</text>
          <Indented>
            <Providers providers={viewModel.providers()} />
          </Indented>
          <text>]</text>
        </Indented>
        <text>{'}'}</text>
      </box>
    </scrollbox>
  )
}
