import {
  createCrossContainerSelection,
  type CrossContainerSelection,
  type LogViewer,
  type MouseInteractionContext,
  type MousePressEvent,
} from '@ubernaut/exotui'
import type { Signal } from '@ubernaut/exotui/app'
import { writeClipboard } from './clipboard.ts'
import type { App } from '../../types.ts'
import { SelectionCells } from './selection-cells.ts'

type SelectionCell = { line: number; column: number }

export class ChatSelection {
  private readonly app: App
  private readonly view: LogViewer
  private readonly lines: Signal<string[]>
  private readonly selection: CrossContainerSelection
  private readonly cells: SelectionCells
  private anchor: SelectionCell | undefined
  private dragged = false

  constructor(app: App, view: LogViewer, lines: Signal<string[]>) {
    this.app = app
    this.view = view
    this.lines = lines
    this.selection = createCrossContainerSelection()
    this.cells = new SelectionCells(lines, this.selection)
  }

  register() {
    const unregisterRegion = this.selection.register(this.region)
    const unregisterTarget = this.app.mouse.register(this.target())
    return () => {
      unregisterTarget()
      unregisterRegion()
    }
  }

  private readonly region = {
    id: 'chat',
    order: 0,
    lines: () => this.lines.peek(),
  }

  private readonly target = () => ({
    id: 'chat',
    bounds: () => this.view.rectangle.peek(),
    zIndex: () => this.view.zIndex.peek(),
    onPress: this.press.bind(this),
    onDrag: this.drag.bind(this),
    onRelease: this.release.bind(this),
  })

  private press(_event: MousePressEvent, context: MouseInteractionContext) {
    this.anchor = this.cell(context)
    this.dragged = false
  }

  private drag(_event: MousePressEvent, context: MouseInteractionContext) {
    if (this.anchor === undefined) return
    this.dragged = true
    this.cells.select(this.anchor, this.cell(context))
  }

  private release(_event: MousePressEvent, context: MouseInteractionContext) {
    const focus = this.cell(context)
    const text = this.cells.copied(this.anchor, this.dragged, focus)
    this.anchor = undefined
    this.dragged = false
    this.selection.clear()
    void writeClipboard(this.app, text)
  }

  private cell(context: MouseInteractionContext) {
    return this.cells.at(
      context.bounds.height,
      context.localX,
      context.localY,
    )
  }
}
