"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "@/app/components/Shell";
import StatusPill from "@/app/components/StatusPill";
import useAuthGuard from "@/app/components/useAuthGuard";
import useTenants from "@/app/components/useTenants";
import api from "@/lib/api";

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectPageInner />
    </Suspense>
  );
}

function ConnectPageInner() {
  const { ready, companyName } = useAuthGuard();
  const { tenants, loading } = useTenants();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  // The Microsoft redirect URI points at the backend (/api/tenant/callback);
  // after it saves the Tenant it should bounce the browser back here with
  // ?connected=1 or ?error=... so this page can confirm the result.
  const justConnected = searchParams.get("connected") === "1";
  const callbackError = searchParams.get("error");

  async function handleConnect() {
    setError("");
    setConnecting(true);
    try {
      const { data } = await api.get("/tenant/connect-url");
      if (!data?.url) throw new Error("No redirect URL returned");
      window.location.href = data.url;
    } catch (err) {
      setError("Couldn't reach Microsoft's sign-in page. Try again in a moment.");
      setConnecting(false);
    }
  }

  if (!ready) return null;

  return (
    <Shell title="Connect tenant" eyebrow="microsoft 365" companyName={companyName}>
      <div className="max-w-xl">
        {justConnected ? (
          <p className="text-vault-ok text-[13px] mb-6 border border-vault-ok/30 px-4 py-2">
            Tenant connected. It'll appear in the list below and be ready for backup.
          </p>
        ) : null}
        {callbackError ? (
          <p className="text-vault-rust text-[13px] mb-6 border border-vault-rust/30 px-4 py-2">
            Microsoft returned an error: {callbackError}
          </p>
        ) : null}
        <p className="text-ink/60 text-[14px] leading-relaxed mb-8">
          Vaultline requests read access to mail and sites, plus offline access so
          scheduled backups can run without you present. Microsoft's consent screen
          will list the exact permissions before anything is granted.
        </p>

        <button onClick={handleConnect} disabled={connecting} className="btn-primary">
          {connecting ? "Redirecting to Microsoft…" : "Connect Microsoft 365 tenant"}
        </button>

        {error ? <p className="text-vault-rust text-[13px] mt-4">{error}</p> : null}
      </div>

      <div className="mt-14">
        <h2 className="font-serif text-[19px] mb-4">Connected tenants</h2>
        {loading ? (
          <p className="text-ink/40 text-[13px] font-mono">Loading…</p>
        ) : tenants.length === 0 ? (
          <p className="text-ink/45 text-[14px] border border-dashed border-ink-line/50 px-5 py-8 text-center max-w-xl">
            No tenants connected yet.
          </p>
        ) : (
          <table className="ledger-table max-w-xl">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Tenant ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.tenantId}>
                  <td>{t.displayName || "—"}</td>
                  <td className="num text-ink/50">{t.tenantId}</td>
                  <td>
                    <StatusPill status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
