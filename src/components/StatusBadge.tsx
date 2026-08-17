// src/components/StatusBadge.tsx

export type ChickenStatus =
  | 'active'
  | 'molting'
  | 'broody'
  | 'sick'
  | 'deceased';

interface StatusBadgeProps {
  status: string | null; // Accepting string to gracefully handle legacy/un-migrated DB data
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  // Normalize to handle any existing DB inconsistencies before the check constraint
  const normalizedStatus = status.toLowerCase().trim();

  // Map known statuses to their specific CSS classes
  const statusMap: Record<string, string> = {
    active: 'status-active',
    molting: 'status-molting',
    broody: 'status-broody',
    sick: 'status-sick',
    deceased: 'status-deceased',
  };

  // Fallback to a default gray badge if an unknown string sneaks in
  const statusClass = statusMap[normalizedStatus] || 'status-default';

  return (
    <span className={`status-badge ${statusClass}`}>
      {/* Capitalize the first letter for display purposes */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
