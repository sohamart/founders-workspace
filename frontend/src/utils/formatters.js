export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
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
    return { label: `Overdue by ${hours}h`, isOverdue: true, urgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return { label: `${days}d ${hours % 24}h left`, isOverdue: false, urgent: days < 1 };
  }
  return { label: `${hours}h ${minutes}m left`, isOverdue: false, urgent: hours < 6 };
};
