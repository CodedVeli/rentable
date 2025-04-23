import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy"): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Helper function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

// Helper to safely access nested object properties 
export function safelyGetNestedProperty<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined || current === null ? defaultValue : current;
}
