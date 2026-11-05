import { TextStep } from '../text-step.ts'

export class CrowGlobalDirectoryStep extends TextStep {
  readonly name = 'crowGlobalDirectory'
  readonly label = 'User crow directory'
  readonly next = 'envFile'
}
