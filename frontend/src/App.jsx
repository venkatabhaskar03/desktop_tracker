import { useState, useEffect, useCallback, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  fetchActivity,
  fetchLoginLogout,
  fetchApplications,
  fetchUSB,
} from "./api";
import NavBar           from "./components/NavBar";
import Sidebar          from "./components/Sidebar";
import StatsGrid        from "./components/StatsGrid";
import FilterBar        from "./components/FilterBar";
import DataTable        from "./components/DataTable";
import Dashboard        from "./components/Dashboard";
import LoginLogoutForm  from "./components/LoginLogoutForm";
import MigrationNotice  from "./components/MigrationNotice";

const DATA_TABS = ["activity", "loginlogout", "applications", "usb"];

const FETCHERS = {
  activity:     (p) => fetchActivity(p),
  loginlogout:  (p) => fetchLoginLogout(p),
  applications: (p) => fetchApplications(p),
  usb:          ()  => fetchUSB(),
};

const EMPTY_LL_FILTER       = { hostname: "", username: "", status: "" };
const EMPTY_APP_FILTER      = { username: "" };
const EMPTY_ACTIVITY_FILTER = { date_from: "", date_to: "" };

export default function App() {
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [showLLForm,   setShowLLForm]   = useState(false);
  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  // Login/Logout filters
  const [llFilters,        setLlFilters]        = useState(EMPTY_LL_FILTER);
  const [llAppliedFilters, setLlAppliedFilters] = useState(EMPTY_LL_FILTER);

  // Applications filters
  const [appFilters,        setAppFilters]        = useState(EMPTY_APP_FILTER);
  const [appAppliedFilters, setAppAppliedFilters] = useState(EMPTY_APP_FILTER);

  // Activity filters
  const [actFilters,        setActFilters]        = useState(EMPTY_ACTIVITY_FILTER);
  const [actAppliedFilters, setActAppliedFilters] = useState(EMPTY_ACTIVITY_FILTER);

  const load = useCallback(async (tab, params = {}) => {
    setLoading((prev) => ({ ...prev, [tab]: true }));
    setErrors((prev)  => ({ ...prev, [tab]: null }));
    try {
      const res = await FETCHERS[tab](params);
      setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Unknown error";
      setErrors((prev) => ({ ...prev, [tab]: msg }));
      toast.error(`Failed to load ${tab}: ${msg}`);
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
    }
  }, []);

  useEffect(() => { DATA_TABS.forEach((t) => load(t)); }, [load]);

  // ── Activity client-side filter ──────────────────────────────────
  const actRows = useMemo(() => {
    const rows = data.activity || [];
    const { date_from, date_to } = actAppliedFilters;
    if (!date_from && !date_to) return rows;
    return rows.filter((row) => {
      const ts = Object.values(row).find((v) => typeof v === "string" && /\d{4}-\d{2}-\d{2}/.test(v));
      if (!ts) return true;
      const d = ts.slice(0, 10);
      if (date_from && d < date_from) return false;
      if (date_to   && d > date_to)   return false;
      return true;
    });
  }, [data.activity, actAppliedFilters]);

  // ── Login/Logout client-side filter ──────────────────────────────
  const llRows = useMemo(() => {
    const rows = data.loginlogout || [];
    const { hostname, username, status } = llAppliedFilters;
    return rows.filter((row) => {
      const matchHost   = !hostname || row.hostname?.toLowerCase().includes(hostname.toLowerCase());
      const matchUser   = !username || row.username?.toLowerCase().includes(username.toLowerCase());
      const matchStatus = !status   || row.status === status;
      return matchHost && matchUser && matchStatus;
    });
  }, [data.loginlogout, llAppliedFilters]);

  // ── Applications client-side filter ──────────────────────────────
  const appRows = useMemo(() => {
    const rows = data.applications || [];
    const { username } = appAppliedFilters;
    return rows.filter((row) =>
      !username || row.username?.toLowerCase().includes(username.toLowerCase())
    );
  }, [data.applications, appAppliedFilters]);

  // ── Filter handlers ───────────────────────────────────────────────
  const handleLlApply = () => {
    setLlAppliedFilters({ ...llFilters });
    load("loginlogout", llFilters);
  };
  const handleLlClear = () => {
    setLlFilters(EMPTY_LL_FILTER);
    setLlAppliedFilters(EMPTY_LL_FILTER);
    load("loginlogout", {});
  };

  const handleAppApply = () => {
    setAppAppliedFilters({ ...appFilters });
    load("applications", appFilters);
  };
  const handleAppClear = () => {
    setAppFilters(EMPTY_APP_FILTER);
    setAppAppliedFilters(EMPTY_APP_FILTER);
    load("applications", {});
  };

  const handleActApply = () => {
    setActAppliedFilters({ ...actFilters });
    load("activity", actFilters);
  };
  const handleActClear = () => {
    setActFilters(EMPTY_ACTIVITY_FILTER);
    setActAppliedFilters(EMPTY_ACTIVITY_FILTER);
    load("activity", {});
  };

  // Detect whether migration 001 has been applied — only 'status' is absent pre-migration
  // (session_duration, login_time, logout_time are now derived even without migration)
  const llHasExtendedCols = (data.loginlogout || []).length > 0
    ? "status" in (data.loginlogout[0] ?? {})
    : null; // null = unknown (no data yet)

  // Row selection for DataTable
  const activeRows = (() => {
    if (activeTab === "activity")     return actRows;
    if (activeTab === "loginlogout")  return llRows;
    if (activeTab === "applications") return appRows;
    return data[activeTab] || [];
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#ffffff", color: "#000000", border: "1px solid #d1d5db" },
        }}
      />

      {/* Login/Logout modal form */}
      {showLLForm && (
        <LoginLogoutForm
          onClose={() => setShowLLForm(false)}
          onSuccess={() => load("loginlogout", llAppliedFilters)}
        />
      )}

      <NavBar onToggleSidebar={() => setSidebarOpen((o) => !o)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} active={activeTab} onSelect={setActiveTab} />

        <main className="flex-1 overflow-auto px-6 py-6 space-y-6 min-w-0">

          {/* ── Dashboard ── */}
          {activeTab === "dashboard" && <Dashboard />}

          {/* ── Data tabs ── */}
          {activeTab !== "dashboard" && (
            <>
              <StatsGrid data={data} loading={loading} />

              {/* Activity: collected time date range filter */}
              {activeTab === "activity" && (
                <FilterBar
                  filters={actFilters}
                  onChange={setActFilters}
                  onApply={handleActApply}
                  onClear={handleActClear}
                  resultCount={actRows.length}
                  totalCount={data.activity?.length ?? 0}
                  showHostname={false}
                  showUsername={false}
                  showStatus={false}
                  showDateFrom
                  showDateTo
                />
              )}

              {/* Login/Logout: migration notice + filter bar + Log Event button */}
              {activeTab === "loginlogout" && (
                <div className="space-y-3">
                  {/* Show notice only when we have data and extended cols are absent */}
                  {llHasExtendedCols === false && <MigrationNotice />}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowLLForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#012576] hover:bg-[#013aab]
                                 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <span className="text-base leading-none">+</span>
                      Log Event
                    </button>
                  </div>
                  <FilterBar
                    filters={llFilters}
                    onChange={setLlFilters}
                    onApply={handleLlApply}
                    onClear={handleLlClear}
                    resultCount={llRows.length}
                    totalCount={data.loginlogout?.length ?? 0}
                    showHostname
                    showUsername
                    showStatus
                  />
                </div>
              )}

              {/* Applications: username filter */}
              {activeTab === "applications" && (
                <FilterBar
                  filters={appFilters}
                  onChange={setAppFilters}
                  onApply={handleAppApply}
                  onClear={handleAppClear}
                  resultCount={appRows.length}
                  totalCount={data.applications?.length ?? 0}
                  showHostname={false}
                  showUsername
                  showStatus={false}
                />
              )}

              <DataTable
                tab={activeTab}
                rows={activeRows}
                loading={!!loading[activeTab]}
                error={errors[activeTab]}
                onRefresh={() => {
                  if (activeTab === "activity")          load("activity",     actAppliedFilters);
                  else if (activeTab === "loginlogout")  load("loginlogout",  llAppliedFilters);
                  else if (activeTab === "applications") load("applications", appAppliedFilters);
                  else                                   load(activeTab);
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
