import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { Router } from '../../../src/tui/install/router.ts'
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

  it('when asked for flows, only completeSetup has entered', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const flows = new Router().flows(store)

    expect(typeof flows.completeSetup.entered).toBe('function')
    expect(flows.done.entered).toBeUndefined()
    expect(flows.confirm.entered).toBeUndefined()
    expect(flows.ignore.entered).toBeUndefined()
  })
})
