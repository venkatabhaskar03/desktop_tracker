export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-red-500 text-lg shrink-0">⚠</span>
        <span className="text-red-700 text-sm truncate">{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="text-xs px-3 py-1.5 bg-[#012576] hover:bg-[#013aab] rounded-lg text-white transition-colors shrink-0"
      >
        Retry
      </button>
    </div>
  );
}
