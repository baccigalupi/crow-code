import type { TextStep, TextStepName } from '../types.ts'

// Each one-line question: what it asks, the step after it, and whether its
// default shows bare or in parentheses.
export const textSteps: Record<TextStepName, TextStep> = {
  repoDirectory: {
    label: 'What directory for the local repo crow setup',
    next: 'crowGlobalDirectory',
    bare: false,
  },
  crowGlobalDirectory: {
    label: 'User crow directory',
    next: 'envFile',
    bare: false,
  },
  envFile: { label: 'Credentials .env file', next: 'ignore', bare: false },
  ignore: { label: 'Ignored paths', next: 'additionalRead', bare: true },
  additionalRead: {
    label: 'Additional read directories',
    next: 'additionalWrite',
    bare: true,
  },
  additionalWrite: {
    label: 'Additional write directories',
    next: 'escalateRead',
    bare: true,
  },
  escalateRead: {
    label: 'Escalate read directories',
    next: 'escalateWrite',
    bare: true,
  },
  escalateWrite: {
    label: 'Escalate write directories',
    next: 'allowedLocalScripts',
    bare: false,
  },
  allowedLocalScripts: {
    label: 'Allowed local scripts',
    next: 'providerName',
    bare: false,
  },
}
