const STATUS_OPTIONS = [
  { value: "",           label: "All Statuses" },
  { value: "active",     label: "Active" },
  { value: "locked",     label: "Locked" },
  { value: "logged_out", label: "Logged Out" },
  { value: "failed",     label: "Failed" },
];

export default function FilterBar({
  filters,
  onChange,
  onApply,
  onClear,
  resultCount,
  totalCount,
  showHostname  = true,
  showUsername  = true,
  showStatus    = false,
  showDateFrom  = false,
  showDateTo    = false,
}) {
  const hasActiveFilter =
    (showHostname && filters.hostname?.trim()) ||
    (showUsername && filters.username?.trim()) ||
    (showStatus   && filters.status) ||
    (showDateFrom && filters.date_from?.trim()) ||
    (showDateTo   && filters.date_to?.trim());

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Filters</p>

      <div className="flex flex-wrap items-end gap-3">
        {showHostname && (
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hostname</label>
            <input
              type="text"
              placeholder="e.g. DESKTOP-ABC123"
              value={filters.hostname || ""}
              onChange={(e) => onChange({ ...filters, hostname: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onApply()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black
                         focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576]
                         placeholder:text-gray-400"
            />
          </div>
        )}

        {showUsername && (
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
            <input
              type="text"
              placeholder="e.g. john.doe"
              value={filters.username || ""}
              onChange={(e) => onChange({ ...filters, username: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onApply()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black
                         focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576]
                         placeholder:text-gray-400"
            />
          </div>
        )}

        {showStatus && (
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {showDateFrom && (
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Date</label>
            <input
              type="date"
              value={filters.date_from || ""}
              onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black
                         focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576]"
            />
          </div>
        )}

        {showDateTo && (
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To Date</label>
            <input
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black
                         focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576]"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pb-0.5">
          <button
            onClick={onApply}
            className="px-4 py-2 bg-[#012576] hover:bg-[#013aab] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
          {hasActiveFilter && (
            <button
              onClick={onClear}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {hasActiveFilter && (
          <div className="flex items-center pb-0.5 ml-auto">
            <span className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-[#012576]">{resultCount}</span>
              {" "}of{" "}
              <span className="font-semibold">{totalCount}</span>
              {" "}records
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
