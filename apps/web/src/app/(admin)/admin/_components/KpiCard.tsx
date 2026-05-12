import Link from 'next/link';

interface KpiCardProps {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
}

export function KpiCard({ label, value, description, href }: KpiCardProps) {
  const inner = (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${
        href ? 'hover:border-blue-300 hover:shadow-md transition-all cursor-pointer' : ''
      }`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (href) return <Link href={href as any}>{inner}</Link>;
  return inner;
}
