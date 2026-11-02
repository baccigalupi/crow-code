import type { RenderContext } from '@opentui/core'
import { ConfigPanelViewModel } from './config-preview/view-model.ts'
import { ConfigPanelView } from './config-preview/view.ts'

// The config being built; it takes no keys.
export class ConfigPreviewPanel {
  readonly name = 'configPreview'

  viewModel() {
    return new ConfigPanelViewModel()
  }

  view(renderer: RenderContext) {
    return new ConfigPanelView(renderer)
  }
}
