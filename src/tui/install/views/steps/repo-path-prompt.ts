import type { RenderContext } from '@opentui/core'
import { PromptView } from '../prompt.ts'
import { defaultCrowRepoDirectory } from '../../data-stores/directories-store.ts'
import type { StepValues } from '../../types.ts'

type RepoPathPromptValues = Pick<StepValues, 'repoDirectory'>

export class RepoPathPromptView {
  private prompt: PromptView

  constructor(renderer: RenderContext) {
    this.prompt = new PromptView(renderer)
  }

  root() {
    return this.prompt.root()
  }

  update({ repoDirectory }: RepoPathPromptValues) {
    this.prompt.update({
      label: 'What directory for the local repo crow setup',
      input: repoDirectory,
      defaultValue: defaultCrowRepoDirectory,
    })
  }
}
