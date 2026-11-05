import { TextStep } from '../text-step.ts'

export class RepoDirectoryStep extends TextStep {
  readonly name = 'repoDirectory'
  readonly label = 'What directory for the local repo crow setup'
  readonly next = 'crowGlobalDirectory'
}
