import type { CommandApplicationData } from '../../types.ts'
import { commitChanges } from './commit.ts'
import { getCurrentDiff } from './current-diff.ts'
import { requestCommitSummary } from './request.ts'

class SummaryCommit {
  private goal: string
  private data: CommandApplicationData
  private summary: string = ''

  constructor(goal: string, data: CommandApplicationData) {
    this.goal = goal
    this.data = data
  }

  async run() {
    if (await this.summaryIsEmpty()) return this.noSummary()
    this.data.consoleLog(this.summary)
    await this.commitSummary()
  }

  private async summaryIsEmpty() {
    this.summary = await this.generateSummary()
    return this.summary.length === 0
  }

  private noSummary() {
    const message = 'No summary generated; nothing committed'
    this.data.logger.error(message)
    this.data.consoleLog(message)
  }

  private async generateSummary() {
    const diff = await getCurrentDiff(this.data.logger, this.data.denoCommand)
    return requestCommitSummary(diff, this.goal, this.data)
  }

  private async commitSummary() {
    await commitChanges(this.summary, this.data.logger, this.data.denoCommand)
  }
}

export const commitWithSummary = (
  goal: string,
  data: CommandApplicationData,
) => {
  return new SummaryCommit(goal, data).run()
}
