import clsx from 'clsx'

export function cn(...inputs: unknown[]) {
  const _clsx = clsx as (...args: unknown[]) => string
  return _clsx(...inputs)
}

export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .slice(0, maxLength)
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) && url.length <= 2000
  } catch {
    return false
  }
}

export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return ''
  return query
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 200)
    .trim()
}

export function validateTaskTitle(title: string): boolean {
  return typeof title === 'string' &&
         title.length >= 1 &&
         title.length <= 200 &&
         !/<script/i.test(title) &&
         !/javascript:/i.test(title)
}

export function validateTaskDescription(description: string): boolean {
  return typeof description === 'string' &&
         description.length <= 5000 &&
         !/<script/i.test(description) &&
         !/javascript:/i.test(description)
}

export function validateDate(dateString: string): boolean {
  if (!dateString) return true
  const date = new Date(dateString)
  const now = new Date()
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(now.getFullYear() + 1)
  return date instanceof Date &&
         !isNaN(date.getTime()) &&
         date >= new Date('2020-01-01') &&
         date <= oneYearFromNow
}

export function sanitizeNumericInput(input: string, maxValue: number = 1000000): number {
  const num = parseInt(input.replace(/[^\d]/g, ''), 10)
  return isNaN(num) ? 0 : Math.min(Math.max(0, num), maxValue)
}

export default cn
