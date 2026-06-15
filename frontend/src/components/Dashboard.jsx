import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api";

const METRICS = [
  {
    key:     "total_users",
    label:   "Total Users",
    icon:    "👥",
    desc:    "All users registered in devices",
    color:   "border-[#012576] bg-blue-50",
    numColor:"text-[#012576]",
  },
  {
    key:     "active_users",
    label:   "Active Users",
    icon:    "✅",
    desc:    "online_status = true",
    color:   "border-green-400 bg-green-50",
    numColor:"text-green-700",
  },
  {
    key:     "inactive_users",
    label:   "Inactive Users",
    icon:    "⏸",
    desc:    "online_status = false",
    color:   "border-gray-300 bg-gray-50",
    numColor:"text-gray-700",
  },
  {
    key:     "non_compliant_devices",
    label:   "Non-Compliant Devices",
    icon:    "⚠️",
    desc:    "No sync in last 24 hours",
    color:   "border-red-400 bg-red-50",
    numColor:"text-red-700",
  },
  {
    key:     "devices_synced_today",
    label:   "Devices Synced Today",
    icon:    "🔄",
    desc:    "last_sync within 24 hours",
    color:   "border-indigo-400 bg-indigo-50",
    numColor:"text-indigo-700",
  },
];

function MetricCard({ metric, value, loading }) {
  return (
    <div className={`bg-white border-l-4 ${metric.color} rounded-xl p-5 shadow-sm flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{metric.icon}</span>
        {loading && (
          <span className="w-4 h-4 border-2 border-[#012576] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <span className={`text-4xl font-bold ${metric.numColor}`}>
        {loading ? (
          <span className="inline-block w-12 h-9 bg-gray-200 rounded animate-pulse" />
        ) : (
          (value ?? 0).toLocaleString()
        )}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{metric.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{metric.desc}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">Live snapshot of your monitored environment</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm px-4 py-2 bg-[#012576] hover:bg-[#013aab] text-white rounded-lg transition-colors disabled:opacity-60"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {METRICS.map((metric) => (
          <MetricCard
            key={metric.key}
            metric={metric}
            value={stats?.[metric.key]}
            loading={loading}
          />
        ))}
      </div>

      {/* Summary row */}
      {!loading && stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500 flex flex-wrap gap-6">
          <span>Total devices tracked: <strong className="text-black">{stats.total_devices ?? 0}</strong></span>
          <span>Compliance rate: <strong className="text-black">
            {stats.total_devices
              ? `${Math.round((stats.devices_synced_today / stats.total_devices) * 100)}%`
              : "—"}
          </strong></span>
          <span>User activity: <strong className="text-black">
            {stats.total_users
              ? `${Math.round((stats.active_users / stats.total_users) * 100)}% active`
              : "—"}
          </strong></span>
        </div>
      )}
    </div>
  );
}
