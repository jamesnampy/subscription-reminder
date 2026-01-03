export const CONSTANTS = {
  // Default reminder days before renewal
  DEFAULT_REMINDER_DAYS: [7, 3, 1],

  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  // Password
  BCRYPT_SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,

  // Notification
  MAX_NOTIFICATION_RETRIES: 3,
  RETRY_DELAY_MS: 5 * 60 * 1000, // 5 minutes

  // Scheduler
  REMINDER_CHECK_INTERVAL: '0 * * * *', // Every hour

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
};
