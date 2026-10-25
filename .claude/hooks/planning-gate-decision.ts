export type PlanningDecision = {
  decision: 'deny'
  reason: string
}

type PlanningWrite = {
  filePath: string
  transcript: string
}

const planningLoaded = /"skill":\s*"planning"|<command-name>\/?planning</

export const decidePlanningWrite = ({
  filePath,
  transcript,
}: PlanningWrite): PlanningDecision | undefined => {
  if (!filePath.includes('/.claude/plans/')) return undefined
  if (planningLoaded.test(transcript)) return undefined
  return {
    decision: 'deny',
    reason:
      'Load the planning skill (/planning) before writing a plan file; AGENTS.md § Planning requires it.',
  }
}
