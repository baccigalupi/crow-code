import { TextStep } from '../text-step.ts'

export class EscalateWriteStep extends TextStep {
  readonly name = 'escalateWrite'
  readonly label = 'Escalate write directories'
  readonly next = 'allowedLocalScripts'
}
