const SECTIONS = [
  { key: "activity",     label: "System Health",  icon: "💻" },
  { key: "loginlogout",  label: "Login Events",   icon: "🔐" },
  { key: "applications", label: "App Records",    icon: "📦" },
  { key: "usb",          label: "USB Events",     icon: "🔌" },
];

function StatCard({ label, icon, count, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-white bg-[#012576] rounded-full px-2 py-0.5">last 50</span>
      </div>
      <span className="text-3xl font-bold text-black">
        {loading ? (
          <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" />
        ) : (
          count ?? 0
        )}
      </span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

export default function StatsGrid({ data, loading }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {SECTIONS.map(({ key, label, icon }) => (
        <StatCard
          key={key}
          label={label}
          icon={icon}
          count={data[key]?.length}
          loading={loading[key]}
        />
      ))}
    </div>
  );
}
