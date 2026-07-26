import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 10;

async function scoreWithAxe(url: string): Promise<{ violations: any[]; score: number; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DesignQA/1.0 (accessibility audit)", Accept: "text/html" },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const violations: any[] = [];

    const imgNoAlt = (html.match(/<img(?![^>]*\balt\s*=)[^>]*>/gi) || []).length;
    if (imgNoAlt > 0) violations.push({ id: "image-alt", impact: "critical", description: "Images must have alternate text", help: "Provide alt attributes for all img elements", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/image-alt", nodes: imgNoAlt });

    const inputNoLabel = (html.match(/<input(?![^>]*type\s*=\s*["'](?:hidden|submit|button|reset|image)["'])[^>]*>/gi) || []).filter((input) => !input.match(/\baria-label\s*=/) && !input.match(/\baria-labelledby\s*=/) && !input.match(/\bid\s*=/)).length;
    if (inputNoLabel > 0) violations.push({ id: "label", impact: "critical", description: "Form elements must have labels", help: "Ensure every form input has an associated label", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/label", nodes: inputNoLabel });

    if (!html.match(/<html[^>]+\blang\s*=/i)) violations.push({ id: "html-has-lang", impact: "serious", description: "html element must have a lang attribute", help: "Add a lang attribute to the html element", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/html-has-lang", nodes: 1 });
    if (!html.match(/<title[^>]*>[^<]+<\/title>/i)) violations.push({ id: "document-title", impact: "serious", description: "Documents must have a title", help: "Add a descriptive title element to the page", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/document-title", nodes: 1 });

    const emptyButtons = (html.match(/<button[^>]*>(\s*)<\/button>/gi) || []).filter((button) => !button.match(/\baria-label\s*=/) && !button.match(/\baria-labelledby\s*=/)).length;
    if (emptyButtons > 0) violations.push({ id: "button-name", impact: "critical", description: "Buttons must have discernible text", help: "Add text content or aria-label to all buttons", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/button-name", nodes: emptyButtons });

    const emptyLinks = (html.match(/<a[^>]*>(\s*)<\/a>/gi) || []).filter((link) => !link.match(/\baria-label\s*=/) && !link.match(/\baria-labelledby\s*=/)).length;
    if (emptyLinks > 0) violations.push({ id: "link-name", impact: "serious", description: "Links must have discernible text", help: "Add text content or aria-label to all links", helpUrl: "https://dequeuniversity.com/rules/axe/4.9/link-name", nodes: emptyLinks });

    const deductions = violations.reduce((total, violation) => {
      const weight = { critical: 10, serious: 5, moderate: 2, minor: 1 }[violation.impact as string] || 1;
      return total + weight * violation.nodes;
    }, 0);
    return { violations, score: Math.max(0, 100 - deductions) };
  } catch (err: any) { return { violations: [], score: -1, error: err.message }; }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  let captureId: string;
  try { ({ capture_id: captureId } = await request.json()); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!captureId) return NextResponse.json({ error: "capture_id is required." }, { status: 400 });
  const { data: capture, error: captureError } = await supabase.from("captures").select("id, project_id").eq("id", captureId).single();
  if (captureError || !capture) return NextResponse.json({ error: "Capture not found." }, { status: 404 });
  await supabase.from("captures").update({ status: "running" }).eq("id", captureId);
  const { data: urls, error: urlsError } = await supabase.from("urls").select("id, url").eq("project_id", capture.project_id);
  if (urlsError) { await supabase.from("captures").update({ status: "error" }).eq("id", captureId); return NextResponse.json({ error: urlsError.message }, { status: 500 }); }
  let failed = 0;
  for (const entry of urls ?? []) {
    let screenshotUrl: string | null = null; let screenshotError: string | undefined;
    try { const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(entry.url)}&screenshot=true`, { cache: "no-store", signal: AbortSignal.timeout(8000) }); const payload = await res.json(); screenshotUrl = payload?.data?.screenshot?.url ?? null; if (!res.ok || !screenshotUrl) throw new Error(payload?.status || "Microlink did not return a screenshot."); } catch (error) { failed++; screenshotError = error instanceof Error ? error.message : "Screenshot capture failed."; }
    const axeResult = await scoreWithAxe(entry.url);
    const errors = [screenshotError, axeResult.error].filter(Boolean).join(" ") || null;
    const { error } = await supabase.from("capture_results").insert({ capture_id: captureId, url_id: entry.id, url: entry.url, screenshot_url: screenshotUrl, axe_violations: axeResult.violations, axe_score: axeResult.score, error: errors });
    if (error) failed++;
  }
  await supabase.from("captures").update({ status: failed === (urls?.length ?? 0) ? "error" : "complete" }).eq("id", captureId);
  return NextResponse.json({ success: true, total: urls?.length ?? 0, failed });
}
