"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = "free" | "pro";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<Plan>("free");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }
    if (!data.session) {
      setMessage("Check your email to confirm your account, then sign in to continue.");
      setSubmitting(false);
      return;
    }
    if (plan === "pro") {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const checkout = await response.json();
      if (!response.ok || !checkout.url) {
        setError(checkout.error || "Could not start checkout.");
        setSubmitting(false);
        return;
      }
      window.location.assign(checkout.url);
      return;
    }
    router.push("/projects");
    router.refresh();
  }

  return <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-12">
    <form onSubmit={submit} className="w-full max-w-2xl rounded-xl border border-teal/20 bg-navy-50 p-7 shadow-2xl">
      <h1 className="text-3xl font-bold text-white">Create your Design<span className="text-teal">QA</span> account</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><label className="block text-sm font-medium text-white sm:col-span-3">Full name<input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2.5 text-white outline-none" /></label><label className="block text-sm font-medium text-white">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2.5 text-white outline-none" /></label><label className="block text-sm font-medium text-white sm:col-span-2">Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-navy px-3 py-2.5 text-white outline-none" /></label></div>
      <fieldset className="mt-7"><legend className="text-sm font-semibold text-white">Choose your plan</legend><div className="mt-3 grid gap-4 md:grid-cols-2"><PlanCard plan="free" selected={plan === "free"} onSelect={setPlan} title="Free tier" price="Free forever" features={["1 project", "3 URLs per project", "Unlimited captures", "WCAG audit reports"]} action="Start Free" /><PlanCard plan="pro" selected={plan === "pro"} onSelect={setPlan} title="Pro tier" price="$9/month" features={["Unlimited projects", "Unlimited URLs", "Gemini AI analysis", "Export reports", "Priority support"]} action="Start Pro — $9/mo" /></div></fieldset>
      {error && <p role="alert" className="mt-4 rounded-lg bg-pink/20 px-3 py-2 text-sm text-pink">{error}</p>}{message && <p className="mt-4 rounded-lg bg-teal/15 px-3 py-2 text-sm text-teal">{message}</p>}
      <button disabled={submitting} className="mt-6 w-full rounded-lg bg-gradient-to-r from-brand to-pink px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Creating account…" : "Create account"}</button>
      <p className="mt-6 text-center text-sm text-slate-300">Already have an account? <Link href="/login" className="font-semibold text-teal hover:underline">Sign in</Link></p>
    </form>
  </main>;
}

function PlanCard({ plan, selected, onSelect, title, price, features, action }: { plan: Plan; selected: boolean; onSelect: (plan: Plan) => void; title: string; price: string; features: string[]; action: string }) {
  return <button type="button" onClick={() => onSelect(plan)} className={`rounded-xl border p-5 text-left ${selected ? "border-teal bg-teal/10" : "border-slate-600 bg-navy"}`}><div className="flex items-baseline justify-between gap-3"><h2 className="font-bold text-white">{title}</h2><span className="text-sm text-teal">{price}</span></div><ul className="mt-4 space-y-2 text-sm text-slate-300">{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><span className="mt-5 inline-block rounded-lg border border-teal px-3 py-2 text-sm font-semibold text-teal">{action}</span></button>;
}
