// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}