import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type EscalateReadPromptValues = Pick<StepValues, 'escalateRead'>

export class EscalateReadPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ escalateRead }: EscalateReadPromptValues) {
    this.prompt.update({
      label: 'Escalate read directories',
      input: escalateRead,
      defaultValue: this.defaultValue(),
      bare: true,
    })
  }

  private defaultValue() {
    return JSON.stringify(defaultCrowConfig().permissions.escalateRead)
  }
}
