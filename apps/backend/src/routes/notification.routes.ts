import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);
router.patch('/preferences', notificationController.updateNotificationPreferences);

// Notification history and stats
router.get('/history', notificationController.getHistory);
router.get('/stats', notificationController.getStats);

// Test notification
router.post('/test', notificationController.testNotification);

export default router;
