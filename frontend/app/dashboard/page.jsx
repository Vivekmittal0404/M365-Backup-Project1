"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/app/components/Shell";
import StatusPill from "@/app/components/StatusPill";
import TenantPicker from "@/app/components/TenantPicker";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

function Stat({ label, value, hint }) {
  return (
    <div className="border-t border-ink-line/40 pt-4">
      <div className="text-[12px] font-mono text-ink/45">{label}</div>
      <div className="font-serif text-[36px] leading-tight mt-1">{value}</div>
      {hint ? <div className="text-[12px] text-ink/40 mt-1">{hint}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, tenantId, selectTenant } = useTenants();
  const [jobs, setJobs] = useState([]);
  const [vaultCount, setVaultCount] = useState(null);
  const [dpdpCount, setDpdpCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !tenantId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [jobsRes, vaultRes, dpdpRes] = await Promise.allSettled([
        api.get("/backup/jobs", { params: { tenantId } }),
        api.get("/archive/ex-employee", { params: { tenantId } }),
        api.get("/compliance/dpdp-logs", { params: { tenantId } }),
      ]);
      if (cancelled) return;
      setJobs(jobsRes.status === "fulfilled" ? jobsRes.value.data?.jobs || jobsRes.value.data || [] : []);
      setVaultCount(
        vaultRes.status === "fulfilled"
          ? (vaultRes.value.data?.vaults || vaultRes.value.data || []).length
          : null
      );
      setDpdpCount(
        dpdpRes.status === "fulfilled"
          ? (dpdpRes.value.data?.logs || dpdpRes.value.data || []).length
          : null
      );
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ready, tenantId]);

  if (!ready) return null;

  return (
    <Shell title="Overview" eyebrow="dashboard" companyName={companyName}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-ink/55 text-[14px] max-w-md">
          A running ledger of every backup job, archived mailbox, and compliance
          entry across your connected tenants.
        </p>
        <TenantPicker tenants={tenants} tenantId={tenantId} onSelect={selectTenant} />
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        <Stat label="Total backup jobs" value={loading ? "—" : jobs.length} />
        <Stat
          label="Ex-employee vaults"
          value={loading ? "—" : vaultCount ?? "—"}
          hint={vaultCount === null && !loading ? "endpoint not reachable" : "$49/yr per vault"}
        />
        <Stat
          label="DPDP log entries"
          value={loading ? "—" : dpdpCount ?? "—"}
          hint={dpdpCount === null && !loading ? "endpoint not reachable" : "1yr retention each"}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-[19px]">Recent jobs</h2>
        <Link href="/backups" className="text-[13px] text-vault-teal hover:underline underline-offset-4">
          View all backups →
        </Link>
      </div>

      {!tenantId ? (
        <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center">
          Connect a Microsoft 365 tenant to start seeing jobs here.
        </p>
      ) : loading ? (
        <p className="text-ink/40 text-[13px] font-mono">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center">
          No backup jobs yet. Start one from the Backups page.
        </p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Items</th>
              <th>Started</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {jobs.slice(0, 8).map((job) => (
              <tr key={job._id || job.id}>
                <td className="capitalize">{job.type}</td>
                <td>
                  <StatusPill status={job.status} />
                </td>
                <td className="num">{job.itemCount ?? "—"}</td>
                <td className="num">
                  {job.startedAt ? new Date(job.startedAt).toLocaleString() : "—"}
                </td>
                <td className="num">
                  {job.completedAt ? new Date(job.completedAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}
