import type { DataStore } from '../../data-store.ts'
import type { Router } from '../../router.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { ConfigJsonViewModel } from './config-json-view-model.ts'
import { watchHighlight } from './highlight-reveal.ts'

type ConfigJsonProps = {
  model: DataStore
  router: Router
}

// The config json in the rows it is given, scrolled to the line the current
// panel edits each time the json changes. The marker, rebuilt with every new
// json, is what HighlightReveal scrolls into view.
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
        paddingY={viewModel.paddingY}
        marginTop={1}
      >
        <box
          key={viewModel.key()}
          id="config-highlight"
          position="absolute"
          top={viewModel.markerRow()}
          height={1}
          width={1}
        />
        <text flexShrink={0} height={viewModel.lineCount()}>
          {viewModel.before()}
          <span
            fg={viewModel.highlightTextColor}
            bg={viewModel.highlightBackground}
          >
            {viewModel.highlighted()}
          </span>
          {viewModel.after()}
        </text>
      </box>
    </scrollbox>
  )
}
