const camelizeKey = (key: string) => {
  return key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

const addCamelizedKey = <T>(
  result: Record<string, T>,
  key: string,
  value: T,
) => {
  result[camelizeKey(key)] = value
  return result
}

export const normalizeModelKeys = <T>(record: Record<string, T>) => {
  return Object.entries(record).reduce(
    (result, [key, value]) => addCamelizedKey(result, key, value),
    {} as Record<string, T>,
  )
}
