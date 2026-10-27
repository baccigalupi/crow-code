import { BoxRenderable, type RenderContext } from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { SetupProgressRowView } from './setup-progress-row.ts'
import type { SetupProgressProps, SetupTaskStatus } from '../../types.ts'

// The setup tasks, one retained row per task.
export class SetupProgressView {
  private renderer: RenderContext
  private rows = new Map<string, SetupProgressRowView>()

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const options = { flexDirection: 'column', paddingX: 1 } as const
    return new BoxRenderable(this.renderer, options)
  }

  update({ setupTasks }: SetupProgressProps) {
    const active = this.activeIndex(setupTasks)
    setupTasks.forEach((task, index) =>
      this.row(task.id).update({
        ...task,
        indicator: this.indicator(task, index === active),
      }),
    )
  }

  // The first unfinished task is running, unless one has already failed.
  private activeIndex(setupTasks: readonly SetupTaskStatus[]) {
    if (setupTasks.some((task) => task.error)) return -1

    return setupTasks.findIndex((task) => !task.done)
  }

  private indicator(task: SetupTaskStatus, isActive: boolean) {
    if (task.error) {
      return '✗'
    } else if (task.done) {
      return '✓'
    } else {
      return this.pendingIndicator(isActive)
    }
  }

  private pendingIndicator(isActive: boolean) {
    if (isActive) {
      return '›'
    } else {
      return ' '
    }
  }

  private row(id: string) {
    return this.rows.get(id) || this.addRow(id)
  }

  private addRow(id: string) {
    const row = new SetupProgressRowView(this.renderer)
    this.rows.set(id, row)
    this.root().add(row.root())
    return row
  }
}
