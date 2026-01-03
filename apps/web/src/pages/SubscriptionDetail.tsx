import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { formatCurrency, formatDate, daysUntil, getBillingCycleLabel, getCancellationStatusLabel } from '../utils/format';

export const SubscriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSubscription, fetchSubscription, deleteSubscription, markAsCancelled, isLoading } = useSubscriptionStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState('');
  const [cancellationNotes, setCancellationNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubscription(id);
    }
  }, [id, fetchSubscription]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSubscription(id);
      navigate('/subscriptions');
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    }
  };

  const handleMarkAsCancelled = async () => {
    if (!id || !cancellationStatus) return;
    try {
      await markAsCancelled(id, cancellationStatus, cancellationNotes);
      setShowCancelModal(false);
      fetchSubscription(id);
    } catch (error) {
      console.error('Failed to update cancellation status:', error);
    }
  };

  if (isLoading || !currentSubscription) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscription...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const subscription = currentSubscription;
  const days = daysUntil(subscription.renewalDate);
  const isUrgent = days <= 3 && days >= 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subscription.name}</h1>
            <p className="mt-1 text-sm text-gray-600">{subscription.provider}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/subscriptions/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          </div>
        </div>

        {/* Urgent Alert */}
        {isUrgent && subscription.status === 'ACTIVE' && (
          <Alert
            type="warning"
            message={`⚠️ This subscription renews in ${days} day${days !== 1 ? 's' : ''}! Cancel before ${formatDate(subscription.renewalDate)} if needed.`}
          />
        )}

        {/* Subscription Details */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{subscription.status}</p>
            </div>

            {subscription.category && (
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{subscription.category}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Cost</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {subscription.cost
                  ? formatCurrency(Number(subscription.cost), subscription.currency)
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Billing Cycle</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {getBillingCycleLabel(subscription.billingCycle)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Next Renewal Date</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatDate(subscription.renewalDate)}
              </p>
              {subscription.status === 'ACTIVE' && (
                <p className={`text-sm mt-1 ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                  {days === 0 ? 'Renews today' : days === 1 ? 'Renews tomorrow' : `${days} days`}
                </p>
              )}
            </div>

            {subscription.startDate && (
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-medium text-gray-900 mt-1">
                  {formatDate(subscription.startDate)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Reminder Days</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {subscription.reminderDaysBefore.join(', ')} days before
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Cancellation Status</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {getCancellationStatusLabel(subscription.cancellationStatus)}
              </p>
            </div>
          </div>

          {subscription.cancellationNotes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">Cancellation Notes</p>
              <p className="text-gray-900 mt-2">{subscription.cancellationNotes}</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        {subscription.status === 'ACTIVE' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <Button
                variant="success"
                onClick={() => {
                  setShowCancelModal(true);
                  setCancellationStatus('SUCCESSFULLY_CANCELLED');
                }}
              >
                ✓ Mark as Cancelled
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelModal(true);
                  setCancellationStatus('FORGOT_TO_CANCEL');
                }}
              >
                Forgot to Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelModal(true);
                  setCancellationStatus('DECIDED_TO_KEEP');
                }}
              >
                Decided to Keep
              </Button>
            </div>
          </Card>
        )}

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Subscription"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{subscription.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Modal>

        {/* Cancellation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Update Cancellation Status"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={cancellationStatus}
                onChange={(e) => setCancellationStatus(e.target.value)}
              >
                <option value="">Select status...</option>
                <option value="SUCCESSFULLY_CANCELLED">Successfully Cancelled</option>
                <option value="FORGOT_TO_CANCEL">Forgot to Cancel</option>
                <option value="DECIDED_TO_KEEP">Decided to Keep</option>
              </select>
            </div>

            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                className="input"
                rows={3}
                value={cancellationNotes}
                onChange={(e) => setCancellationNotes(e.target.value)}
                placeholder="Add any notes about the cancellation..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="primary" onClick={handleMarkAsCancelled} className="flex-1">
                Save
              </Button>
              <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
