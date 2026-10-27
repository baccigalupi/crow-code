import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type EscalateWritePromptValues = Pick<StepValues, 'escalateWrite'>

export class EscalateWritePromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ escalateWrite }: EscalateWritePromptValues) {
    this.prompt.update({
      label: 'Escalate write directories',
      input: escalateWrite,
      defaultValue: this.defaultValue(),
    })
  }

  private defaultValue() {
    return defaultCrowConfig().permissions.escalateWrite.join(', ')
  }
}
