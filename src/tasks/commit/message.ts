import type { ApplicationTaskArguments } from '../../types.ts'
import type { GitFileDiff } from '../../tools/types.ts'
import { getCommitMessage } from '../../model-requests/commit-message.ts'
import { gitRecentSubjects } from '../../tools/git/log/recent-subjects.ts'

type TaskArguments = {
  goal: string
  changes: GitFileDiff[]
}

type MessageArguments = ApplicationTaskArguments<TaskArguments>

export const commitMessage = async (
  { applicationData, taskArguments: { goal, changes } }: MessageArguments,
) => {
  const logged = await gitRecentSubjects({ applicationData }).run()
  const runner = await getCommitMessage(applicationData, {
    goal,
    changes,
    recentSubjects: logged.result(),
  })
  return runner.result()
}
