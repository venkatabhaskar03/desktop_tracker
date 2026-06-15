export default function MigrationNotice() {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-xl shrink-0 mt-0.5">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            Extended columns not yet available
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Login/logout times and session duration are already shown from event data.
            For agent-measured{" "}
            <span className="font-mono bg-amber-100 px-1 rounded">idle_time</span>,{" "}
            <span className="font-mono bg-amber-100 px-1 rounded">screen_lock_time</span>,{" "}
            <span className="font-mono bg-amber-100 px-1 rounded">failed_login_attempts</span> and{" "}
            <span className="font-mono bg-amber-100 px-1 rounded">status</span>{" "}
            run the migration:
          </p>
          <pre className="mt-2 text-xs bg-amber-100 border border-amber-200 rounded-lg p-3 overflow-x-auto text-amber-900 leading-relaxed">
{`psql -h 157.151.171.221 -U ritemon -d monitoring \\
  -f backend/migrations/001_alter_login_logout.sql`}
          </pre>
          <p className="text-xs text-amber-600 mt-2">
            The migration uses <span className="font-mono">ADD COLUMN IF NOT EXISTS</span> — safe to run multiple times, no data loss.
          </p>
        </div>
      </div>
    </div>
  );
}
