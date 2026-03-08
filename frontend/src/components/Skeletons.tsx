export function EmployeeListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function FeedbackFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32" />
    </div>
  );
}

export function FeedbackListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
  );
}
