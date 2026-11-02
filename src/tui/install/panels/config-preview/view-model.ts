import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { highlightJson } from '../../crow-config/highlight.ts'
import type { ConfigPanelValues, PanelHighlights } from '../../types.ts'

// What the config preview shows: where the config goes and its json split
// around the line the current panel edits. Hidden on the first step.
export class ConfigPanelViewModel {
  props(values: ConfigPanelValues, highlights: PanelHighlights) {
    const config = crowConfigFromInputs(values)
    return {
      visible: values.step !== 'repo',
      crowConfigPath: config.crowConfigPath(),
      ...highlightJson({ json: config.crowConfigJson(), ...highlights }),
    }
  }
}
