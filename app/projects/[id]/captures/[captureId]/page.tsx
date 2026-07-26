import Link from "next/link";
import { notFound } from "next/navigation";
import { CaptureResultCard } from "@/components/capture-result-card";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { Capture, CaptureResult, Project } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function CaptureResultsPage({ params }: { params: { id: string; captureId: string } }) {
  const supabase = createClient();
  const [{ data: project }, { data: capture }, { data: results }] = await Promise.all([supabase.from("projects").select("*").eq("id", params.id).single(), supabase.from("captures").select("*").eq("id", params.captureId).eq("project_id", params.id).single(), supabase.from("capture_results").select("*").eq("capture_id", params.captureId).order("created_at")]);
  if (!project || !capture) notFound(); const item = project as Project; const run = capture as Capture; const entries = (results ?? []) as CaptureResult[];
  return <section className="mx-auto max-w-6xl"><Link href={`/projects/${item.id}`} className="text-sm font-semibold text-brand hover:underline">← {item.name}</Link><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-brand">CAPTURE RESULTS</p><h1 className="mt-1 text-3xl font-bold text-navy">{run.label || "Untitled capture"}</h1><p className="mt-2 text-sm text-slate-600">{new Date(run.created_at).toLocaleString()}</p></div><StatusBadge status={run.status} /></div>{entries.length === 0 ? <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">This capture does not have results yet.</p> : <div className="mt-8 grid gap-5 md:grid-cols-2">{entries.map((result) => <CaptureResultCard key={result.id} result={result} />)}</div>}</section>;
}
