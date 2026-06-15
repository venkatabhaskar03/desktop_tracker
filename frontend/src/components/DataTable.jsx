import LoadingSpinner from "./LoadingSpinner";
import ErrorBanner from "./ErrorBanner";

function formatValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") return Number.isInteger(val) ? val : val.toFixed(2);
  return String(val);
}

export default function DataTable({ tab, rows, loading, error, onRefresh }) {
  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorBanner message={error} onRetry={onRefresh} />;

  if (!rows.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">No records found for this section.</p>
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-500">{rows.length} record{rows.length !== 1 ? "s" : ""}</span>
        <button
          onClick={onRefresh}
          className="text-xs px-3 py-1.5 bg-[#012576] hover:bg-[#013aab] rounded-lg text-white transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#012576] text-white uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 whitespace-nowrap font-medium">
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-black whitespace-nowrap max-w-xs truncate">
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
