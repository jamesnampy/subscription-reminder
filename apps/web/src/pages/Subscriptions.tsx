import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { formatCurrency, formatDate, daysUntil, getBillingCycleLabel, getStatusColor } from '../utils/format';

export const Subscriptions: React.FC = () => {
  const { subscriptions, fetchSubscriptions, isLoading } = useSubscriptionStore();
  const [filter, setFilter] = useState('ACTIVE');
  const [sortBy, setSortBy] = useState('renewalDate');

  useEffect(() => {
    fetchSubscriptions({ status: filter === 'ALL' ? undefined : filter, sortBy });
  }, [filter, sortBy, fetchSubscriptions]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage all your subscription services
            </p>
          </div>
          <Link to="/subscriptions/new">
            <Button variant="primary">+ Add Subscription</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Subscriptions' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'PAUSED', label: 'Paused' },
                { value: 'EXPIRED', label: 'Expired' },
              ]}
            />

            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'renewalDate', label: 'Renewal Date' },
                { value: 'name', label: 'Name' },
                { value: 'cost', label: 'Cost' },
                { value: 'createdAt', label: 'Date Added' },
              ]}
            />
          </div>
        </Card>

        {/* Subscription List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscriptions...</p>
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-gray-600 mb-4">No subscriptions found</p>
              <Link to="/subscriptions/new">
                <Button variant="primary">Add Your First Subscription</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => {
              const days = daysUntil(subscription.renewalDate);
              const isUpcoming = days <= 7 && days >= 0;

              return (
                <Link key={subscription.id} to={`/subscriptions/${subscription.id}`}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {subscription.name}
                            </h3>
                            <p className="text-sm text-gray-600">{subscription.provider}</p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                          {subscription.category && (
                            <span className="flex items-center">
                              <span className="mr-1">🏷️</span>
                              {subscription.category}
                            </span>
                          )}
                          <span className="flex items-center">
                            <span className="mr-1">🔄</span>
                            {getBillingCycleLabel(subscription.billingCycle)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        {subscription.cost && (
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(Number(subscription.cost), subscription.currency)}
                          </p>
                        )}

                        {subscription.status === 'ACTIVE' && (
                          <>
                            <p className={`text-sm ${isUpcoming ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                              {days === 0 ? 'Renews today' : days === 1 ? 'Renews tomorrow' : days < 0 ? 'Overdue' : `${days} days`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(subscription.renewalDate)}
                            </p>
                          </>
                        )}

                        {subscription.status === 'CANCELLED' && subscription.cancelledAt && (
                          <p className="text-xs text-gray-500">
                            Cancelled {formatDate(subscription.cancelledAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
