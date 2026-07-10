import React, { useState, useEffect } from "react";
import { Loader2, Activity, Server, Cpu, Clock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export function AdminPanel() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header and controllers */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-slate-100 text-base">Operational System Admin Console</h2>
          <p className="text-xs text-slate-500 font-mono">Real-time express API gateways, telemetry diagnostics, and latency charts.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-sky-400 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Refresh Monitors</span>
        </button>
      </div>

      {loading && !stats ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-slate-400">Syncing telemetry logs and latency records...</p>
        </div>
      ) : (
        stats && (
          <div className="space-y-6">
            
            {/* Health indicators */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              
              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase">Service Health</span>
                  <span className="text-base font-bold text-slate-100">{stats.systemHealth}</span>
                </div>
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-sky-500/5 border border-sky-500/10 text-sky-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase">API Latency</span>
                  <span className="text-base font-bold text-slate-100">{stats.avgLatency} ms</span>
                </div>
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-500/5 border border-purple-500/10 text-purple-400 rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase">API Gateways</span>
                  <span className="text-base font-bold text-slate-100">{stats.totalRequests} Requests</span>
                </div>
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase">Error Frequency</span>
                  <span className="text-base font-bold text-rose-400">{stats.errorRate}</span>
                </div>
              </div>

            </div>

            {/* Logs table */}
            <div className="glass-panel border border-slate-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Gateway Event Audits</h3>
                <span className="text-[10px] font-mono text-slate-500">Live feed [auto-updates every 15s]</span>
              </div>

              <div className="glass-panel border border-slate-900 rounded-xl overflow-hidden font-mono text-[10px]">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-900 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 w-24">Trace ID</th>
                        <th className="py-2.5 px-4">Method</th>
                        <th className="py-2.5 px-4">Route Path</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Origin IP</th>
                        <th className="py-2.5 px-4 text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {stats.recentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No event logs indexed yet. Use some scanners to populate logs.
                          </td>
                        </tr>
                      ) : (
                        stats.recentLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-900/20">
                            <td className="py-2.5 px-4 font-semibold text-slate-500">{log.id}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                log.method === 'POST' ? "bg-purple-500/10 border border-purple-500/20 text-purple-400" : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                              }`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-200 select-all">{log.endpoint}</td>
                            <td className="py-2.5 px-4 font-bold">
                              <span className={log.status < 400 ? "text-emerald-400" : "text-rose-400"}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-400">{log.ip}</td>
                            <td className="py-2.5 px-4 text-right text-sky-300 font-semibold">{log.latency} ms</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Diagnostic system log info */}
            <div className="p-4 border border-slate-900 bg-slate-950/40 rounded-xl font-mono text-[11px] text-slate-500 flex justify-between items-center">
              <span>AegisRecon Operational Core: nodejs Express gateway v4.21.2</span>
              <span>Uptime: {Math.floor(stats.uptime / 60)} minutes</span>
            </div>

          </div>
        )
      )}

    </div>
  );
}
