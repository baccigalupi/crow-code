import {
  BoxRenderable,
  TextAttributes,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { SetupProgressView } from './setup-progress.ts'
import type { SetupProgressProps } from '../../types.ts'

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

  update(values: SetupProgressProps) {
    this.progress.update(values)
    this.hint().content = this.exitMessage(values)
  }

  private exitMessage({ setupTasks }: SetupProgressProps) {
    if (setupTasks.some((task) => task.error)) {
      return 'Setup failed. Press any key to exit'
    } else {
      return 'Done! Press any key to exit'
    }
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
