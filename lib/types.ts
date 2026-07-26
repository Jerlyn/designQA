export type Project = { id: string; name: string; description: string | null; created_at: string };
export type ProjectUrl = { id: string; project_id: string; url: string; created_at: string };
export type Capture = { id: string; project_id: string; label: string | null; status: "pending" | "running" | "complete" | "error"; created_at: string };
export type AxeViolation = { id: string; impact: "critical" | "serious" | "moderate" | "minor" | null; description: string; help: string; helpUrl: string; nodes: number };
export type CaptureResult = { id: string; capture_id: string; url_id: string; url: string; screenshot_url: string | null; axe_violations: AxeViolation[] | null; axe_score: number | null; error: string | null; created_at: string };
