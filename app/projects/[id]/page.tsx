import { notFound } from "next/navigation";
import Link from "next/link";
import { CaptureForm } from "@/components/capture-form";
import { AddUrlForm } from "@/components/add-url-form";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { Capture, Project, ProjectUrl } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: project }, { data: urls }, { data: captures }] = await Promise.all([supabase.from("projects").select("*").eq("id", params.id).single(), supabase.from("urls").select("*").eq("project_id", params.id).order("created_at"), supabase.from("captures").select("*").eq("project_id", params.id).order("created_at", { ascending: false })]);
  if (!project) notFound(); const item = project as Project; const projectUrls = (urls ?? []) as ProjectUrl[]; const runs = (captures ?? []) as Capture[];
  const { data: results } = runs.length ? await supabase.from("capture_results").select("capture_id, screenshot_url").in("capture_id", runs.map((run) => run.id)) : { data: [] };
  const previews = new Map<string, string>();
  for (const result of results ?? []) if (result.screenshot_url && !previews.has(result.capture_id)) previews.set(result.capture_id, result.screenshot_url);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("plan").eq("id", user.id).single() : { data: null };
  const plan = profile?.plan === "pro" ? "pro" : "free";
  return <section className="mx-auto max-w-6xl"><Link href="/projects" className="text-sm font-semibold text-brand hover:underline">← Projects</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-navy">{item.name}</h1>{item.description && <p className="mt-2 text-slate-600">{item.description}</p>}</div><Link href={`/projects/${item.id}/compare`} className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white">Compare Captures</Link></div><CaptureForm projectId={item.id} /><div className="mt-8 grid gap-6 lg:grid-cols-5"><div className="lg:col-span-2"><h2 className="text-lg font-bold text-navy">Monitored URLs <span className="text-sm font-normal text-slate-500">({projectUrls.length})</span></h2><ul className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">{projectUrls.map((entry) => <li key={entry.id} className="border-b border-slate-100 px-4 py-3 last:border-0"><a href={entry.url} target="_blank" rel="noreferrer" className="break-all text-sm text-brand hover:underline">{entry.url}</a></li>)}</ul><AddUrlForm projectId={item.id} urlCount={projectUrls.length} plan={plan} /></div><div className="lg:col-span-3"><h2 className="text-lg font-bold text-navy">Capture history</h2>{runs.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No captures yet. Run your first capture above.</p> : <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">{runs.map((run) => { const preview = previews.get(run.id); return <Link href={`/projects/${item.id}/captures/${run.id}`} key={run.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 hover:bg-offwhite last:border-0">{preview ? <img src={preview} alt="Capture preview" className="h-12 w-20 rounded object-cover object-top" /> : <div className="h-12 w-20 rounded bg-offwhite" />}<div className="min-w-0 flex-1"><p className="text-sm font-semibold text-charcoal">{run.label || "Untitled capture"}</p><p className="mt-1 text-xs text-slate-500">{new Date(run.created_at).toLocaleString()}</p></div><StatusBadge status={run.status} /></Link>; })}</div>}</div></div></section>;
}
