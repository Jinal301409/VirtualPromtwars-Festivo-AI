/**
 * Format number into Indian Rupee Currency representation
 * e.g., 1500000 -> ₹15,00,000
 */
export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount)) return '₹0';
  
  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Standard Indian comma system
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string into human readable format like "24 Nov 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'TBD';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates countdown or elapsed days from target date
 */
export function getCountdown(targetDateString: string): {
  days: number;
  isPast: boolean;
  statusText: string;
} {
  if (!targetDateString) return { days: 0, isPast: false, statusText: 'No date set' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = targetDateString.split('-');
  let target: Date;
  if (parts.length === 3) {
    target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    target = new Date(targetDateString);
  }

  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, isPast: false, statusText: 'Today is the big day!' };
  }
  if (diffDays === 1) {
    return { days: 1, isPast: false, statusText: 'Tomorrow!' };
  }
  if (diffDays > 0) {
    return { days: diffDays, isPast: false, statusText: `${diffDays} days remaining` };
  }
  return { days: Math.abs(diffDays), isPast: true, statusText: `${Math.abs(diffDays)} days ago` };
}

/**
 * Calculate target milestone date relative to event date
 */
export function calculateDueDate(eventDateString: string, daysBefore: number): string {
  try {
    const parts = eventDateString.split('-');
    const eventDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    eventDate.setDate(eventDate.getDate() - daysBefore);
    const y = eventDate.getFullYear();
    const m = String(eventDate.getMonth() + 1).padStart(2, '0');
    const d = String(eventDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return eventDateString;
  }
}
