import type { GitFileDiff } from '../../tools/types.ts'
import type { CommitMessageRequest, RequestMessages } from '../types.ts'

const commitMessageInstructions = `
Rules for the subject:
- imperative mood, at most 65 characters, no trailing period
- one line that names the dominant change

Rules for the body:
- separated from the subject by a blank line, wrapped at 72 columns
- explains why the change is being made and any notable decisions
- never a list of changed files or a restatement of the diff

Never emit trailers, sign-offs, or attribution lines such as
"Co-Authored-By" or "Generated with" — the committer adds those.

Respond with only a JSON object: {"success": boolean, "subject": string, "body": string}.
No markdown, no explanation.
`

export const commitMessageSystemPrompt = `
You write commit messages in the style of the repository you are given.

Match the tone and vocabulary of the recent commit subjects provided,
but never copy a subject verbatim.
${commitMessageInstructions}`

const commitMessageWithoutSubjectsSystemPrompt = `
You write commit messages for the changes you are given.
${commitMessageInstructions}`

export class CommitMessageMessages {
  private request: CommitMessageRequest

  constructor(request: CommitMessageRequest) {
    this.request = request
  }

  messages() {
    return [
      { role: 'system', content: this.systemContent() },
      { role: 'user', content: this.userContent() },
    ]
  }

  private systemContent() {
    if (!this.includesSubjects()) {
      return commitMessageWithoutSubjectsSystemPrompt
    }

    return commitMessageSystemPrompt
  }

  private userContent() {
    return `Goal:\n${this.request.goal}\n\n${this.formatSubjects()}Changes:\n${this.formatChanges()}`
  }

  private formatSubjects() {
    if (!this.includesSubjects()) return ''

    const lines = this.request.recentSubjects.map((subject) => `- ${subject}`)
      .join('\n')
    return `Recent commit subjects:\n${lines}\n\n`
  }

  private includesSubjects() {
    return this.request.includeRecentSubjects !== false &&
      this.request.recentSubjects.length > 0
  }

  private formatChanges() {
    return this.request.changes.map((change) => this.formatChange(change)).join(
      '\n\n',
    )
  }

  private formatChange(change: GitFileDiff) {
    return `### ${change.path}\n\`\`\`diff\n${change.diff}\n\`\`\``
  }
}

export const commitMessageMessages: RequestMessages<CommitMessageRequest> = (
  request,
) => {
  return new CommitMessageMessages(request).messages()
}
