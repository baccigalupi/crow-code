import { systemPrompt } from './system-prompt.ts'

export const requestMessages = (userText: string) => {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userText },
  ]
}
