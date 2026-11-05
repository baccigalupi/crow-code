import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoDirectoryStep } from '../../../../src/tui/install/steps/text/repo-directory-step.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextStep', () => {
  it('when asked for its placeholder, is its default in parentheses', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const step = new RepoDirectoryStep()

    const placeholder = step.placeholder(store)

    expect(placeholder).toBe('(.crow)')
  })
})
