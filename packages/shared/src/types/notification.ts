export enum NotificationType {
  RENEWAL_REMINDER = 'RENEWAL_REMINDER',
  CANCELLATION_REMINDER = 'CANCELLATION_REMINDER',
  CANCELLATION_DEADLINE = 'CANCELLATION_DEADLINE'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Notification {
  id: string;
  subscriptionId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  defaultReminderDays: number[];
  quietHoursStart?: number;
  quietHoursEnd?: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
