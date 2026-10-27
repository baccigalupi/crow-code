import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type IgnorePromptValues = Pick<StepValues, 'ignore'>

export class IgnorePromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ ignore }: IgnorePromptValues) {
    this.prompt.update({
      label: 'Ignored paths',
      input: ignore,
      defaultValue: this.defaultValue(),
      bare: true,
    })
  }

  private defaultValue() {
    return JSON.stringify(defaultCrowConfig().permissions.ignore)
  }
}
