import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { PanelHighlights } from '../types.ts'
import { ConfigPanelViewModel } from './config-preview/view-model.ts'
import { ConfigPanelView } from './config-preview/view.ts'

// The config being built; it takes no keys.
export class ConfigPreviewPanel {
  readonly name = 'configPreview'

  props(store: DataStore, highlights: PanelHighlights) {
    return new ConfigPanelViewModel().props(store.inputs.value, highlights)
  }

  view(renderer: RenderContext) {
    return new ConfigPanelView(renderer)
  }
}
