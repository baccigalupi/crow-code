import type { AsyncOperation, ConsoleError } from '../types.ts'

type SubOperation = { operation: AsyncOperation; action: string }

export class SubOperations {
  private entries: SubOperation[] = []

  async run<T extends AsyncOperation>(operation: T, action: string) {
    await operation.run()
    this.entries.push({ operation, action })
    return operation
  }

  reportFailures(consoleError: ConsoleError) {
    this.entries
      .filter(({ operation }) => !operation.success())
      .forEach((entry) => consoleError(this.message(entry)))
  }

  private message({ operation, action }: SubOperation) {
    const detail = operation.reason && `: ${operation.reason}`
    return `Could not ${action}${detail}`
  }
}
