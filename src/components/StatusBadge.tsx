import type { ChickenStatus } from '../ChickenStatus';

interface StatusBadgeProps {
  status: string | null;
}

const STATUS_CLASSES: Record<ChickenStatus, string> = {
  active: 'status-active',
  broody: 'status-broody',
  molting: 'status-molting',
  sick: 'status-sick',
  rehomed: 'status-rehomed',
  deceased: 'status-deceased',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toLowerCase().trim();
  const statusClass =
    STATUS_CLASSES[normalized as ChickenStatus] ?? 'status-default';

  return (
    <span className={`status-badge ${statusClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}