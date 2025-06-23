import { format } from 'date-fns';
import { CaseStatus } from "../types/case";

/**
 * Funcție pentru formatarea datelor în formatul local
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy');
};

/**
 * Funcție care returnează data curentă în format ISO
 */
export const currentDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Funcție care returnează data de acum X zile în format ISO
 */
export const daysAgoISO = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Helper pentru culori status
 */
export const getStatusColor = (status: CaseStatus): string => {
  switch(status) {
    case CaseStatus.SUSPECTED:
      return 'text-amber-600';
    case CaseStatus.CONFIRMED:
      return 'text-red-600';
    case CaseStatus.RECOVERED:
      return 'text-green-600';
    case CaseStatus.DECEASED:
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusBadgeClass = (status: CaseStatus): string => {
  switch(status) {
    case CaseStatus.SUSPECTED:
      return 'bg-amber-100 text-amber-800';
    case CaseStatus.CONFIRMED:
      return 'bg-red-100 text-red-800';
    case CaseStatus.RECOVERED:
      return 'bg-green-100 text-green-800';
    case CaseStatus.DECEASED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};