import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../../src/tui/input-buffer.ts'
import {
  CurrentStep,
  currentStep,
} from '../../../../src/tui/install/steps/current.ts'
import type { InstallStep } from '../../../../src/tui/install/types.ts'

describe('current', () => {
  it('when asked for the step name, step returns the installState step', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('envFile'),
      confirmation: signal(true),
    }

    const step = new CurrentStep(installState).step()

    expect(step).toBe('envFile')
  })

  it('when all is called, returns the steps in order', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('repo'),
      confirmation: signal(true),
    }

    const steps = new CurrentStep(installState).all()

    expect(steps).toHaveLength(9)
    expect(steps[0].name).toBe('repo')
    expect(steps[1].name).toBe('crowGlobalDirectory')
    expect(steps[2].name).toBe('envFile')
    expect(steps[3].name).toBe('additionalRead')
    expect(steps[4].name).toBe('escalateRead')
    expect(steps[5].name).toBe('escalateWrite')
    expect(steps[6].name).toBe('allowedLocalScripts')
    expect(steps[7].name).toBe('confirm')
    expect(steps[8].name).toBe('done')
  })

  it('when the installState step is additionalRead, current returns that step', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('additionalRead'),
      confirmation: signal(true),
    }

    const step = new CurrentStep(installState).current()

    expect(step.name).toBe('additionalRead')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(installState.additionalRead)
  })

  it('when the installState step is escalateRead, current returns that step', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('escalateRead'),
      confirmation: signal(true),
    }

    const step = new CurrentStep(installState).current()

    expect(step.name).toBe('escalateRead')
    expect(step.nextStep).toBe('escalateWrite')
    expect(step.state()).toBe(installState.escalateRead)
  })

  it('when the installState step has no step class, current returns the default step', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('write'),
      confirmation: signal(true),
    }

    const step = new CurrentStep(installState).current()

    expect(step.name).toBe('default')
  })

  it('when currentStep is called, returns the current step', () => {
    const installState = {
      repoDirectory: signal(emptyBuffer()),
      globalDirectory: signal(emptyBuffer()),
      envFile: signal(emptyBuffer()),
      escalateRead: signal(emptyBuffer()),
      additionalRead: signal(emptyBuffer()),
      escalateWrite: signal(emptyBuffer()),
      allowedLocalScripts: signal(emptyBuffer()),
      step: signal<InstallStep>('allowedLocalScripts'),
      confirmation: signal(true),
    }

    const step = currentStep(installState)

    expect(step.name).toBe('allowedLocalScripts')
    expect(step.state()).toBe(installState.allowedLocalScripts)
  })
})
