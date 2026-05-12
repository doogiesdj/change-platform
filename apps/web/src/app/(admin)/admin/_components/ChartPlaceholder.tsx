interface ChartPlaceholderProps {
  label?: string;
  height?: number;
}

export function ChartPlaceholder({ label = '차트 (준비 중)', height = 200 }: ChartPlaceholderProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400"
      style={{ height }}
    >
      {label}
    </div>
  );
}
