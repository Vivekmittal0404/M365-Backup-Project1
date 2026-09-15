"use client";

import { useEffect, useState } from "react";
import Shell from "@/app/components/Shell";
import StatusPill from "@/app/components/StatusPill";
import TenantPicker from "@/app/components/TenantPicker";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

const TYPES = [
  { key: "mail", label: "Mail" },
  { key: "sites", label: "SharePoint sites" },
];

export default function BackupsPage() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, tenantId, selectTenant } = useTenants();
  const [jobs, setJobs] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(["mail"]);
  const [starting, setStarting] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [restoringKey, setRestoringKey] = useState("");
  const [message, setMessage] = useState("");

  async function loadJobs() {
    if (!tenantId) return;
    setLoadingJobs(true);
    try {
      const { data } = await api.get("/backup/jobs", { params: { tenantId } });
      setJobs(data?.jobs || data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }

  async function loadItems() {
    if (!tenantId) return;
    try {
      // Backed by the same subject-search index the WhatsApp/AI search
      // endpoints use, filtered to this tenant with no query.
      const { data } = await api.post("/search/ai", { tenantId, query: "" });
      setItems(data?.results || data || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (!ready || !tenantId) return;
    loadJobs();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tenantId]);

  function toggleType(key) {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  }

  async function startBackup() {
    if (!tenantId || selectedTypes.length === 0) return;
    setStarting(true);
    setMessage("");
    try {
      await api.post("/backup/start", { tenantId, types: selectedTypes });
      setMessage("Backup job started — it'll show up below as it runs.");
      loadJobs();
    } catch {
      setMessage("Couldn't start the backup job. Check the tenant connection.");
    } finally {
      setStarting(false);
    }
  }

  async function restore(item) {
    const key = item.wasabiKey || item._id;
    setRestoringKey(key);
    try {
      await api.post("/backup/restore", { tenantId, wasabiKey: item.wasabiKey, itemId: item._id });
      setMessage(`Restored "${item.subject || key}" to OneDrive.`);
    } catch {
      setMessage(`Couldn't restore "${item.subject || key}".`);
    } finally {
      setRestoringKey("");
    }
  }

  if (!ready) return null;

  return (
    <Shell title="Backups" eyebrow="mail · sharepoint" companyName={companyName}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-ink/55 text-[14px] max-w-md">
          Run a backup on demand, or let the 2am daily cron handle it. Every item
          lands in Wasabi under its tenant and job.
        </p>
        <TenantPicker tenants={tenants} tenantId={tenantId} onSelect={selectTenant} />
      </div>

      {tenantId ? (
        <div className="border border-ink-line/40 px-6 py-5 mb-12 max-w-xl">
          <div className="text-[12px] font-mono text-ink/45 mb-3">start a job</div>
          <div className="flex gap-6 mb-5">
            {TYPES.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-[14px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t.key)}
                  onChange={() => toggleType(t.key)}
                  className="accent-vault-teal"
                />
                {t.label}
              </label>
            ))}
          </div>
          <button
            onClick={startBackup}
            disabled={starting || selectedTypes.length === 0}
            className="btn-primary"
          >
            {starting ? "Starting…" : "Start backup"}
          </button>
          {message ? <p className="text-[13px] text-ink/60 mt-4">{message}</p> : null}
        </div>
      ) : (
        <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center max-w-xl mb-12">
          Connect a tenant first.
        </p>
      )}

      <h2 className="font-serif text-[19px] mb-4">Jobs</h2>
      {loadingJobs ? (
        <p className="text-ink/40 text-[13px] font-mono">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-ink/45 text-[14px] mb-12">No jobs yet.</p>
      ) : (
        <table className="ledger-table mb-14">
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
            {jobs.map((job) => (
              <tr key={job._id || job.id}>
                <td className="capitalize">{job.type}</td>
                <td>
                  <StatusPill status={job.status} />
                </td>
                <td className="num">{job.itemCount ?? "—"}</td>
                <td className="num">{job.startedAt ? new Date(job.startedAt).toLocaleString() : "—"}</td>
                <td className="num">{job.completedAt ? new Date(job.completedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="font-serif text-[19px] mb-4">Backed-up items</h2>
      {items.length === 0 ? (
        <p className="text-ink/45 text-[14px]">No items indexed yet — run a backup job above.</p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id || item.wasabiKey}>
                <td>{item.subject || "(no subject)"}</td>
                <td className="text-ink/60">{item.owner || item.mailbox || "—"}</td>
                <td className="num">{item.sizeMB ? `${item.sizeMB} MB` : "—"}</td>
                <td className="num">
                  {item.backupDate ? new Date(item.backupDate).toLocaleDateString() : "—"}
                </td>
                <td>
                  <button
                    onClick={() => restore(item)}
                    disabled={restoringKey === (item.wasabiKey || item._id)}
                    className="text-[13px] text-vault-teal hover:underline underline-offset-4 disabled:opacity-40"
                  >
                    {restoringKey === (item.wasabiKey || item._id) ? "Restoring…" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}
