import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { processAllReminders } from '../services/notification.service.js';
import { CONSTANTS } from '../config/constants.js';

let reminderJob: cron.ScheduledTask | null = null;

/**
 * Start the reminder scheduler
 * Runs every hour to check for subscriptions that need reminders
 */
export function startReminderScheduler() {
  if (reminderJob) {
    logger.warn('Reminder scheduler is already running');
    return;
  }

  logger.info('Starting reminder scheduler');
  logger.info(`Scheduler will run: ${CONSTANTS.REMINDER_CHECK_INTERVAL}`);

  // Schedule the job (runs every hour by default: '0 * * * *')
  reminderJob = cron.schedule(
    CONSTANTS.REMINDER_CHECK_INTERVAL,
    async () => {
      logger.info('Reminder scheduler triggered');
      await processAllReminders();
    },
    {
      timezone: 'UTC', // Run in UTC to avoid timezone issues
    }
  );

  // Also run immediately on startup (for testing and catching up on missed reminders)
  logger.info('Running initial reminder check...');
  processAllReminders().catch(error => {
    logger.error('Error in initial reminder check:', error);
  });

  logger.info('Reminder scheduler started successfully');
}

/**
 * Stop the reminder scheduler
 */
export function stopReminderScheduler() {
  if (reminderJob) {
    logger.info('Stopping reminder scheduler');
    reminderJob.stop();
    reminderJob = null;
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    running: reminderJob !== null,
    schedule: CONSTANTS.REMINDER_CHECK_INTERVAL,
    timezone: 'UTC',
  };
}

/**
 * Manually trigger the reminder job (for testing)
 */
export async function triggerReminderJobManually() {
  logger.info('Manually triggering reminder job');
  await processAllReminders();
  logger.info('Manual reminder job completed');
}
