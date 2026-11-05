import { TextStep } from './text-step.ts'

// A question whose default is shown as a JSON list, already in brackets, so
// it needs no parentheses.
export abstract class JsonListTextStep extends TextStep {
  placeholder(defaultValue: string) {
    return defaultValue
  }
}
