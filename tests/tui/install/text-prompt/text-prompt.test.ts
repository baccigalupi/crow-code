import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RepoPanel } from '../../../../src/tui/install/directories/repo.ts'
import { IgnorePanel } from '../../../../src/tui/install/permissions/ignore.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('TextPromptPanel', () => {
  describe('placeholder', () => {
    it('when the field is empty, is the default in parentheses', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })

      const placeholder = new RepoPanel().placeholder(
        store,
        store.inputs.peek(),
      )

      expect(placeholder).toBe('(.crow)')
    })

    it('when the field is empty and the panel is bare, is the default alone', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })

      const placeholder = new IgnorePanel().placeholder(
        store,
        store.inputs.peek(),
      )

      expect(placeholder).toBe('[]')
    })

    it('when the field has text, is empty', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.directories.repoDirectory.insert('x')

      const placeholder = new RepoPanel().placeholder(
        store,
        store.inputs.peek(),
      )

      expect(placeholder).toBe('')
    })
  })
})
