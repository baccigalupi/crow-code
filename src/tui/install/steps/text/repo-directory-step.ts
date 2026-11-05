import { PathTextStep } from '../path-text-step.ts'

export class RepoDirectoryStep extends PathTextStep {
  readonly name = 'repoDirectory'
  readonly label = 'What directory for the local repo crow setup'
  readonly next = 'crowGlobalDirectory'
  readonly defaultPath = '.crow'
}
