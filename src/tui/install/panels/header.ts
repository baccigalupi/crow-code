import type { RenderContext } from '@opentui/core'
import { HeaderView } from './header/view.ts'

// The title bar; it takes no keys.
export class HeaderPanel {
  readonly name = 'header'

  view(renderer: RenderContext) {
    return new HeaderView(renderer)
  }
}
