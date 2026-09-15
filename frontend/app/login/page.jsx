"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      if (data.companyName) localStorage.setItem("companyName", data.companyName);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Couldn't sign you in — check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-paper">
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper px-14 py-14">
        <div className="font-serif text-[24px]">Vaultline</div>
        <div>
          <p className="font-serif text-[30px] leading-snug max-w-sm">
            Every mailbox, every departure, every retention clock — kept in one ledger.
          </p>
          <p className="text-paper/50 text-[13px] mt-5 max-w-xs font-mono">
            m365 backup · ex-employee vault · dpdp compliance
          </p>
        </div>
        <div className="text-paper/35 text-[12px] font-mono">© {new Date().getFullYear()}</div>
      </div>

      <div className="flex items-center justify-center px-8 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-serif text-[26px] mb-1">Sign in</h1>
          <p className="text-ink/50 text-[14px] mb-8">Access your backup ledger.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[12px] text-ink/50 mb-1">Email</label>
              <input
                type="email"
                required
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-[12px] text-ink/50 mb-1">Password</label>
              <input
                type="password"
                required
                className="field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error ? (
            <p className="text-vault-rust text-[13px] mt-4">{error}</p>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-8">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-[13px] text-ink/50 mt-6">
            No account yet?{" "}
            <Link href="/register" className="text-ink hover:text-vault-teal underline underline-offset-4">
              Register your company
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
