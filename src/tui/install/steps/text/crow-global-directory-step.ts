import { PathTextStep } from '../path-text-step.ts'

export class CrowGlobalDirectoryStep extends PathTextStep {
  readonly name = 'crowGlobalDirectory'
  readonly label = 'User crow directory'
  readonly next = 'envFile'
  readonly defaultPath = '~/.crow'
}
