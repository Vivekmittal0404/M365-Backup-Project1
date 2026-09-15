import Link from "next/link";

export default function TenantPicker({ tenants, tenantId, onSelect }) {
  if (!tenants.length) {
    return (
      <Link
        href="/connect"
        className="text-[13px] font-mono text-vault-amber border border-vault-amber/40 px-3 py-1.5 rounded-sm hover:bg-vault-amber/5"
      >
        No tenant connected — connect one →
      </Link>
    );
  }

  return (
    <select
      value={tenantId}
      onChange={(e) => onSelect(e.target.value)}
      className="bg-transparent border border-ink-line/50 text-[13px] font-mono px-3 py-1.5 rounded-sm"
    >
      {tenants.map((t) => (
        <option key={t.tenantId} value={t.tenantId}>
          {t.displayName || t.tenantId}
        </option>
      ))}
    </select>
  );
}
