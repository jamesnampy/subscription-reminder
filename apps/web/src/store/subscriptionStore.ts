import { create } from 'zustand';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, CreateSubscriptionDto } from '@subscription-reminder/shared';

interface SubscriptionState {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  fetchSubscriptions: (params?: any) => Promise<void>;
  fetchSubscription: (id: string) => Promise<void>;
  createSubscription: (data: CreateSubscriptionDto) => Promise<void>;
  updateSubscription: (id: string, data: any) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  markAsCancelled: (id: string, status: string, notes?: string) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  currentSubscription: null,
  isLoading: false,
  error: null,

  fetchSubscriptions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await subscriptionService.getAll(params);
      set({ subscriptions: data.subscriptions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch subscriptions',
        isLoading: false,
      });
    }
  },

  fetchSubscription: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const subscription = await subscriptionService.getById(id);
      set({ currentSubscription: subscription, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch subscription',
        isLoading: false,
      });
    }
  },

  createSubscription: async (data: CreateSubscriptionDto) => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.create(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSubscription: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.update(id, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSubscription: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.delete(id);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  markAsCancelled: async (id: string, status: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionService.markAsCancelled(id, {
        cancellationStatus: status,
        cancellationNotes: notes,
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update cancellation status',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
