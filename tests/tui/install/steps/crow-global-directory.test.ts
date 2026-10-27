import { describe, expect, it } from 'bun:test'
import { CrowGlobalDirectoryStep } from '../../../../src/tui/install/steps/crow-global-directory.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its field, returns the global directory input', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('crowGlobalDirectory')

    const field = new CrowGlobalDirectoryStep(model).field()

    expect(field).toBe(model.directories.globalDirectory)
  })
})
