import { describe, expect, it } from 'bun:test'
import {
  CurrentStep,
  currentStep,
} from '../../../../src/tui/install/steps/current.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('current', () => {
  it('when asked for the step name, step returns the userInputStore step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'envFile'

    const step = new CurrentStep(userInputStore).step()

    expect(step).toBe('envFile')
  })

  it('when all is called, returns the steps in order', () => {
    const userInputStore = buildUserInputStore()

    const steps = new CurrentStep(userInputStore).all()

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

  it('when the userInputStore step is ignore, current returns that step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'ignore'

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('ignore')
    expect(step.nextStep).toBe('additionalRead')
    expect(step.state()).toBe(userInputStore.ignore)
  })

  it('when the userInputStore step is additionalRead, current returns that step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'additionalRead'

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('additionalRead')
    expect(step.nextStep).toBe('additionalWrite')
    expect(step.state()).toBe(userInputStore.additionalRead)
  })

  it('when the userInputStore step is additionalWrite, current returns that step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'additionalWrite'

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(userInputStore.additionalWrite)
  })

  it('when the userInputStore step is escalateRead, current returns that step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'escalateRead'

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('escalateRead')
    expect(step.nextStep).toBe('escalateWrite')
    expect(step.state()).toBe(userInputStore.escalateRead)
  })

  it('when the userInputStore step has no step class, current returns the default step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'unknown' as InstallStep

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('default')
  })

  it('when the userInputStore step is completeSetup, current returns that step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const step = new CurrentStep(userInputStore).current()

    expect(step.name).toBe('completeSetup')
    expect(step.nextStep).toBe('completeSetup')
  })

  it('when currentStep is called, returns the current step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'allowedLocalScripts'

    const step = currentStep(userInputStore)

    expect(step.name).toBe('allowedLocalScripts')
    expect(step.state()).toBe(userInputStore.allowedLocalScripts)
  })
})
