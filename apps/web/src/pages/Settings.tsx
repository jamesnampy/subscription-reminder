import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';

export const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account and notification preferences
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <p className="text-gray-600 mb-4">
            Configure how you want to receive subscription reminders.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              🚧 Notification preferences coming soon!
            </p>
            <p className="text-sm text-blue-700 mt-2">
              You'll be able to configure email and SMS notifications, set quiet hours, and customize your reminder schedule.
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <p className="text-gray-600">
            View and manage your account details.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              🚧 Account settings coming soon!
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
