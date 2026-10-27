import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type AdditionalWritePromptValues = Pick<StepValues, 'additionalWrite'>

export class AdditionalWritePromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ additionalWrite }: AdditionalWritePromptValues) {
    this.prompt.update({
      label: 'Additional write directories',
      input: additionalWrite,
      defaultValue: this.defaultValue(),
      bare: true,
    })
  }

  private defaultValue() {
    return JSON.stringify(defaultCrowConfig().permissions.additionalWrite)
  }
}
