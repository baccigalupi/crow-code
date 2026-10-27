import {
  BoxRenderable,
  SelectRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import type { StepValues } from '../../types.ts'

type ConfirmPromptValues = Pick<StepValues, 'confirmation'>

// "Complete setup?" over a focused Yes/No select.
export class ConfirmPromptView {
  private renderer: RenderContext
  private readonly options = [
    { name: 'Yes', description: '' },
    { name: 'No', description: '' },
  ]

  constructor(renderer: RenderContext) {
    this.renderer = renderer
  }

  @memoize
  root() {
    const options = { paddingX: 1, flexDirection: 'column' } as const
    const box = new BoxRenderable(this.renderer, options)
    box.add(new TextRenderable(this.renderer, { content: 'Complete setup?' }))
    box.add(this.select())
    return box
  }

  update(values: ConfirmPromptValues) {
    this.select().setSelectedIndex(this.selectedIndex(values))
  }

  private selectedIndex({ confirmation }: ConfirmPromptValues) {
    if (confirmation) {
      return 0
    } else {
      return 1
    }
  }

  @memoize
  private select() {
    const { options } = this
    const settings = { options, showDescription: false, height: 2 }
    const select = new SelectRenderable(this.renderer, settings)
    select.focus()
    return select
  }
}
