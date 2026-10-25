import { describe, expect, it } from 'bun:test'
import {
  CurrentStep,
  currentStep,
} from '../../../../src/tui/install/steps/current.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('current', () => {
  it('when asked for the step name, step returns the installStore step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'envFile'

    const step = new CurrentStep(installStore).step()

    expect(step).toBe('envFile')
  })

  it('when all is called, returns the steps in order', () => {
    const installStore = buildInstallStore()

    const steps = new CurrentStep(installStore).all()

    expect(steps).toHaveLength(14)
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
    expect(steps[13].name).toBe('done')
  })

  it('when the installStore step is ignore, current returns that step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'ignore'

    const step = new CurrentStep(installStore).current()

    expect(step.name).toBe('ignore')
    expect(step.nextStep).toBe('additionalRead')
    expect(step.state()).toBe(installStore.ignore)
  })

  it('when the installStore step is additionalRead, current returns that step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'additionalRead'

    const step = new CurrentStep(installStore).current()

    expect(step.name).toBe('additionalRead')
    expect(step.nextStep).toBe('additionalWrite')
    expect(step.state()).toBe(installStore.additionalRead)
  })

  it('when the installStore step is additionalWrite, current returns that step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'additionalWrite'

    const step = new CurrentStep(installStore).current()

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(installStore.additionalWrite)
  })

  it('when the installStore step is escalateRead, current returns that step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'escalateRead'

    const step = new CurrentStep(installStore).current()

    expect(step.name).toBe('escalateRead')
    expect(step.nextStep).toBe('escalateWrite')
    expect(step.state()).toBe(installStore.escalateRead)
  })

  it('when the installStore step has no step class, current returns the default step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'write'

    const step = new CurrentStep(installStore).current()

    expect(step.name).toBe('default')
  })

  it('when currentStep is called, returns the current step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'allowedLocalScripts'

    const step = currentStep(installStore)

    expect(step.name).toBe('allowedLocalScripts')
    expect(step.state()).toBe(installStore.allowedLocalScripts)
  })
})
