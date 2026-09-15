"use client";

import { useEffect, useState } from "react";
import Shell from "@/app/components/Shell";
import TenantPicker from "@/app/components/TenantPicker";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

export default function ExEmployeePage() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, tenantId, selectTenant } = useTenants();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState("");

  async function loadVaults() {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data } = await api.get("/archive/ex-employee", { params: { tenantId } });
      setVaults(data?.vaults || data || []);
    } catch {
      setVaults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !tenantId) return;
    loadVaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tenantId]);

  async function handleArchive(e) {
    e.preventDefault();
    setError("");
    setArchiving(true);
    try {
      await api.post("/archive/ex-employee", { tenantId, email });
      setModalOpen(false);
      setEmail("");
      loadVaults();
    } catch {
      setError("Couldn't archive that mailbox — check the address and tenant access.");
    } finally {
      setArchiving(false);
    }
  }

  const annualCost = vaults.reduce((sum, v) => sum + (v.costPerYear ?? 49), 0);

  if (!ready) return null;

  return (
    <Shell title="Ex-employee vault" eyebrow="offboarding archive" companyName={companyName}>
      <div className="flex items-center justify-between mb-8">
        <p className="text-ink/55 text-[14px] max-w-md">
          Every departed employee's mailbox, held in cold storage at $49/year until
          you release it.
        </p>
        <TenantPicker tenants={tenants} tenantId={tenantId} onSelect={selectTenant} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-10">
          <div>
            <div className="text-[12px] font-mono text-ink/45">Vaults</div>
            <div className="font-serif text-[28px]">{loading ? "—" : vaults.length}</div>
          </div>
          <div>
            <div className="text-[12px] font-mono text-ink/45">Annual cost</div>
            <div className="font-serif text-[28px]">{loading ? "—" : `$${annualCost}`}</div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!tenantId}
          className="btn-primary"
        >
          Archive ex-employee
        </button>
      </div>

      {loading ? (
        <p className="text-ink/40 text-[13px] font-mono">Loading…</p>
      ) : vaults.length === 0 ? (
        <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center">
          {tenantId ? "No mailboxes archived yet." : "Connect a tenant first."}
        </p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Archived</th>
              <th>Size</th>
              <th>Cost / yr</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((v) => (
              <tr key={v._id || v.email}>
                <td>{v.email}</td>
                <td className="num">{v.archivedAt ? new Date(v.archivedAt).toLocaleDateString() : "—"}</td>
                <td className="num">{v.originalSizeMB ? `${v.originalSizeMB} MB` : "—"}</td>
                <td className="num">${v.costPerYear ?? 49}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center px-6 z-50">
          <div className="bg-paper w-full max-w-sm px-7 py-7 border border-ink-line/40">
            <h3 className="font-serif text-[20px] mb-4">Archive a mailbox</h3>
            <form onSubmit={handleArchive}>
              <label className="block text-[12px] text-ink/50 mb-1">Employee email</label>
              <input
                type="email"
                required
                autoFocus
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@tenant.com"
              />
              {error ? <p className="text-vault-rust text-[13px] mt-3">{error}</p> : null}
              <div className="flex gap-3 mt-7">
                <button type="submit" disabled={archiving} className="btn-primary flex-1">
                  {archiving ? "Archiving…" : "Archive"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
