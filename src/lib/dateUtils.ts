import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

export function formatDateRO(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd-MM-yyyy', { locale: ro });
  } catch {
    return dateString;
  }
}

export function formatDateLongRO(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMMM yyyy', { locale: ro });
  } catch {
    return dateString;
  }
}

export function getYearFromDate(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    return date.getFullYear();
  } catch {
    return null;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
