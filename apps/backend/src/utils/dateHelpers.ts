/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / oneDay);
}

/**
 * Calculate the number of days until a future date
 */
export function daysUntil(futureDate: Date): number {
  const now = new Date();
  const future = new Date(futureDate);

  // Set both to midnight for accurate day comparison
  now.setHours(0, 0, 0, 0);
  future.setHours(0, 0, 0, 0);

  const diffMs = future.getTime() - now.getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Calculate next renewal date based on billing cycle
 */
export function calculateNextRenewalDate(
  currentRenewalDate: Date,
  billingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
): Date {
  const date = new Date(currentRenewalDate);

  switch (billingCycle) {
    case 'DAILY':
      return addDays(date, 1);
    case 'WEEKLY':
      return addDays(date, 7);
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      return date;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      return date;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      return date;
    default:
      return date;
  }
}

/**
 * Get all reminder dates for a subscription
 */
export function getReminderDates(
  renewalDate: Date,
  reminderDaysBefore: number[]
): Date[] {
  return reminderDaysBefore
    .map(days => subtractDays(new Date(renewalDate), days))
    .filter(date => isFuture(date))
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Check if we should send a reminder today
 */
export function shouldSendReminderToday(
  renewalDate: Date,
  reminderDaysBefore: number[]
): { shouldSend: boolean; daysUntilRenewal: number } {
  const daysUntilRenewal = daysUntil(renewalDate);
  const shouldSend = reminderDaysBefore.includes(daysUntilRenewal);

  return { shouldSend, daysUntilRenewal };
}

/**
 * Check if we're in quiet hours for a given timezone
 */
export function isInQuietHours(
  timezone: string,
  quietHoursStart?: number,
  quietHoursEnd?: number
): boolean {
  if (quietHoursStart === undefined || quietHoursEnd === undefined) {
    return false;
  }

  try {
    const now = new Date();
    const timeInTimezone = new Date(
      now.toLocaleString('en-US', { timeZone: timezone })
    );
    const currentHour = timeInTimezone.getHours();

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (quietHoursStart > quietHoursEnd) {
      return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
    }

    // Normal quiet hours (e.g., 08:00 - 22:00)
    return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
  } catch (error) {
    // Invalid timezone, default to not in quiet hours
    return false;
  }
}

/**
 * Format a date for display
 */
export function formatDate(date: Date, format: 'short' | 'long' = 'long'): string {
  const d = new Date(date);

  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get a human-readable relative time (e.g., "in 3 days", "tomorrow", "today")
 */
export function getRelativeTime(date: Date): string {
  const days = daysUntil(date);

  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return `in ${days} days`;
  if (days < 30) return `in ${Math.floor(days / 7)} weeks`;
  if (days < 365) return `in ${Math.floor(days / 30)} months`;
  return `in ${Math.floor(days / 365)} years`;
}
