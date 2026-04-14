export default function SkeletonLoader({ count = 6, type = 'job' }) {
  if (type === 'job') return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex gap-3">
            <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )

  if (type === 'card') return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex gap-3 items-center">
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )

  return <div className="skeleton w-full h-40 rounded-2xl" />
}
