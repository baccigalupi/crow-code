import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../src/tui/keypress.ts'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { Router } from '../../../src/tui/install/router.ts'
import type { PanelName } from '../../../src/tui/install/types.ts'
import type { Controller } from '../../../src/tui/types.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Router', () => {
  it('when listed, has fifteen prompts', () => {
    const router = new Router()

    const { prompts } = router

    expect(prompts).toHaveLength(15)
  })

  it('when asked for a prompt by name, returns that panel', () => {
    const router = new Router()

    const panel = router.get('envFile')

    expect(panel.name).toBe('envFile')
  })

  it('when asked for flows, has one per prompt in the order they are asked', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(Object.keys(flows)).toEqual([
      'repo',
      'crowGlobalDirectory',
      'envFile',
      'ignore',
      'additionalRead',
      'additionalWrite',
      'escalateRead',
      'escalateWrite',
      'allowedLocalScripts',
      'providerName',
      'providerUrl',
      'providerCredentials',
      'confirm',
      'completeSetup',
      'done',
    ])
  })

  it('when asked for flows, every next target is an asked prompt', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(flows.crowGlobalDirectory.next).toBe('envFile')
    expect(flows.envFile.next).toBe('ignore')
    expect(flows.ignore.next).toBe('additionalRead')
    expect(flows.additionalRead.next).toBe('additionalWrite')
    expect(flows.additionalWrite.next).toBe('escalateRead')
    expect(flows.escalateRead.next).toBe('escalateWrite')
    expect(flows.escalateWrite.next).toBe('allowedLocalScripts')
    expect(flows.allowedLocalScripts.next).toBe('providerName')
    expect(flows.providerName.next).toBe('providerUrl')
    expect(flows.providerUrl.next).toBe('providerCredentials')
    expect(flows.providerCredentials.next).toBe('providerName')
    expect(flows.confirm.next).toBe('completeSetup')
    expect(flows.completeSetup.next).toBeUndefined()
    expect(flows.done.next).toBeUndefined()
  })

  it('when asked for flows, the provider fields cancel to the confirm prompt', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(flows.providerName.cancel).toBe('confirm')
    expect(flows.providerUrl.cancel).toBe('confirm')
    expect(flows.providerCredentials.cancel).toBe('confirm')
    expect(flows.envFile.cancel).toBeUndefined()
  })

  it('when asked for flows, only completeSetup has entered', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(typeof flows.completeSetup.entered).toBe('function')
    expect(flows.done.entered).toBeUndefined()
    expect(flows.confirm.entered).toBeUndefined()
    expect(flows.ignore.entered).toBeUndefined()
  })

  it('when asked for flows, the done controller exits on any key', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const flows = new Router().flows(store)
    const controller = flows.done.controller as Controller<PanelName>

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('exit')
  })

  it('when asked for flows, setup progress has no controller', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(flows.completeSetup.controller).toBeUndefined()
  })
})
