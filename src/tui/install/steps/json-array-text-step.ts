import { defaultCrowConfig } from '../../../domain/config.ts'
import { TextStep } from './text-step.ts'

// A permission array whose default is shown as JSON, already in brackets,
// so it needs no parentheses.
export abstract class JsonArrayTextStep extends TextStep {
  abstract readonly name:
    'ignore' | 'additionalRead' | 'additionalWrite' | 'escalateRead'

  defaultValue() {
    return JSON.stringify(defaultCrowConfig().permissions[this.name])
  }

  placeholder() {
    return this.defaultValue()
  }
}
