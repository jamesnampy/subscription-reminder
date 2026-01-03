import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendRenewalReminderEmail, sendCancellationDeadlineEmail } from './email.service.js';
import { sendRenewalReminderSMS, sendCancellationDeadlineSMS } from './sms.service.js';
import { shouldSendReminderToday, isInQuietHours } from '../utils/dateHelpers.js';

/**
 * Process reminder for a single subscription
 */
export async function processSubscriptionReminder(subscriptionId: string): Promise<void> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          include: {
            notificationPrefs: true,
          },
        },
      },
    });

    if (!subscription) {
      logger.warn(`Subscription ${subscriptionId} not found`);
      return;
    }

    // Skip if subscription is not active
    if (subscription.status !== 'ACTIVE') {
      logger.info(`Subscription ${subscription.name} is not active, skipping`);
      return;
    }

    // Check if we should send a reminder today
    const { shouldSend, daysUntilRenewal } = shouldSendReminderToday(
      subscription.renewalDate,
      subscription.reminderDaysBefore
    );

    if (!shouldSend) {
      logger.debug(`No reminder needed for ${subscription.name} today`);
      return;
    }

    const user = subscription.user;
    const prefs = user.notificationPrefs;

    // Check quiet hours
    if (prefs && isInQuietHours(prefs.timezone, prefs.quietHoursStart, prefs.quietHoursEnd)) {
      logger.info(`User ${user.email} is in quiet hours, skipping notifications`);
      return;
    }

    // Check if we already sent a reminder today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadySentToday = await prisma.notification.findFirst({
      where: {
        subscriptionId: subscription.id,
        createdAt: {
          gte: today,
        },
        status: 'SENT',
      },
    });

    if (alreadySentToday) {
      logger.info(`Already sent reminder for ${subscription.name} today`);
      return;
    }

    logger.info(
      `Processing reminder for ${subscription.name} (${daysUntilRenewal} days until renewal)`
    );

    // Determine notification type
    const isUrgent = daysUntilRenewal <= 1;

    // Send email notification
    if (!prefs || prefs.emailEnabled) {
      try {
        if (isUrgent) {
          await sendCancellationDeadlineEmail(user, subscription);
        } else {
          await sendRenewalReminderEmail(user, subscription, daysUntilRenewal);
        }
        logger.info(`Email reminder sent for ${subscription.name}`);
      } catch (error) {
        logger.error(`Failed to send email reminder for ${subscription.name}:`, error);
      }
    }

    // Send SMS notification
    if (prefs?.smsEnabled && user.phone && user.phoneVerified) {
      try {
        if (isUrgent) {
          await sendCancellationDeadlineSMS(user, subscription);
        } else {
          await sendRenewalReminderSMS(user, subscription, daysUntilRenewal);
        }
        logger.info(`SMS reminder sent for ${subscription.name}`);
      } catch (error) {
        logger.error(`Failed to send SMS reminder for ${subscription.name}:`, error);
      }
    }

    // Update lastReminderSent
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { lastReminderSent: new Date() },
    });

    // Update cancellation status if reminded
    if (subscription.cancellationStatus === 'NOT_ATTEMPTED') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancellationStatus: 'REMINDED' },
      });
    }
  } catch (error) {
    logger.error(`Error processing reminder for subscription ${subscriptionId}:`, error);
  }
}

/**
 * Find all subscriptions that need reminders and process them
 */
export async function processAllReminders(): Promise<void> {
  logger.info('Starting reminder processing job');

  try {
    // Calculate date range for upcoming renewals (next 30 days)
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Find all active subscriptions with upcoming renewals
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        renewalDate: {
          gte: now,
          lte: futureDate,
        },
      },
      select: {
        id: true,
        name: true,
        renewalDate: true,
        reminderDaysBefore: true,
      },
    });

    logger.info(`Found ${subscriptions.length} active subscriptions with upcoming renewals`);

    // Filter subscriptions that need reminders today
    const subscriptionsNeedingReminders = subscriptions.filter(sub => {
      const { shouldSend } = shouldSendReminderToday(
        sub.renewalDate,
        sub.reminderDaysBefore
      );
      return shouldSend;
    });

    logger.info(`${subscriptionsNeedingReminders.length} subscriptions need reminders today`);

    // Process each subscription
    for (const subscription of subscriptionsNeedingReminders) {
      await processSubscriptionReminder(subscription.id);
    }

    logger.info('Reminder processing job completed');
  } catch (error) {
    logger.error('Error in reminder processing job:', error);
  }
}

/**
 * Get notification history for a user
 */
export async function getNotificationHistory(
  userId: string,
  limit: number = 50
) {
  return prisma.notification.findMany({
    where: {
      subscription: {
        userId,
      },
    },
    include: {
      subscription: {
        select: {
          name: true,
          provider: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(userId: string) {
  const [total, sent, failed, pending] = await Promise.all([
    prisma.notification.count({
      where: { subscription: { userId } },
    }),
    prisma.notification.count({
      where: { subscription: { userId }, status: 'SENT' },
    }),
    prisma.notification.count({
      where: { subscription: { userId }, status: 'FAILED' },
    }),
    prisma.notification.count({
      where: { subscription: { userId }, status: 'PENDING' },
    }),
  ]);

  return {
    total,
    sent,
    failed,
    pending,
    successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
  };
}
