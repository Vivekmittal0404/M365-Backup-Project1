"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/connect", label: "Connect tenant" },
  { href: "/backups", label: "Backups" },
  { href: "/ex-employee", label: "Ex-employee vault" },
  { href: "/compliance", label: "DPDP compliance" },
  { href: "/search", label: "Search & restore" },
];

export default function Shell({ title, eyebrow, companyName, children }) {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("companyName");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col justify-between">
        <div>
          <div className="px-6 py-7 border-b border-white/10">
            <div className="font-serif text-[22px] leading-none">Vaultline</div>
            <div className="text-[11px] text-paper/45 mt-1 font-mono">m365 · backup ledger</div>
          </div>
          <nav className="mt-4 flex flex-col">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-3 text-[14px] border-l-2 transition-colors ${
                    active
                      ? "border-vault-teal bg-white/[0.04] text-paper"
                      : "border-transparent text-paper/55 hover:text-paper hover:bg-white/[0.03]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-white/10">
          {companyName ? (
            <div className="text-[13px] text-paper/70 mb-3 truncate">{companyName}</div>
          ) : null}
          <button
            onClick={signOut}
            className="text-[13px] text-paper/55 hover:text-paper transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="px-10 pt-10 pb-6 border-b border-ink-line/30">
          {eyebrow ? (
            <div className="text-[12px] font-mono text-ink/45 mb-1">{eyebrow}</div>
          ) : null}
          <h1 className="font-serif text-[30px]">{title}</h1>
        </header>
        <div className="px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
