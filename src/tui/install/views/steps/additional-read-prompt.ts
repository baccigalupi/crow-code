import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type AdditionalReadPromptValues = Pick<StepValues, 'additionalRead'>

export class AdditionalReadPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ additionalRead }: AdditionalReadPromptValues) {
    this.prompt.update({
      label: 'Additional read directories',
      input: additionalRead,
      defaultValue: this.defaultValue(),
      bare: true,
    })
  }

  private defaultValue() {
    return JSON.stringify(defaultCrowConfig().permissions.additionalRead)
  }
}
