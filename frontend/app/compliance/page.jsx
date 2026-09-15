"use client";

import { useEffect, useState } from "react";
import Shell from "@/app/components/Shell";
import TenantPicker from "@/app/components/TenantPicker";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

export default function CompliancePage() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, tenantId, selectTenant } = useTenants();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function loadLogs() {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data } = await api.get("/compliance/dpdp-logs", { params: { tenantId } });
      setLogs(data?.logs || data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !tenantId) return;
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tenantId]);

  async function downloadReport() {
    setError("");
    setGenerating(true);
    try {
      const response = await api.get("/compliance/dpdp-report", {
        params: { tenantId },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `dpdp-report-${tenantId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't generate the report. Try again shortly.");
    } finally {
      setGenerating(false);
    }
  }

  if (!ready) return null;

  return (
    <Shell title="DPDP compliance" eyebrow="data protection log" companyName={companyName}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-ink/55 text-[14px] max-w-md">
          Every access, export, and restore is logged here and held immutable for
          one year to satisfy DPDP retention requirements.
        </p>
        <TenantPicker tenants={tenants} tenantId={tenantId} onSelect={selectTenant} />
      </div>

      <div className="border border-ink-line/40 px-6 py-5 mb-12 max-w-xl flex items-center justify-between">
        <div>
          <div className="text-[14px]">Annual DPDP report</div>
          <div className="text-[12px] text-ink/45 mt-0.5">Covers the trailing 12 months of logged activity.</div>
        </div>
        <button onClick={downloadReport} disabled={!tenantId || generating} className="btn-primary shrink-0">
          {generating ? "Generating…" : "Generate PDF"}
        </button>
      </div>
      {error ? <p className="text-vault-rust text-[13px] -mt-9 mb-8">{error}</p> : null}

      <h2 className="font-serif text-[19px] mb-4">Log entries</h2>
      {loading ? (
        <p className="text-ink/40 text-[13px] font-mono">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center">
          {tenantId ? "No logged activity yet." : "Connect a tenant first."}
        </p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Data type</th>
              <th>Logged</th>
              <th>Retention until</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="capitalize">{log.action}</td>
                <td className="text-ink/60">{log.userEmail}</td>
                <td>{log.dataType}</td>
                <td className="num">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                <td className="num">
                  {log.retentionUntil ? new Date(log.retentionUntil).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}
