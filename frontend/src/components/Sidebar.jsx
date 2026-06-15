const TABS = [
  { key: "dashboard",    label: "Dashboard",      icon: "📊" },
  { key: "activity",     label: "Activity",       icon: "💻" },
  { key: "loginlogout",  label: "Login / Logout", icon: "🔐" },
  { key: "applications", label: "Applications",   icon: "📦" },
  { key: "usb",          label: "USB Events",     icon: "🔌" },
];

export default function Sidebar({ open, active, onSelect }) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shrink-0
        ${open ? "w-52" : "w-0"}`}
    >
      <div className="w-52 flex flex-col h-full">
        <div className="px-3 py-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-2 mb-2">
            Navigation
          </p>
          <nav className="flex flex-col gap-1">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-left whitespace-nowrap
                  ${active === key
                    ? "bg-[#012576] text-white"
                    : "text-gray-600 hover:bg-blue-50 hover:text-[#012576]"
                  }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
