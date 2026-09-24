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
    this.summary = await this.generateSummary()
    this.data.consoleLog(this.summary)
    await this.commitSummary()
  }

  private async generateSummary() {
    const diff = await getCurrentDiff(this.data.logger, this.data.denoCommand)
    return requestCommitSummary(diff, this.goal, this.data)
  }

  private async commitSummary() {
    if (this.summary.length === 0) return
    await commitChanges(this.summary, this.data.logger, this.data.denoCommand)
  }
}

export const commitWithSummary = (
  goal: string,
  data: CommandApplicationData,
) => {
  return new SummaryCommit(goal, data).run()
}
