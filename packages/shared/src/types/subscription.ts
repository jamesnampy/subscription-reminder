export enum BillingCycle {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED'
}

export enum CancellationStatus {
  NOT_ATTEMPTED = 'NOT_ATTEMPTED',
  REMINDED = 'REMINDED',
  SUCCESSFULLY_CANCELLED = 'SUCCESSFULLY_CANCELLED',
  FORGOT_TO_CANCEL = 'FORGOT_TO_CANCEL',
  DECIDED_TO_KEEP = 'DECIDED_TO_KEEP'
}

export enum DetectionMethod {
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  EMAIL_PARSING = 'EMAIL_PARSING',
  DOM_DETECTION = 'DOM_DETECTION',
  BANK_IMPORT = 'BANK_IMPORT'
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  provider: string;
  category?: string;
  cost?: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate?: Date;
  renewalDate: Date;
  lastReminderSent?: Date;
  status: SubscriptionStatus;
  cancellationStatus: CancellationStatus;
  cancelledAt?: Date;
  cancellationNotes?: string;
  detectionMethod?: DetectionMethod;
  detectionSource?: string;
  reminderDaysBefore: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionDto {
  name: string;
  provider: string;
  category?: string;
  cost?: number;
  currency?: string;
  billingCycle: BillingCycle;
  startDate?: Date;
  renewalDate: Date;
  reminderDaysBefore?: number[];
  detectionMethod?: DetectionMethod;
}

export interface UpdateSubscriptionDto {
  name?: string;
  provider?: string;
  category?: string;
  cost?: number;
  currency?: string;
  billingCycle?: BillingCycle;
  renewalDate?: Date;
  status?: SubscriptionStatus;
  cancellationStatus?: CancellationStatus;
  cancelledAt?: Date;
  cancellationNotes?: string;
  reminderDaysBefore?: number[];
}
