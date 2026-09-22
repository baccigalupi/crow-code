const systemPrompt = `
Write one concise commit-message summary for the provided diff and optional goal.
Respond with only the summary and no surrounding prose.
`

const userMessage = (diff: string, goal: string) => {
  if (goal.length === 0) {
    return `Diff:\n${diff}`
  }

  return `Diff:\n${diff}\n\nGoal:\n${goal}`
}

export const requestMessages = (diff: string, goal: string) => {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage(diff, goal) },
  ]
}
