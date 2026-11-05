import { defaultCrowConfig } from '../../../../domain/config.ts'
import { TextStep } from '../text-step.ts'

export class EscalateWriteStep extends TextStep {
  readonly name = 'escalateWrite'
  readonly label = 'Escalate write directories'
  readonly next = 'allowedLocalScripts'

  defaultValue() {
    return defaultCrowConfig().permissions.escalateWrite.join(', ')
  }
}
