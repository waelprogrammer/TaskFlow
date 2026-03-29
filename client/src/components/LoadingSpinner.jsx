export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };
  return (
    <div className={`${sizes[size]} rounded-full border-indigo-500 border-t-transparent animate-spin`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-4 w-2/3 rounded-lg" />
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-4/5 rounded-lg" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex justify-between">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
