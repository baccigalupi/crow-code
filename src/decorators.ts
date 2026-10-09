const forwarded = (attribute: string, member: string) =>
  function (this: Record<string, Record<string, () => unknown>>) {
    return this[attribute][member]()
  }

export const delegate = (
  members: Record<string, string>,
  attribute: string,
) =>
<Target extends abstract new (...args: never[]) => object>(
  target: Target,
  _context: ClassDecoratorContext<Target>,
): void => {
  Object.entries(members).forEach(([member, name]) =>
    Object.defineProperty(target.prototype, name, {
      configurable: true,
      writable: true,
      value: forwarded(attribute, member),
    })
  )
}

export const memoize = <This extends object, Return>(
  method: (this: This) => Return,
  _context: ClassMethodDecoratorContext<This, (this: This) => Return>,
): (this: This) => Return => {
  const cache = new WeakMap<This, Return>()
  return function (this: This): Return {
    if (cache.has(this)) return cache.get(this) as Return
    const value = method.call(this)
    cache.set(this, value)
    return value
  }
}
