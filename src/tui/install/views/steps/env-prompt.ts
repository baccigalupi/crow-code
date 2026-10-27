import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import type { CrowConfigInputs } from '../../types.ts'

export class EnvPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update(values: CrowConfigInputs) {
    this.prompt.update({
      label: 'Credentials .env file',
      input: values.envFile,
      defaultValue: crowConfigFromInputs(values).crowConfig().envFile,
    })
  }
}
