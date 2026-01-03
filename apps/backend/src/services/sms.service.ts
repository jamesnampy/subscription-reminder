import twilio from 'twilio';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { Subscription, User } from '@prisma/client';

const twilioClient =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

interface SMSParams {
  to: string;
  body: string;
}

async function sendSMS({ to, body }: SMSParams): Promise<boolean> {
  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio not configured, SMS not sent');
    return false;
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });

    logger.info(`SMS sent successfully to ${to}: ${message.sid}`);
    return message.status !== 'failed' && message.status !== 'undelivered';
  } catch (error) {
    logger.error('Error sending SMS:', error);
    return false;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export async function sendRenewalReminderSMS(
  user: User,
  subscription: Subscription,
  daysUntilRenewal: number
): Promise<boolean> {
  if (!user.phone || !user.phoneVerified) {
    logger.info(`User ${user.email} does not have a verified phone number`);
    return false;
  }

  const costInfo = subscription.cost
    ? ` (${formatCurrency(Number(subscription.cost), subscription.currency)})`
    : '';

  const body = `Reminder: Your ${subscription.name} subscription renews in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}${costInfo} on ${formatDate(subscription.renewalDate)}. Cancel before this date if needed. ${env.APP_URL}/subscriptions/${subscription.id}`;

  const success = await sendSMS({
    to: user.phone,
    body,
  });

  // Log notification in database
  try {
    await prisma.notification.create({
      data: {
        subscriptionId: subscription.id,
        type: 'RENEWAL_REMINDER',
        channel: 'SMS',
        status: success ? 'SENT' : 'FAILED',
        scheduledFor: new Date(),
        sentAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage: success ? null : 'Failed to send SMS',
      },
    });
  } catch (error) {
    logger.error('Failed to log notification:', error);
  }

  return success;
}

export async function sendCancellationDeadlineSMS(
  user: User,
  subscription: Subscription
): Promise<boolean> {
  if (!user.phone || !user.phoneVerified) {
    logger.info(`User ${user.email} does not have a verified phone number`);
    return false;
  }

  const costInfo = subscription.cost
    ? ` (${formatCurrency(Number(subscription.cost), subscription.currency)})`
    : '';

  const body = `URGENT: ${subscription.name} renews TOMORROW${costInfo}! This is your last chance to cancel. ${env.APP_URL}/subscriptions/${subscription.id}/cancel`;

  const success = await sendSMS({
    to: user.phone,
    body,
  });

  // Log notification
  try {
    await prisma.notification.create({
      data: {
        subscriptionId: subscription.id,
        type: 'CANCELLATION_DEADLINE',
        channel: 'SMS',
        status: success ? 'SENT' : 'FAILED',
        scheduledFor: new Date(),
        sentAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage: success ? null : 'Failed to send SMS',
      },
    });
  } catch (error) {
    logger.error('Failed to log notification:', error);
  }

  return success;
}

export async function sendVerificationSMS(phone: string, code: string): Promise<boolean> {
  const body = `Your Subscription Reminder verification code is: ${code}. This code expires in 10 minutes.`;

  return sendSMS({
    to: phone,
    body,
  });
}
