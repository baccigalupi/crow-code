import { describe, expect, it, mock, spyOn } from 'bun:test'
import {
  InstallTuiRunner,
  runInstallTui,
} from '../../../src/tui/install/runner.ts'
import { InstallApp } from '../../../src/tui/install/views/install-app.tsx'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockStdin } from '../../support/mock-streams.ts'

describe('runner', () => {
  it('when asked for its view, builds the install app with the data store', () => {
    const runner = new InstallTuiRunner(mockApplicationData(), {})

    const view = runner.view()

    expect(view.type).toBe(InstallApp)
    expect(view.props.model).toBe(runner.model())
  })

  it('when run, starts setup from the model once the step reaches completeSetup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const runner = new InstallTuiRunner(applicationData, {})
    runner.run()
    runner.model().directories.repoDirectory.insert('/repo/injected')

    runner.model().step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['/repo/injected']])
  })

  it('when the install tui runs without a raw mode terminal, reports it was interrupted', async () => {
    const consoleError = mock()
    const runner = runInstallTui(mockApplicationData({ consoleError }), {
      stdin: mockStdin({ rawMode: false }),
    })

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(consoleError.mock.calls[0][0]).toBe(
      'Error: Crow unable to work in this terminal - TTY compatible stdin required.',
    )
  })
})
