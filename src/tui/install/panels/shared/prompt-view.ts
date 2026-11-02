import {
  BoxRenderable,
  TextRenderable,
  dim,
  reverse,
  t,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import type { InputText } from '../../../types.ts'

type PromptValues = {
  readonly label: string
  readonly input: InputText
  readonly defaultValue: string
  readonly bare?: boolean
  readonly masked?: boolean
}

// One `label: value` line with a block cursor; the default shows dimmed
// until something is typed.
export class PromptView {
  private renderer: RenderContext
  private readonly maskCharacter = '•'

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, { paddingX: 1 })
    box.add(this.text())
    return box
  }

  update(values: PromptValues) {
    this.text().content = this.content(values)
  }

  content(values: PromptValues) {
    const { before, cursor, after } = this.aroundCursor(this.shownText(values))
    const defaultValue = this.defaultValueChunk(values)
    return t`${values.label}: ${before}${defaultValue}${reverse(cursor)}${after}`
  }

  // Masked inputs show only bullets.
  private shownText({ input, masked }: PromptValues) {
    if (!masked) return input
    return { ...input, text: this.maskCharacter.repeat(input.text.length) }
  }

  // Splits the text around the character under the cursor.
  private aroundCursor(input: InputText) {
    return {
      before: input.text.slice(0, input.cursor),
      cursor: this.cursorCharacter(input),
      after: input.text.slice(input.cursor + 1),
    }
  }

  private cursorCharacter(input: InputText) {
    if (input.cursor >= input.text.length) return ' '
    return input.text.charAt(input.cursor)
  }

  private defaultValueChunk({ input, defaultValue, bare }: PromptValues) {
    if (input.text.length !== 0) {
      return ''
    } else if (bare) {
      return dim(defaultValue)
    } else {
      return dim(`(${defaultValue})`)
    }
  }

  @memoize
  private text() {
    return new TextRenderable(this.renderer, { content: '' })
  }
}
