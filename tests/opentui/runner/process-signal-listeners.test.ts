import { describe, expect, it, mock, spyOn } from 'bun:test'
import { ProcessSignalListeners } from '../../../src/opentui/runner/process-signal-listeners.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('ProcessSignalListeners', () => {
  it('when listening, adds the handler for SIGINT and SIGTERM', () => {
    const applicationData = mockApplicationData()
    const add = spyOn(
      applicationData.runtime,
      'addSignalListener',
    ).mockImplementation(() => {})
    const handler = mock(() => {})
    const listeners = new ProcessSignalListeners(applicationData, handler)

    listeners.listen()

    expect(add).toHaveBeenCalledTimes(2)
    expect(add).toHaveBeenNthCalledWith(1, 'SIGINT', handler)
    expect(add).toHaveBeenNthCalledWith(2, 'SIGTERM', handler)
  })

  it('when unlistening, removes the handler for SIGINT and SIGTERM', () => {
    const applicationData = mockApplicationData()
    const remove = spyOn(
      applicationData.runtime,
      'removeSignalListener',
    ).mockImplementation(() => {})
    const handler = mock(() => {})
    const listeners = new ProcessSignalListeners(applicationData, handler)

    listeners.unlisten()

    expect(remove).toHaveBeenCalledTimes(2)
    expect(remove).toHaveBeenNthCalledWith(1, 'SIGINT', handler)
    expect(remove).toHaveBeenNthCalledWith(2, 'SIGTERM', handler)
  })
})
