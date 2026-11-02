import {
  BoxRenderable,
  TextAttributes,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { SetupProgressView } from '../shared/setup-progress-view.ts'
import type { DoneMessageProps } from '../../types.ts'

// The finished setup tasks, then a dimmed hint to exit.
export class DoneMessageView {
  private renderer: RenderContext
  private progress: SetupProgressView

  constructor(renderer: RenderContext) {
    this.renderer = renderer
    this.progress = new SetupProgressView(renderer)
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, { flexDirection: 'column' })
    box.add(this.progress.root())
    box.add(this.hintBox())
    return box
  }

  update({ hint, rows }: DoneMessageProps) {
    this.progress.update({ rows })
    this.hint().content = hint
  }

  private hintBox() {
    const box = new BoxRenderable(this.renderer, { paddingX: 1 })
    box.add(this.hint())
    return box
  }

  @memoize
  private hint() {
    const attributes = TextAttributes.DIM
    return new TextRenderable(this.renderer, { content: '', attributes })
  }
}
