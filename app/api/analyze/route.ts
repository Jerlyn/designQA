import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const systemPrompt = `You are a senior accessibility auditor and UX designer reviewing two screenshots of the same web page taken at different times. Identify visual changes that may introduce accessibility regressions.

Return ONLY a JSON object. No preamble, no markdown, no code fences. Format exactly:
{"summary":"One sentence describing the overall change","visualChanges":["Specific visual difference observed"],"accessibilityConcerns":["Specific accessibility risk"],"positiveChanges":["Accessibility improvement visible"],"recommendation":"One actionable sentence for the team"}

If screenshots look identical, say so in summary and return empty arrays for the rest.`;

export async function POST(request: Request) {
  try {
    const body = await request.json(); const { projectId, baselineCaptureId, comparisonCaptureId, url, baselineScreenshotUrl, comparisonScreenshotUrl, baselineScore, comparisonScore, newViolations = [], fixedViolations = [] } = body;
    const scoreChange = (comparisonScore ?? 0) - (baselineScore ?? 0);
    const urlToBase64 = async (imgUrl: string) => { const res = await fetch(imgUrl); const buffer = await res.arrayBuffer(); return { data: Buffer.from(buffer).toString("base64"), mimeType: res.headers.get("content-type") || "image/jpeg" }; };
    const [baseline, comparison] = await Promise.all([urlToBase64(baselineScreenshotUrl), urlToBase64(comparisonScreenshotUrl)]);
    const userText = `Compare these two screenshots of ${url}.\nBaseline score: ${baselineScore === -1 ? "unavailable" : `${baselineScore ?? 0}/100`}\nComparison score: ${comparisonScore === -1 ? "unavailable" : `${comparisonScore ?? 0}/100`}\nScore change: ${scoreChange > 0 ? `+${scoreChange} (improved)` : scoreChange < 0 ? `${scoreChange} (regression)` : "unchanged"}\nNew violations introduced: ${newViolations.length}\nViolations fixed: ${fixedViolations.length}\nNew violations: ${newViolations.map((v: any) => `${v.id} (${v.impact})`).join(", ") || "none"}\nFixed violations: ${fixedViolations.map((v: any) => `${v.id} (${v.impact})`).join(", ") || "none"}\nBaseline screenshot (before):`;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userText}` }, { inlineData: { data: baseline.data, mimeType: baseline.mimeType } }, { text: "Comparison screenshot (after):" }, { inlineData: { data: comparison.data, mimeType: comparison.mimeType } }] }] });
    const raw = response.text ?? "{}"; let analysis;
    try { analysis = JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); } catch { analysis = { summary: raw, visualChanges: [], accessibilityConcerns: [], positiveChanges: [], recommendation: "" }; }
    const supabase = createClient();
    await supabase.from("regression_analyses").upsert({ project_id: projectId, baseline_capture_id: baselineCaptureId, comparison_capture_id: comparisonCaptureId, url, gpt_analysis: JSON.stringify(analysis), score_change: scoreChange, provider: "gemini" });
    return Response.json({ analysis });
  } catch (err: any) {
    console.error("Gemini analysis error:", err);
    return Response.json({ error: err.message, analysis: { summary: `Analysis failed: ${err.message}`, visualChanges: [], accessibilityConcerns: [], positiveChanges: [], recommendation: "Check server logs for details." } }, { status: 200 });
  }
}
