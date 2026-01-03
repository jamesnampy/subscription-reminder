import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type { BillingCycle } from '@subscription-reminder/shared';

export const SubscriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { createSubscription, updateSubscription, fetchSubscription, currentSubscription, isLoading, error, clearError } = useSubscriptionStore();

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: '',
    cost: '',
    currency: 'USD',
    billingCycle: 'MONTHLY' as BillingCycle,
    renewalDate: '',
    startDate: '',
    reminderDaysBefore: '7,3,1',
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchSubscription(id);
    }
  }, [id, isEditMode, fetchSubscription]);

  useEffect(() => {
    if (currentSubscription && isEditMode) {
      setFormData({
        name: currentSubscription.name,
        provider: currentSubscription.provider,
        category: currentSubscription.category || '',
        cost: currentSubscription.cost?.toString() || '',
        currency: currentSubscription.currency,
        billingCycle: currentSubscription.billingCycle,
        renewalDate: currentSubscription.renewalDate.toString().split('T')[0],
        startDate: currentSubscription.startDate?.toString().split('T')[0] || '',
        reminderDaysBefore: currentSubscription.reminderDaysBefore.join(','),
      });
    }
  }, [currentSubscription, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      provider: formData.provider,
      category: formData.category || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      currency: formData.currency,
      billingCycle: formData.billingCycle,
      renewalDate: new Date(formData.renewalDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      reminderDaysBefore: formData.reminderDaysBefore
        .split(',')
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d)),
    };

    try {
      if (isEditMode && id) {
        await updateSubscription(id, data);
      } else {
        await createSubscription(data);
      }
      navigate('/subscriptions');
    } catch (error) {
      // Error is handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Subscription' : 'Add New Subscription'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode
              ? 'Update your subscription details'
              : 'Track a new subscription and get reminders before it renews'}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={clearError} />}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

              <Input
                label="Subscription Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Netflix Premium"
                required
              />

              <Input
                label="Provider"
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="e.g., Netflix"
                required
              />

              <Input
                label="Category (Optional)"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Entertainment, Software, Health"
              />
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cost (Optional)"
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="15.99"
                  step="0.01"
                  min="0"
                />

                <Select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'CAD', label: 'CAD' },
                    { value: 'AUD', label: 'AUD' },
                  ]}
                />
              </div>

              <Select
                label="Billing Cycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                options={[
                  { value: 'DAILY', label: 'Daily' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'QUARTERLY', label: 'Quarterly (every 3 months)' },
                  { value: 'YEARLY', label: 'Yearly' },
                ]}
              />
            </div>

            {/* Dates */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates</h2>

              <Input
                label="Next Renewal Date"
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Start Date (Optional)"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            {/* Reminders */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h2>

              <Input
                label="Remind Me (Days Before Renewal)"
                type="text"
                name="reminderDaysBefore"
                value={formData.reminderDaysBefore}
                onChange={handleChange}
                placeholder="7,3,1"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Comma-separated list of days. For example: 7,3,1 will remind you 7 days, 3 days, and 1 day before renewal.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                {isEditMode ? 'Update Subscription' : 'Add Subscription'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/subscriptions')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
