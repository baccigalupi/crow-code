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
