import { TextStep } from './text-step.tsx'

// A question answered with comma-separated paths, defaulting to
// defaultPaths. No default paths shows as empty brackets.
export abstract class PathsTextStep extends TextStep {
  abstract readonly defaultPaths: readonly string[]

  placeholder() {
    if (this.defaultPaths.length === 0) return '[]'

    return `(${this.defaultPaths.join(', ')})`
  }
}
