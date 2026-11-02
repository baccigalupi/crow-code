import {
  BoxRenderable,
  TextAttributes,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { ProviderFieldView } from './field-view.ts'
import type { ProviderPromptProps } from '../../types.ts'

// The provider fields as one titled block over an escape hint.
export class ProviderPromptView {
  private renderer: RenderContext
  private readonly fieldCount = 3

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const column = new BoxRenderable(this.renderer, { flexDirection: 'column' })
    column.add(this.box())
    column.add(this.hint())
    return column
  }

  update({ title, fields }: ProviderPromptProps) {
    this.box().title = title
    this.fieldViews().forEach((view, index) => view.update(fields[index]))
  }

  @memoize
  private box() {
    const options = { border: true, flexDirection: 'column' } as const
    const box = new BoxRenderable(this.renderer, options)
    this.fieldViews().forEach((view) => box.add(view.root()))
    return box
  }

  @memoize
  private fieldViews() {
    return Array.from(
      { length: this.fieldCount },
      () => new ProviderFieldView(this.renderer),
    )
  }

  private hint() {
    const content = 'Esc to finish adding providers'
    const attributes = TextAttributes.DIM
    const box = new BoxRenderable(this.renderer, { paddingX: 1 })
    box.add(new TextRenderable(this.renderer, { content, attributes }))
    return box
  }
}
