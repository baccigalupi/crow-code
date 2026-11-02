import { BoxRenderable, type RenderContext } from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { SetupProgressRowView } from './setup-progress-row-view.ts'
import type { SetupProgressProps } from '../../types.ts'

// The setup rows, one retained row view per task.
export class SetupProgressView {
  private renderer: RenderContext
  private rowViews = new Map<string, SetupProgressRowView>()

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const options = { flexDirection: 'column', paddingX: 1 } as const
    return new BoxRenderable(this.renderer, options)
  }

  update({ rows }: SetupProgressProps) {
    rows.forEach((row) => this.rowView(row.id).update(row))
  }

  private rowView(id: string) {
    return this.rowViews.get(id) || this.addRowView(id)
  }

  private addRowView(id: string) {
    const rowView = new SetupProgressRowView(this.renderer)
    this.rowViews.set(id, rowView)
    this.root().add(rowView.root())
    return rowView
  }
}
