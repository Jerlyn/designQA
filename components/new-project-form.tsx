"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function validateUrls(raw: string): { valid: string[]; invalid: string[] } {
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean); const valid: string[] = []; const invalid: string[] = [];
  lines.forEach((line) => { try { const url = new URL(line); if (url.protocol === "http:" || url.protocol === "https:") valid.push(line); else invalid.push(line); } catch { invalid.push(line); } });
  return { valid, invalid };
}

export function NewProjectForm() {
  const router = useRouter(); const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [urls, setUrls] = useState(""); const [error, setError] = useState(""); const [urlErrors, setUrlErrors] = useState<string[]>([]); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const { valid: cleanUrls } = validateUrls(urls);
    if (!name.trim()) return setError("A project name is required.");
    if (!cleanUrls.length) return setError("Add at least one URL.");
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session has expired. Please sign in again."); setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    const { count } = await supabase.from("projects").select("id", { count: "exact", head: true });
    if ((profile?.plan ?? "free") !== "pro" && (count ?? 0) >= 1) { setError("You've reached the free plan limit of 1 project. Upgrade to Pro for unlimited projects."); setSaving(false); return; }
    const { data: project, error: projectError } = await supabase.from("projects").insert({ name: name.trim(), description: description.trim() || null, user_id: user.id }).select("id").single();
    if (projectError || !project) { setError(projectError?.message || "Could not create project."); setSaving(false); return; }
    const { error: urlsError } = await supabase.from("urls").insert(cleanUrls.map((url) => ({ project_id: project.id, url })));
    if (urlsError) { setError(`Project created, but URLs could not be saved: ${urlsError.message}`); setSaving(false); return; }
    router.push(`/projects/${project.id}`); router.refresh();
  }
  return <form onSubmit={submit} className="mt-8 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold text-charcoal">Project name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client Site Redesign" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-brand focus:ring-2" /></label><label className="mt-5 block text-sm font-semibold text-charcoal">Description <span className="font-normal text-slate-500">(optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What are you monitoring?" className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand" /></label><label className="mt-5 block text-sm font-semibold text-charcoal">URLs to monitor<textarea required value={urls} onChange={(e) => { setUrls(e.target.value); setUrlErrors(validateUrls(e.target.value).invalid); }} rows={7} placeholder={"https://example.com\nhttps://example.com/about"} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-brand" /></label><p className="mt-2 text-xs text-slate-500">One complete URL per line.</p>{urlErrors.length > 0 && <div style={{ marginTop: "6px", padding: "8px 12px", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.3)", borderRadius: "6px", fontSize: "12px", color: "#DC3545" }}><strong>Invalid URLs (will be skipped):</strong><ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>{urlErrors.map((url, index) => <li key={index}>{url} <span style={{ color: "#6C757D" }}>— must start with https://</span></li>)}</ul></div>}{error && <p role="alert" className="mt-4 rounded-lg bg-pink/15 px-3 py-2 text-sm text-[#8d164b]">{error}</p>}<button disabled={saving} className="mt-6 rounded-lg bg-gradient-to-r from-brand to-pink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating…" : "Create project"}</button></form>;
}
