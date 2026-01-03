import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// CRUD operations
router.get('/', subscriptionController.getAllSubscriptions);
router.get('/upcoming', subscriptionController.getUpcomingRenewals);
router.get('/:id', subscriptionController.getSubscription);
router.post('/', subscriptionController.createSubscription);
router.patch('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

// Cancellation tracking
router.post('/:id/cancel', subscriptionController.markAsCancelled);

export default router;
