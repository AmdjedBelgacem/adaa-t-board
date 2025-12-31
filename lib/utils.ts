import clsx from 'clsx'

export function cn(...inputs: unknown[]) {
  const _clsx = clsx as (...args: unknown[]) => string
  return _clsx(...inputs)
}

export default cn
