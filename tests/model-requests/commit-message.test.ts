import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  GetCommitMessage,
  getCommitMessage,
} from '../../src/model-requests/commit-message.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../support/mock-fetch.ts'

describe('commit-message', () => {
  it('when run is called, writes the commit message request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"success":true,"subject":"Add login","body":""}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [{ path: 'src/a.ts', diff: 'diff --git a/src/a.ts b/src/a.ts' }],
      recentSubjects: ['Fix tests'],
    })

    const commitMessage = await request.run()

    expect(request.messages[0].role).toBe('system')
    expect(request.messages[1].role).toBe('user')
    expect(request.messages[1].content).toContain('add login')
    expect(commitMessage).toEqual({
      success: true,
      subject: 'Add login',
      body: '',
    })
  })

  it('when the api call fails, returns an empty commit message', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchError(500),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    const commitMessage = await request.run()

    expect(commitMessage).toEqual({ success: false, subject: '', body: '' })
  })

  it('when called through getCommitMessage, runs and returns the request', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content:
                '```json\n{"success":true,"subject":"Add login","body":""}\n```',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })

    const request = await getCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    expect(request).toBeInstanceOf(GetCommitMessage)
    expect(request.success()).toBe(true)
  })
})
