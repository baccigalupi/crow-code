const stripFence = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('```')) {
    return trimmed
  }
  return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim()
}

const isStringArray = (parsed: unknown): parsed is string[] => {
  if (!Array.isArray(parsed)) {
    return false
  }
  return parsed.every((element) => typeof element === 'string')
}

export const parseGoals = (raw: string) => {
  if (raw === '') {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(stripFence(raw))
    if (!isStringArray(parsed)) {
      console.error('Goal response was not an array of strings')
      return []
    }
    return parsed
  } catch {
    console.error('Goal response was not valid JSON')
    return []
  }
}
