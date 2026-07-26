"use client";
import { useState } from "react";
import type { CaptureResult } from "@/lib/types";

export function ExportReportButton({ projectId, baselineCaptureId, comparisonCaptureId, results }: { projectId: string; baselineCaptureId: string; comparisonCaptureId: string; results: { baseline: CaptureResult; comparison: CaptureResult }[] }) {
  const [exporting, setExporting] = useState(false); const [error, setError] = useState("");
  async function exportReport() { setExporting(true); setError(""); try { const response = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, baselineCaptureId, comparisonCaptureId, results }) }); if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Export failed."); } const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "designqa-report.html"; link.click(); URL.revokeObjectURL(url); } catch (reason) { setError(reason instanceof Error ? reason.message : "Export failed."); } finally { setExporting(false); } }
  return <div className="mt-5"><button onClick={exportReport} disabled={exporting} className="rounded-lg bg-gradient-to-r from-brand to-pink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{exporting ? "Exporting…" : "Export Report"}</button>{error && <p className="mt-2 text-sm text-[#DC3545]">{error}</p>}</div>;
}
