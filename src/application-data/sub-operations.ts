import type { AsyncOperation, ConsoleError } from '../types.ts'

type SubOperation = { operation: AsyncOperation; action: string }

export class SubOperations {
  reason = ''
  private entries: SubOperation[] = []
  private succeeded = true

  async run<T extends AsyncOperation>(operation: T, action: string) {
    await operation.run()
    this.entries.push({ operation, action })
    if (!operation.success()) this.fail(operation.reason)
    return operation
  }

  success() {
    return this.succeeded
  }

  reportFailures(consoleError: ConsoleError) {
    this.entries
      .filter(({ operation }) => !operation.success())
      .forEach((entry) => consoleError(this.message(entry)))
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
  }

  private message({ operation, action }: SubOperation) {
    const detail = operation.reason && `: ${operation.reason}`
    return `Could not ${action}${detail}`
  }
}
