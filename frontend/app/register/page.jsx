"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ companyName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("companyName", form.companyName);
      router.push("/connect");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't create that account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16 bg-paper">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-serif text-[26px] mb-1">Register your company</h1>
        <p className="text-ink/50 text-[14px] mb-8">Start backing up your first M365 tenant.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-[12px] text-ink/50 mb-1">Company name</label>
            <input
              required
              className="field"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Acme IT Services"
            />
          </div>
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
              minLength={8}
              className="field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </div>
        </div>

        {error ? <p className="text-vault-rust text-[13px] mt-4">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-8">
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-[13px] text-ink/50 mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-ink hover:text-vault-teal underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
