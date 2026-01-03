import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { Subscription, User } from '@prisma/client';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  if (!resend) {
    logger.warn('Resend API key not configured, email not sent');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Subscription Reminder <noreply@updates.example.com>',
      to,
      subject,
      html,
    });

    if (error) {
      logger.error('Failed to send email:', error);
      return false;
    }

    logger.info(`Email sent successfully to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export async function sendRenewalReminderEmail(
  user: User,
  subscription: Subscription,
  daysUntilRenewal: number
): Promise<boolean> {
  const subject = `Reminder: ${subscription.name} renews in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .subscription-details {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #4a5568;
          }
          .value {
            color: #2d3748;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 5px;
            font-weight: 600;
          }
          .button-secondary {
            background: #48bb78;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🔔 Subscription Renewal Reminder</h1>
        </div>

        <div class="content">
          <p>Hi ${user.firstName || 'there'},</p>

          <p>This is a friendly reminder that your <strong>${subscription.name}</strong> subscription will renew soon.</p>

          <div class="subscription-details">
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${subscription.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Provider:</span>
              <span class="value">${subscription.provider}</span>
            </div>
            ${subscription.cost ? `
            <div class="detail-row">
              <span class="label">Cost:</span>
              <span class="value">${formatCurrency(Number(subscription.cost), subscription.currency)}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Billing Cycle:</span>
              <span class="value">${subscription.billingCycle}</span>
            </div>
            <div class="detail-row">
              <span class="label">Renewal Date:</span>
              <span class="value"><strong>${formatDate(subscription.renewalDate)}</strong></span>
            </div>
            <div class="detail-row">
              <span class="label">Days Until Renewal:</span>
              <span class="value"><strong style="color: #e53e3e;">${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}</strong></span>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Important:</strong> If you want to cancel this subscription, make sure to do so before ${formatDate(subscription.renewalDate)} to avoid being charged.
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.APP_URL}/subscriptions/${subscription.id}" class="button">View Subscription</a>
            <a href="${env.APP_URL}/subscriptions/${subscription.id}/cancel" class="button button-secondary">Mark as Cancelled</a>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            You're receiving this email because you set up a reminder for this subscription.
            You can manage your notification preferences in your account settings.
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Subscription Reminder App</p>
          <p>
            <a href="${env.APP_URL}/settings/notifications" style="color: #667eea;">Notification Settings</a> |
            <a href="${env.APP_URL}/subscriptions" style="color: #667eea;">View All Subscriptions</a>
          </p>
        </div>
      </body>
    </html>
  `;

  const success = await sendEmail({
    to: user.email,
    subject,
    html,
  });

  // Log notification in database
  try {
    await prisma.notification.create({
      data: {
        subscriptionId: subscription.id,
        type: 'RENEWAL_REMINDER',
        channel: 'EMAIL',
        status: success ? 'SENT' : 'FAILED',
        scheduledFor: new Date(),
        sentAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage: success ? null : 'Failed to send email',
      },
    });
  } catch (error) {
    logger.error('Failed to log notification:', error);
  }

  return success;
}

export async function sendWelcomeEmail(user: User): Promise<boolean> {
  const subject = 'Welcome to Subscription Reminder!';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .feature {
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
            background: #f7fafc;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">👋 Welcome to Subscription Reminder!</h1>
        </div>

        <div class="content">
          <p>Hi ${user.firstName || 'there'},</p>

          <p>Thanks for signing up! We're excited to help you take control of your subscriptions and never miss a cancellation deadline again.</p>

          <h2>Here's what you can do:</h2>

          <div class="feature">
            <strong>📝 Track Subscriptions</strong><br>
            Add all your subscriptions with renewal dates, costs, and billing cycles.
          </div>

          <div class="feature">
            <strong>🔔 Get Reminders</strong><br>
            Receive email and SMS notifications before your subscriptions renew.
          </div>

          <div class="feature">
            <strong>✅ Track Cancellations</strong><br>
            Mark which subscriptions you successfully cancelled and which ones you forgot.
          </div>

          <div class="feature">
            <strong>📊 View Analytics</strong><br>
            See how much you're spending on subscriptions each month.
          </div>

          <div style="text-align: center;">
            <a href="${env.APP_URL}/subscriptions/new" class="button">Add Your First Subscription</a>
          </div>

          <p style="margin-top: 30px; color: #718096;">
            Need help getting started? Check out our <a href="${env.APP_URL}/help">help guide</a> or reply to this email.
          </p>

          <p>Happy tracking!<br>The Subscription Reminder Team</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
}

export async function sendCancellationDeadlineEmail(
  user: User,
  subscription: Subscription
): Promise<boolean> {
  const subject = `⚠️ Last chance to cancel ${subscription.name}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #e53e3e;
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .urgent {
            background: #fff5f5;
            border: 2px solid #e53e3e;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background: #e53e3e;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">⚠️ Urgent: Subscription Renewing Tomorrow</h1>
        </div>

        <div class="content">
          <p>Hi ${user.firstName || 'there'},</p>

          <div class="urgent">
            <h2 style="color: #e53e3e; margin-top: 0;">Your ${subscription.name} subscription renews tomorrow!</h2>
            <p style="font-size: 18px; margin: 10px 0;">
              Renewal Date: <strong>${formatDate(subscription.renewalDate)}</strong>
            </p>
            ${subscription.cost ? `
              <p style="font-size: 18px; margin: 10px 0;">
                Amount: <strong>${formatCurrency(Number(subscription.cost), subscription.currency)}</strong>
              </p>
            ` : ''}
          </div>

          <p><strong>This is your last chance to cancel</strong> if you don't want to continue with this subscription.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.APP_URL}/subscriptions/${subscription.id}/cancel" class="button">Mark as Cancelled</a>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            Already cancelled? Let us know by clicking the button above so we can track it!
          </p>
        </div>
      </body>
    </html>
  `;

  const success = await sendEmail({
    to: user.email,
    subject,
    html,
  });

  // Log notification
  try {
    await prisma.notification.create({
      data: {
        subscriptionId: subscription.id,
        type: 'CANCELLATION_DEADLINE',
        channel: 'EMAIL',
        status: success ? 'SENT' : 'FAILED',
        scheduledFor: new Date(),
        sentAt: success ? new Date() : null,
        failedAt: success ? null : new Date(),
        errorMessage: success ? null : 'Failed to send email',
      },
    });
  } catch (error) {
    logger.error('Failed to log notification:', error);
  }

  return success;
}
