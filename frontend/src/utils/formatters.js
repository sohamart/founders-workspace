export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const formatCountdown = (targetDateStr, isCompleted = false) => {
  if (isCompleted) {
    return { label: 'Delivered ✓', isOverdue: false, urgent: false, isCompleted: true };
  }
  if (!targetDateStr) return { label: 'No Deadline', isOverdue: false, urgent: false };
  const diff = new Date(targetDateStr).getTime() - Date.now();

  if (diff <= 0) {
    const overdueDiff = Math.abs(diff);
    const hours = Math.floor(overdueDiff / (1000 * 60 * 60));
    const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) {
      return { label: `Overdue by ${minutes}m`, isOverdue: true, urgent: true };
    }
    return { label: `Overdue by ${hours}h ${minutes}m`, isOverdue: true, urgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return { label: `${days}d ${hours % 24}h left`, isOverdue: false, urgent: days < 1 };
  }
  if (hours === 0 && minutes < 10) {
    return { label: `${minutes}m ${seconds}s left`, isOverdue: false, urgent: true };
  }
  return { label: `${hours}h ${minutes}m left`, isOverdue: false, urgent: hours < 6 };
};

/**
 * Format date for <input type="datetime-local"> in the user's LOCAL timezone
 * Ensures YYYY-MM-DDTHH:mm representation preserves local hours/minutes
 */
export const toLocalDatetimeInputValue = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert local datetime-local string to UTC ISO string before sending to backend.
 * Fixes timezone drift bug where e.g. 6:00 AM entered in IST displays as 11:30.
 */
export const toUtcIsoString = (localDatetimeStr) => {
  if (!localDatetimeStr) return null;
  if (typeof localDatetimeStr === 'string' && (localDatetimeStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(localDatetimeStr))) {
    return localDatetimeStr;
  }
  const d = new Date(localDatetimeStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/**
 * Evaluate Meeting Link Window Status
 * Rule: Link paste window opens 5 minutes before scheduledTime and lasts 10 minutes total (T - 5m to T + 5m)
 */
export const getMeetingLinkWindowStatus = (scheduledTime, meetLink) => {
  if (!scheduledTime) {
    return {
      status: 'no_schedule',
      canSubmit: false,
      canJoin: false,
      hasLink: false
    };
  }

  const now = Date.now();
  const meetTime = new Date(scheduledTime).getTime();
  const openTime = meetTime - (5 * 60 * 1000); // 5 min before
  const closeTime = openTime + (10 * 60 * 1000); // 10 min window duration = meetTime + 5 min

  const hasLink = Boolean(meetLink && meetLink.trim());

  if (hasLink) {
    return {
      status: 'ready',
      canSubmit: false,
      canJoin: true,
      hasLink: true,
      openTime,
      closeTime,
      meetLink: meetLink.trim()
    };
  }

  if (now < openTime) {
    const diffMs = openTime - now;
    const diffMins = Math.ceil(diffMs / (60 * 1000));
    return {
      status: 'locked',
      canSubmit: false,
      canJoin: false,
      hasLink: false,
      msUntilOpen: diffMs,
      diffMins,
      openTime,
      closeTime
    };
  }

  if (now >= openTime && now <= closeTime) {
    const diffMs = closeTime - now;
    const remainingMins = Math.floor(diffMs / (60 * 1000));
    const remainingSecs = Math.floor((diffMs % (60 * 1000)) / 1000);
    return {
      status: 'active',
      canSubmit: true,
      canJoin: false,
      hasLink: false,
      msRemaining: diffMs,
      remainingMins,
      remainingSecs,
      timerLabel: `${remainingMins}:${String(remainingSecs).padStart(2, '0')}`,
      openTime,
      closeTime
    };
  }

  // now > closeTime without link
  return {
    status: 'expired',
    canSubmit: false,
    canJoin: false,
    hasLink: false,
    openTime,
    closeTime
  };
};
