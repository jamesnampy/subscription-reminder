import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, formatStr: string = 'MMM d, yyyy'): string => {
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const daysUntil = (date: Date | string): number => {
  return differenceInDays(new Date(date), new Date());
};

export const getBillingCycleLabel = (cycle: string): string => {
  const labels: Record<string, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly',
  };
  return labels[cycle] || cycle;
};

export const getCancellationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    NOT_ATTEMPTED: 'Not Attempted',
    REMINDED: 'Reminded',
    SUCCESSFULLY_CANCELLED: 'Successfully Cancelled',
    FORGOT_TO_CANCEL: 'Forgot to Cancel',
    DECIDED_TO_KEEP: 'Decided to Keep',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    EXPIRED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
