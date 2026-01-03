import { api } from './api';
import type {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@subscription-reminder/shared';

export const subscriptionService = {
  async getAll(params?: { status?: string; sortBy?: string; order?: string }) {
    const response = await api.get<{ subscriptions: Subscription[]; total: number }>(
      '/api/subscriptions',
      { params }
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Subscription>(`/api/subscriptions/${id}`);
    return response.data;
  },

  async getUpcoming(days: number = 30) {
    const response = await api.get<{ subscriptions: Subscription[]; total: number }>(
      '/api/subscriptions/upcoming',
      { params: { days } }
    );
    return response.data;
  },

  async create(data: CreateSubscriptionDto) {
    const response = await api.post<Subscription>('/api/subscriptions', data);
    return response.data;
  },

  async update(id: string, data: UpdateSubscriptionDto) {
    const response = await api.patch<Subscription>(`/api/subscriptions/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/api/subscriptions/${id}`);
  },

  async markAsCancelled(
    id: string,
    data: { cancellationStatus: string; cancellationNotes?: string }
  ) {
    const response = await api.post<Subscription>(
      `/api/subscriptions/${id}/cancel`,
      data
    );
    return response.data;
  },
};
