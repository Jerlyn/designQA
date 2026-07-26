"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UpgradeButton } from "@/components/upgrade-button";

export function AddUrlForm({ projectId, urlCount, plan }: { projectId: string; urlCount: number; plan: "free" | "pro" }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const atLimit = plan === "free" && urlCount >= 3;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Enter a complete http or https URL.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Enter a valid URL.");
      return;
    }
    setSaving(true);
    const { error: insertError } = await createClient().from("urls").insert({ project_id: projectId, url: url.trim() });
    if (insertError) { setError(insertError.message); setSaving(false); return; }
    setUrl("");
    router.refresh();
  }

  if (atLimit) return <div className="mt-4 rounded-lg border border-brand/25 bg-brand/5 p-4"><p className="text-sm text-charcoal">Free plan supports 3 URLs per project. Upgrade to Pro for unlimited URLs.</p><div className="mt-3"><UpgradeButton /></div></div>;
  return <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/new-page" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" /><button disabled={saving} className="rounded-lg border border-brand px-3 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-60">{saving ? "Adding…" : "Add URL"}</button>{error && <p role="alert" className="basis-full text-sm text-[#8d164b]">{error}</p>}</form>;
}
