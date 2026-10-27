import { describe, expect, it } from 'bun:test'
import { CurrentStep } from '../../../../src/tui/install/steps/current.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CurrentStep', () => {
  it('when asked for the step name, step returns the model step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('envFile')

    const step = new CurrentStep(model).step()

    expect(step).toBe('envFile')
  })

  it('when all is called, returns the steps in order', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const steps = new CurrentStep(model).all()

    expect(steps).toHaveLength(15)
    expect(steps[0].name).toBe('repo')
    expect(steps[1].name).toBe('crowGlobalDirectory')
    expect(steps[2].name).toBe('envFile')
    expect(steps[3].name).toBe('ignore')
    expect(steps[4].name).toBe('additionalRead')
    expect(steps[5].name).toBe('additionalWrite')
    expect(steps[6].name).toBe('escalateRead')
    expect(steps[7].name).toBe('escalateWrite')
    expect(steps[8].name).toBe('allowedLocalScripts')
    expect(steps[9].name).toBe('providerName')
    expect(steps[10].name).toBe('providerUrl')
    expect(steps[11].name).toBe('providerCredentials')
    expect(steps[12].name).toBe('confirm')
    expect(steps[13].name).toBe('completeSetup')
    expect(steps[14].name).toBe('done')
  })

  it('when the model step is ignore, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('ignore')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('ignore')
    expect(step.nextStep).toBe('additionalRead')
    expect(step.field()).toBe(model.permissions.ignore)
  })

  it('when the model step is additionalRead, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('additionalRead')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('additionalRead')
    expect(step.nextStep).toBe('additionalWrite')
    expect(step.field()).toBe(model.permissions.additionalRead)
  })

  it('when the model step is additionalWrite, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('additionalWrite')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.field()).toBe(model.permissions.additionalWrite)
  })

  it('when the model step is escalateRead, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('escalateRead')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('escalateRead')
    expect(step.nextStep).toBe('escalateWrite')
    expect(step.field()).toBe(model.permissions.escalateRead)
  })

  it('when the model step has no step class, current returns the default step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('unknown' as InstallStep)

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('default')
  })

  it('when the model step is completeSetup, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('completeSetup')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('completeSetup')
    expect(step.nextStep).toBe('completeSetup')
  })

  it('when the model step is allowedLocalScripts, current returns that step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('allowedLocalScripts')

    const step = new CurrentStep(model).current()

    expect(step.name).toBe('allowedLocalScripts')
    expect(step.field()).toBe(model.permissions.allowedLocalScripts)
  })
})
