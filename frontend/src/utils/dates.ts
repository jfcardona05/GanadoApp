export function todayAtStart() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function daysUntil(date: string) {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - todayAtStart().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isWithinNextDays(date: string, days: number) {
  const diff = daysUntil(date)
  return diff >= 0 && diff <= days
}

export function isPastDate(date: string) {
  return daysUntil(date) < 0
}
