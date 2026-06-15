export default function NavBar({ onToggleSidebar }) {
  return (
    <header className="bg-[#012576] px-4 py-3 flex items-center gap-3 shadow-md z-20 relative">
      <button
        onClick={onToggleSidebar}
        className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"
        title="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <h1 className="text-base font-semibold tracking-tight text-white">
        Laptop Monitor Dashboard
      </h1>
    </header>
  );
}
