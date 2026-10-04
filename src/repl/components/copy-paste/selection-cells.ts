import type { CrossContainerSelection } from '@ubernaut/exotui'
import type { Signal } from '@ubernaut/exotui/app'

type SelectionCell = { line: number; column: number }

export class SelectionCells {
  private readonly lines: Signal<string[]>
  private readonly selection: CrossContainerSelection

  constructor(lines: Signal<string[]>, selection: CrossContainerSelection) {
    this.lines = lines
    this.selection = selection
  }

  at(height: number, localX: number, localY: number) {
    return { line: this.lineAt(height, localY), column: Math.max(0, localX) }
  }

  select(from: SelectionCell, to: SelectionCell) {
    const [start, end] = this.order(from, to)
    this.selection.begin(this.point(start.line, start.column))
    this.selection.extend(this.point(end.line, end.column + 1))
  }

  copied(
    anchor: SelectionCell | undefined,
    dragged: boolean,
    focus: SelectionCell,
  ) {
    if (anchor === undefined || !dragged) return ''
    this.select(anchor, focus)
    return this.selection.selectedText()
  }

  private order(first: SelectionCell, second: SelectionCell) {
    if (first.line === second.line && first.column <= second.column) {
      return [first, second]
    } else if (first.line === second.line) {
      return [second, first]
    } else if (first.line < second.line) {
      return [first, second]
    } else return [second, first]
  }

  private lineAt(height: number, localY: number) {
    return Math.max(
      0,
      Math.min(
        this.firstVisible(height) + Math.max(0, localY),
        this.lines.peek().length - 1,
      ),
    )
  }

  private firstVisible(height: number) {
    return Math.max(0, this.lines.peek().length - height)
  }

  private point(line: number, column: number) {
    return { regionId: 'chat', line, column }
  }
}
