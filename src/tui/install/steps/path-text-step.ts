import { TextStep } from './text-step.tsx'

// A question answered with one path, defaulting to defaultPath.
export abstract class PathTextStep extends TextStep {
  abstract readonly defaultPath: string

  placeholder() {
    return `(${this.defaultPath})`
  }
}
