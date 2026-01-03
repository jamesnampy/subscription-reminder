import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { CONSTANTS } from '../config/constants.js';

export const getAllSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { status, sortBy = 'renewalDate', order = 'asc' } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: {
        [sortBy as string]: order,
      },
      include: {
        _count: {
          select: { notifications: true },
        },
      },
    });

    res.json({ subscriptions, total: subscriptions.length });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const {
      name,
      provider,
      category,
      cost,
      currency = 'USD',
      billingCycle,
      startDate,
      renewalDate,
      reminderDaysBefore = CONSTANTS.DEFAULT_REMINDER_DAYS,
      detectionMethod = 'MANUAL_ENTRY',
    } = req.body;

    // Validate required fields
    if (!name || !provider || !renewalDate || !billingCycle) {
      throw new AppError(400, 'Missing required fields: name, provider, renewalDate, billingCycle');
    }

    // Validate renewalDate is in the future
    if (new Date(renewalDate) <= new Date()) {
      throw new AppError(400, 'Renewal date must be in the future');
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name,
        provider,
        category,
        cost: cost ? parseFloat(cost) : null,
        currency,
        billingCycle,
        startDate: startDate ? new Date(startDate) : null,
        renewalDate: new Date(renewalDate),
        reminderDaysBefore,
        detectionMethod,
        status: 'ACTIVE',
        cancellationStatus: 'NOT_ATTEMPTED',
      },
    });

    logger.info(`Subscription created: ${subscription.name} for user ${userId}`);

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData = req.body;

    // Check if subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existingSubscription) {
      throw new AppError(404, 'Subscription not found');
    }

    // Validate renewalDate if provided
    if (updateData.renewalDate && new Date(updateData.renewalDate) <= new Date()) {
      throw new AppError(400, 'Renewal date must be in the future');
    }

    // If marking as cancelled, set cancelledAt
    if (updateData.status === 'CANCELLED' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...updateData,
        renewalDate: updateData.renewalDate ? new Date(updateData.renewalDate) : undefined,
        cost: updateData.cost ? parseFloat(updateData.cost) : undefined,
      },
    });

    logger.info(`Subscription updated: ${subscription.name} for user ${userId}`);

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if subscription exists and belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    await prisma.subscription.delete({
      where: { id },
    });

    logger.info(`Subscription deleted: ${subscription.name} for user ${userId}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { days = 30 } = req.query;

    const daysAhead = parseInt(days as string, 10);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        renewalDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        renewalDate: 'asc',
      },
    });

    res.json({ subscriptions, total: subscriptions.length });
  } catch (error) {
    next(error);
  }
};

export const markAsCancelled = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { cancellationStatus, cancellationNotes } = req.body;

    if (!cancellationStatus) {
      throw new AppError(400, 'Cancellation status is required');
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: cancellationStatus === 'SUCCESSFULLY_CANCELLED' ? 'CANCELLED' : subscription.status,
        cancellationStatus,
        cancelledAt: cancellationStatus === 'SUCCESSFULLY_CANCELLED' ? new Date() : null,
        cancellationNotes,
      },
    });

    logger.info(`Subscription cancellation status updated: ${subscription.name} - ${cancellationStatus}`);

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
