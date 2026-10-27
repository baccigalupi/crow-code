import {
  BoxRenderable,
  TextAttributes,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { ProviderFieldView } from './provider-field.ts'
import type {
  ProviderFieldDefinition,
  ProviderPromptProps,
} from '../../types.ts'

// The three provider steps as one "Provider N" block over an escape hint.
export class ProviderPromptView {
  private renderer: RenderContext
  private readonly definitions: readonly ProviderFieldDefinition[] = [
    { label: 'Name', input: 'providerName', masked: false },
    { label: 'Url', input: 'providerUrl', masked: false },
    { label: 'API key', input: 'providerCredentials', masked: true },
  ]

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

  update(values: ProviderPromptProps) {
    this.box().title = `Provider ${values.providers.length + 1}`
    this.fields().forEach((field) => field.update(values))
  }

  @memoize
  private box() {
    const options = { border: true, flexDirection: 'column' } as const
    const box = new BoxRenderable(this.renderer, options)
    this.fields().forEach((field) => box.add(field.root()))
    return box
  }

  @memoize
  private fields() {
    return this.definitions.map(
      (definition) => new ProviderFieldView(this.renderer, definition),
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
