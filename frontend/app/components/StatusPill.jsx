const TONES = {
  completed: "text-vault-ok border-vault-ok/40",
  connected: "text-vault-ok border-vault-ok/40",
  running: "text-vault-teal border-vault-teal/40",
  pending: "text-vault-amber border-vault-amber/40",
  failed: "text-vault-rust border-vault-rust/40",
  disconnected: "text-vault-rust border-vault-rust/40",
};

export default function StatusPill({ status }) {
  const key = String(status || "").toLowerCase();
  const tone = TONES[key] || "text-ink/50 border-ink-line/50";
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] font-mono border rounded-sm ${tone}`}>
      {status || "unknown"}
    </span>
  );
}
