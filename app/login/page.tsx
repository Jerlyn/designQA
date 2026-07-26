"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    router.push("/projects");
    router.refresh();
  }

  return <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-12">
    <form onSubmit={submit} className="w-full max-w-[400px] rounded-xl border border-teal/20 bg-navy-50 p-7 shadow-2xl">
      <h1 className="text-3xl font-bold text-white">Design<span className="text-teal">QA</span></h1>
      <p className="mt-2 text-sm text-slate-300">Sign in to your workspace.</p>
      <label className="mt-7 block text-sm font-medium text-white">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2.5 text-white outline-none" /></label>
      <label className="mt-5 block text-sm font-medium text-white">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2.5 text-white outline-none" /></label>
      {error && <p role="alert" className="mt-4 rounded-lg bg-pink/20 px-3 py-2 text-sm text-pink">{error}</p>}
      <button disabled={submitting} className="mt-6 w-full rounded-lg bg-gradient-to-r from-brand to-pink px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
      <p className="mt-6 text-center text-sm text-slate-300">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-teal hover:underline">Sign up</Link></p>
    </form>
  </main>;
}
