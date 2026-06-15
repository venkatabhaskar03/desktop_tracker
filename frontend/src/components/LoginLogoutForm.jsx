import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { postLoginLogout } from "../api";

const EVENT_TYPES = ["login", "logout", "lock", "unlock", "failed"];
const STATUSES    = ["active", "locked", "logged_out", "failed"];

const BLANK = {
  hostname:              "",
  username:              "",
  event_type:            "login",
  login_time:            "",
  logout_time:           "",
  session_duration:      "",
  idle_time:             "",
  screen_lock_time:      "",
  ip_address:            "",
  failed_login_attempts: "0",
  status:                "active",
};

function calcSessionDuration(loginTime, logoutTime) {
  if (!loginTime || !logoutTime) return "";
  try {
    const diff = (new Date(logoutTime) - new Date(loginTime)) / 60000;
    return diff >= 0 ? diff.toFixed(2) : "";
  } catch { return ""; }
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#012576] focus:border-[#012576] placeholder:text-gray-400";

export default function LoginLogoutForm({ onClose, onSuccess }) {
  const [form,       setForm]       = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculate session duration whenever login/logout time changes
  useEffect(() => {
    const dur = calcSessionDuration(form.login_time, form.logout_time);
    if (dur) setForm((f) => ({ ...f, session_duration: dur }));
  }, [form.login_time, form.logout_time]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        hostname:              form.hostname,
        username:              form.username,
        event_type:            form.event_type,
        status:                form.status || null,
        ip_address:            form.ip_address || null,
        login_time:            form.login_time  || null,
        logout_time:           form.logout_time || null,
        session_duration:      form.session_duration      ? parseFloat(form.session_duration)      : null,
        idle_time:             form.idle_time             ? parseFloat(form.idle_time)             : null,
        screen_lock_time:      form.screen_lock_time      ? parseFloat(form.screen_lock_time)      : null,
        failed_login_attempts: form.failed_login_attempts ? parseInt(form.failed_login_attempts)   : 0,
      };
      await postLoginLogout(payload);
      toast.success("Login/Logout event recorded successfully");
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-[#012576] rounded-t-2xl px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-semibold text-base">Log Login / Logout Event</h2>
            <p className="text-blue-200 text-xs mt-0.5">All fields marked * are required</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Row 1: Hostname + Username */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Hostname" required>
              <input required className={inputCls} placeholder="DESKTOP-ABC123"
                value={form.hostname} onChange={set("hostname")} />
            </Field>
            <Field label="Username" required>
              <input required className={inputCls} placeholder="john.doe"
                value={form.username} onChange={set("username")} />
            </Field>
          </div>

          {/* Row 2: Event Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event Type" required>
              <select required className={inputCls} value={form.event_type} onChange={set("event_type")}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={set("status")}>
                <option value="">— None —</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 3: Login Time + Logout Time */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Login Time">
              <input type="datetime-local" className={inputCls}
                value={form.login_time} onChange={set("login_time")} />
            </Field>
            <Field label="Logout Time">
              <input type="datetime-local" className={inputCls}
                value={form.logout_time} onChange={set("logout_time")} />
            </Field>
          </div>

          {/* Row 4: Session Duration + Idle Time + Screen Lock Time */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Session Duration (min)">
              <input type="number" step="0.01" min="0" className={inputCls}
                placeholder="Auto-calculated"
                value={form.session_duration} onChange={set("session_duration")} />
            </Field>
            <Field label="Idle Time (min)">
              <input type="number" step="0.01" min="0" className={inputCls} placeholder="e.g. 32.5"
                value={form.idle_time} onChange={set("idle_time")} />
            </Field>
            <Field label="Screen Lock Time (min)">
              <input type="number" step="0.01" min="0" className={inputCls} placeholder="e.g. 15.0"
                value={form.screen_lock_time} onChange={set("screen_lock_time")} />
            </Field>
          </div>

          {/* Row 5: IP Address + Failed Login Attempts */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="IP Address">
              <input type="text" className={inputCls} placeholder="192.168.1.105"
                value={form.ip_address} onChange={set("ip_address")} />
            </Field>
            <Field label="Failed Login Attempts">
              <input type="number" min="0" className={inputCls} placeholder="0"
                value={form.failed_login_attempts} onChange={set("failed_login_attempts")} />
            </Field>
          </div>

          {/* Session duration hint */}
          {form.login_time && form.logout_time && (
            <p className="text-xs text-[#012576] bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              ⏱ Session duration auto-calculated: <strong>{form.session_duration} minutes</strong>
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ll-form"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#012576] hover:bg-[#013aab] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
