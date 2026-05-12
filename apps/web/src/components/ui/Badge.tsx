import type { PetitionStatus } from '@change/shared';

type BadgeVariant = 'blue' | 'amber' | 'green' | 'red' | 'gray' | 'indigo';

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  indigo: 'bg-indigo-100 text-indigo-800',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_CONFIG: Record<PetitionStatus, { label: string; variant: BadgeVariant }> = {
  review: { label: '검토 중', variant: 'amber' },
  published: { label: '진행 중', variant: 'blue' },
  rejected: { label: '거부됨', variant: 'red' },
  closed: { label: '종료됨', variant: 'gray' },
  achieved: { label: '달성됨', variant: 'green' },
};

export function StatusBadge({ status }: { status: PetitionStatus }) {
  const { label, variant } = STATUS_CONFIG[status] ?? STATUS_CONFIG.review;
  return <Badge variant={variant}>{label}</Badge>;
}
