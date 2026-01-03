import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { subscriptionService } from '../services/subscription.service';
import { formatCurrency, formatDate, daysUntil } from '../utils/format';
import type { Subscription } from '@subscription-reminder/shared';

export const Dashboard: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allData, upcomingData] = await Promise.all([
        subscriptionService.getAll({ status: 'ACTIVE' }),
        subscriptionService.getUpcoming(30),
      ]);
      setSubscriptions(allData.subscriptions);
      setUpcoming(upcomingData.subscriptions);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (!sub.cost) return sum;
    const cost = Number(sub.cost);
    switch (sub.billingCycle) {
      case 'DAILY':
        return sum + cost * 30;
      case 'WEEKLY':
        return sum + cost * 4;
      case 'MONTHLY':
        return sum + cost;
      case 'QUARTERLY':
        return sum + cost / 3;
      case 'YEARLY':
        return sum + cost / 12;
      default:
        return sum;
    }
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage your subscription renewals
            </p>
          </div>
          <Link to="/subscriptions/new">
            <Button variant="primary">+ Add Subscription</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">{subscriptions.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(totalMonthlyCost)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yearly Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(totalYearlyCost)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming (30 days)</p>
                <p className="text-2xl font-semibold text-gray-900">{upcoming.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Renewals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Renewals</h2>
            <Link to="/subscriptions" className="text-sm text-primary-600 hover:text-primary-700">
              View all subscriptions →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎉</span>
                <p className="text-gray-600">No subscriptions renewing in the next 30 days!</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcoming.slice(0, 5).map((subscription) => {
                const days = daysUntil(subscription.renewalDate);
                const isUrgent = days <= 3;

                return (
                  <Link key={subscription.id} to={`/subscriptions/${subscription.id}`}>
                    <Card className={isUrgent ? 'border-l-4 border-red-500' : ''}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {subscription.name}
                            </h3>
                            {isUrgent && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{subscription.provider}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {subscription.cost
                              ? formatCurrency(Number(subscription.cost), subscription.currency)
                              : 'N/A'}
                          </p>
                          <p className={`text-sm ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {days === 0
                              ? 'Renews today'
                              : days === 1
                              ? 'Renews tomorrow'
                              : `Renews in ${days} days`}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(subscription.renewalDate)}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {subscriptions.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚀</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Subscription Reminder!
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first subscription to track renewal dates and costs.
              </p>
              <Link to="/subscriptions/new">
                <Button variant="primary">Add Your First Subscription</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
