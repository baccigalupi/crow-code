import {
  BoxRenderable,
  TextRenderable,
  dim,
  t,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { PromptView } from '../shared/prompt-view.ts'
import type { ProviderFieldProps } from '../../types.ts'

// One row of the provider block. Done fields show their values, the active
// one is live, pending ones show only their label.
export class ProviderFieldView {
  private renderer: RenderContext
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.renderer = renderer
    this.prompt = new PromptView(renderer)
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, { paddingX: 1 })
    box.add(this.text())
    return box
  }

  update(field: ProviderFieldProps) {
    this.text().content = this.content(field)
  }

  private content(field: ProviderFieldProps) {
    if (field.status === 'done') {
      return t`${field.label}: ${field.input.text}`
    } else if (field.status === 'active') {
      return this.prompt.content({ ...field, defaultValue: '', bare: true })
    } else {
      return t`${dim(`${field.label}:`)}`
    }
  }

  @memoize
  private text() {
    return new TextRenderable(this.renderer, { content: '' })
  }
}
