import type { GitFileDiff } from '../../tools/types.ts'
import type { CommitMessageRequest, RequestMessages } from '../types.ts'

export const commitMessageSystemPrompt = `
You write commit messages in the style of the repository you are given.

Rules for the subject:
- imperative mood, at most 65 characters, no trailing period
- one line that names the dominant change

Rules for the body:
- separated from the subject by a blank line, wrapped at 72 columns
- explains why the change is being made and any notable decisions
- never a list of changed files or a restatement of the diff
- omit the body entirely when the subject alone suffices

Match the tone and vocabulary of the recent commit subjects provided,
but never copy a subject verbatim.

Never emit trailers, sign-offs, or attribution lines such as
"Co-Authored-By" or "Generated with" — the committer adds those.

Respond with only a JSON object: {"success": boolean, "subject": string, "body": string}.
No markdown, no explanation.
`

const formatChange = (change: GitFileDiff) => {
  return `### ${change.path}\n\`\`\`diff\n${change.diff}\n\`\`\``
}

const formatChanges = (changes: GitFileDiff[]) => {
  return changes.map(formatChange).join('\n\n')
}

const formatSubjects = (subjects: string[]) => {
  if (subjects.length === 0) return ''

  const lines = subjects.map((subject) => `- ${subject}`).join('\n')
  return `Recent commit subjects:\n${lines}\n\n`
}

const userContent = (request: CommitMessageRequest) => {
  return `Goal:\n${request.goal}\n\n${
    formatSubjects(request.recentSubjects)
  }Changes:\n${formatChanges(request.changes)}`
}

export const commitMessageMessages: RequestMessages<CommitMessageRequest> = (
  request,
) => {
  return [
    { role: 'system', content: commitMessageSystemPrompt },
    { role: 'user', content: userContent(request) },
  ]
}
