import Link from "next/link";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects, error } = await supabase.from("projects").select("id, name, description, created_at, urls(count), captures(created_at)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const items = (projects ?? []) as (Project & { urls: { count: number }[]; captures: { created_at: string }[] })[];
  return <section className="mx-auto max-w-6xl">
    <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-brand">WORKSPACE</p><h1 className="mt-1 text-3xl font-bold text-navy">Projects</h1></div><Link href="/projects/new" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#280473]">New Project</Link></div>
    {items.length === 0 ? <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold text-navy">Start tracking a project</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Add a group of URLs, then capture each page before and after your next deployment.</p><Link href="/projects/new" style={{ backgroundColor: "#36069A", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", display: "inline-block", textDecoration: "none" }}>Create your first project</Link></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((project) => { const last = project.captures?.sort((a,b) => b.created_at.localeCompare(a.created_at))[0]; return <article key={project.id} className="relative flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><DeleteProjectButton projectId={project.id} projectName={project.name} /><h2 className="text-lg font-bold text-navy">{project.name}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description || <span style={{ color: "#ADB5BD", fontStyle: "italic", fontSize: "12px" }}>No description added</span>}</p><div className="mt-auto flex items-end justify-between pt-6"><div className="text-xs text-slate-500"><p>{project.urls?.[0]?.count ?? 0} URL{project.urls?.[0]?.count === 1 ? "" : "s"}</p><p className="mt-1">{last ? `Last run ${new Date(last.created_at).toLocaleDateString()}` : "Not captured yet"}</p></div><Link href={`/projects/${project.id}`} className="rounded-lg border border-brand px-3 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white">Open</Link></div></article>; })}
    </div>}
  </section>;
}
