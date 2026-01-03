import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { getNotificationHistory, getNotificationStats } from '../services/notification.service.js';
import { CONSTANTS } from '../config/constants.js';

export const getNotificationPreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          smsEnabled: false,
          defaultReminderDays: CONSTANTS.DEFAULT_REMINDER_DAYS,
          timezone: 'UTC',
        },
      });
    }

    res.json(prefs);
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const {
      emailEnabled,
      smsEnabled,
      defaultReminderDays,
      quietHoursStart,
      quietHoursEnd,
      timezone,
    } = req.body;

    // Validate quiet hours
    if (quietHoursStart !== undefined && (quietHoursStart < 0 || quietHoursStart > 23)) {
      throw new AppError(400, 'quietHoursStart must be between 0 and 23');
    }
    if (quietHoursEnd !== undefined && (quietHoursEnd < 0 || quietHoursEnd > 23)) {
      throw new AppError(400, 'quietHoursEnd must be between 0 and 23');
    }

    // Validate defaultReminderDays
    if (defaultReminderDays && !Array.isArray(defaultReminderDays)) {
      throw new AppError(400, 'defaultReminderDays must be an array');
    }

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        emailEnabled,
        smsEnabled,
        defaultReminderDays,
        quietHoursStart,
        quietHoursEnd,
        timezone,
      },
      create: {
        userId,
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? false,
        defaultReminderDays: defaultReminderDays ?? CONSTANTS.DEFAULT_REMINDER_DAYS,
        quietHoursStart,
        quietHoursEnd,
        timezone: timezone ?? 'UTC',
      },
    });

    logger.info(`Notification preferences updated for user ${userId}`);

    res.json(prefs);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { limit = 50 } = req.query;

    const history = await getNotificationHistory(userId, parseInt(limit as string, 10));

    res.json({ notifications: history, total: history.length });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;

    const stats = await getNotificationStats(userId);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const testNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { channel = 'EMAIL' } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (channel === 'EMAIL') {
      const { sendWelcomeEmail } = await import('../services/email.service.js');
      await sendWelcomeEmail(user);
      res.json({ message: 'Test email sent' });
    } else if (channel === 'SMS') {
      if (!user.phone || !user.phoneVerified) {
        throw new AppError(400, 'Phone number not verified');
      }
      const { sendVerificationSMS } = await import('../services/sms.service.js');
      await sendVerificationSMS(user.phone, '123456');
      res.json({ message: 'Test SMS sent' });
    } else {
      throw new AppError(400, 'Invalid channel');
    }
  } catch (error) {
    next(error);
  }
};
