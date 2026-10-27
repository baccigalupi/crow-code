import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowConfig } from '../../../../domain/config.ts'
import type { StepValues } from '../../types.ts'

type AllowedLocalScriptsPromptValues = Pick<StepValues, 'allowedLocalScripts'>

export class AllowedLocalScriptsPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ allowedLocalScripts }: AllowedLocalScriptsPromptValues) {
    this.prompt.update({
      label: 'Allowed local scripts',
      input: allowedLocalScripts,
      defaultValue: this.defaultValue(),
    })
  }

  private defaultValue() {
    return defaultCrowConfig().permissions.allowedLocalScripts.join(', ')
  }
}
