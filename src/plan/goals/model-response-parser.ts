import { parseGoals } from './parse-goals.ts'

type GoalMessage = { content?: string }
type GoalChoice = { message?: GoalMessage }
type ModelResponse = { choices?: GoalChoice[] }

class ExtractModelResponse<T> {
  private response: Response
  private parse: (content: string) => T
  private content: string

  constructor(response: Response, parse: (content: string) => T) {
    this.response = response
    this.parse = parse
    this.content = ''
  }

  async extract() {
    if (this.response.ok && this.extractContent(await this.response.json())) {
      return this.parse(this.content)
    } else {
      return this.parse('')
    }
  }

  private extractContent(body: ModelResponse) {
    if (body.choices === undefined || body.choices.length === 0) {
      return false
    }
    return this.extractMessage(body.choices[0].message)
  }

  private extractMessage(message: GoalMessage | undefined) {
    if (message === undefined || message.content === undefined) {
      return false
    }
    this.content = message.content
    return true
  }
}

export const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parseGoals).extract()
}
