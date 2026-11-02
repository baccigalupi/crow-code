import {
  BoxRenderable,
  TextAttributes,
  TextRenderable,
  dim,
  fg,
  t,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { theme } from '../../../theme.ts'
import type { SetupProgressRow } from '../../types.ts'

// One task line, with its failure reason dimmed beneath when it failed.
export class SetupProgressRowView {
  private renderer: RenderContext
  private readonly colors = theme.setupProgress

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, { flexDirection: 'column' })
    box.add(this.line())
    box.add(this.reasonBox())
    return box
  }

  update(row: SetupProgressRow) {
    this.line().content = this.lineContent(row)
    this.reasonBox().visible = row.error !== ''
    this.reason().content = row.error
  }

  private lineContent({ indicator, label, done, error }: SetupProgressRow) {
    if (error) {
      return t`${fg(this.colors.failedColor)(indicator)} ${label}`
    } else if (done) {
      return t`${fg(this.colors.completeColor)(indicator)}${dim(` ${label}`)}`
    } else {
      return t`${indicator} ${label}`
    }
  }

  @memoize
  private line() {
    return new TextRenderable(this.renderer, { content: '' })
  }

  @memoize
  private reasonBox() {
    const box = new BoxRenderable(this.renderer, { paddingLeft: 2 })
    box.add(this.reason())
    return box
  }

  @memoize
  private reason() {
    const attributes = TextAttributes.DIM
    return new TextRenderable(this.renderer, { content: '', attributes })
  }
}
