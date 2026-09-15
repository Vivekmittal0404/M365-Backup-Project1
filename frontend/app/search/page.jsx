"use client";

import { useState } from "react";
import Shell from "@/app/components/Shell";
import TenantPicker from "@/app/components/TenantPicker";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

export default function SearchPage() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, tenantId, selectTenant } = useTenants();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!tenantId || !query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.post("/search/ai", { tenantId, query });
      setResults(data?.results || data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <Shell title="Search & restore" eyebrow="subject search" companyName={companyName}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-ink/55 text-[14px] max-w-md">
          Search backed-up mail by subject — the same index the WhatsApp restore
          bot queries.
        </p>
        <TenantPicker tenants={tenants} tenantId={tenantId} onSelect={selectTenant} />
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-10">
        <input
          className="field"
          placeholder="Search by subject…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={!tenantId}
        />
        <button type="submit" disabled={!tenantId || loading} className="btn-primary shrink-0">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {!searched ? null : loading ? (
        <p className="text-ink/40 text-[13px] font-mono">Searching…</p>
      ) : results.length === 0 ? (
        <p className="text-ink/45 text-[14px]">No matches for "{query}".</p>
      ) : (
        <table className="ledger-table max-w-3xl">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Owner</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={item._id || item.wasabiKey}>
                <td>{item.subject || "(no subject)"}</td>
                <td className="text-ink/60">{item.owner || item.mailbox || "—"}</td>
                <td className="num">
                  {item.backupDate ? new Date(item.backupDate).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}
