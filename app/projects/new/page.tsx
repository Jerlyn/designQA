import Link from "next/link";
import { NewProjectForm } from "@/components/new-project-form";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/upgrade-button";

export default async function NewProjectPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
    supabase.from("projects").select("id", { count: "exact", head: true }),
  ]);
  const atLimit = (profile?.plan ?? "free") !== "pro" && (count ?? 0) >= 1;
  return <section className="mx-auto max-w-6xl"><Link href="/projects" className="text-sm font-semibold text-brand hover:underline">← Projects</Link><h1 className="mt-5 text-3xl font-bold text-navy">New project</h1><p className="mt-2 text-slate-600">Add the URLs you want DesignQA to track across deployments.</p>{atLimit ? <div className="mt-8 max-w-2xl rounded-xl border border-brand/25 bg-white p-6 shadow-sm"><p className="text-charcoal">You&apos;ve reached the free plan limit of 1 project. Upgrade to Pro for unlimited projects.</p><div className="mt-5"><UpgradeButton /></div></div> : <NewProjectForm />}</section>;
}
