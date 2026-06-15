const TAB_LABELS = {
  activity:     "Activity",
  loginlogout:  "Login / Logout",
  applications: "Applications",
  usb:          "USB Events",
};

const TAB_ICONS = {
  activity:     "💻",
  loginlogout:  "🔐",
  applications: "📦",
  usb:          "🔌",
};

export default function TabBar({ tabs, active, onSelect }) {
  return (
    <nav className="flex flex-col gap-1 w-48 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left rounded-lg transition-colors w-full
            ${active === tab
              ? "bg-[#012576] text-white"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#012576]"
            }`}
        >
          <span>{TAB_ICONS[tab]}</span>
          {TAB_LABELS[tab]}
        </button>
      ))}
    </nav>
  );
}
