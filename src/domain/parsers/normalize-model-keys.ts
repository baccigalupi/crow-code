const camelizeKey = (key: string) => {
  return key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

const addCamelizedKey = <Output extends Record<string, unknown>>(
  result: Output,
  key: string,
  value: unknown,
) => {
  result[camelizeKey(key) as keyof Output] = value as Output[keyof Output]
  return result
}

export const normalizeModelKeys = <Output extends Record<string, unknown>>(
  record: Record<string, unknown>,
): Output => {
  return Object.entries(record).reduce(
    (result, [key, value]) => addCamelizedKey(result, key, value),
    {} as Output,
  )
}
