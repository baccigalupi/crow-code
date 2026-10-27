import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowGlobalDirectory } from '../../data-stores/directories-store.ts'
import type { StepValues } from '../../types.ts'

type GlobalPathPromptValues = Pick<StepValues, 'globalDirectory'>

export class GlobalPathPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ globalDirectory }: GlobalPathPromptValues) {
    this.prompt.update({
      label: 'User crow directory',
      input: globalDirectory,
      defaultValue: defaultCrowGlobalDirectory,
    })
  }
}
