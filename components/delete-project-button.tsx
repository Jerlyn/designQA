"use client";
import { useEffect, useRef, useState } from "react";

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [menuOpen, setMenuOpen] = useState(false); const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); }; document.addEventListener("click", close); return () => document.removeEventListener("click", close); }, []);
  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this project? This will permanently remove all captures and results. This cannot be undone.");
    if (!confirmed) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
    else alert("Failed to delete project. Please try again.");
  }
  return <div ref={menuRef} style={{ position: "absolute", top: "8px", right: "8px" }}><button onClick={(event) => { event.stopPropagation(); setMenuOpen(!menuOpen); }} aria-label="Project options" style={{ width: "28px", height: "28px", borderRadius: "6px", background: "transparent", border: "none", color: "#6C757D", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>⋯</button>{menuOpen && <div style={{ position: "absolute", top: "36px", right: 0, background: "white", border: "1px solid #E9ECEF", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "120px" }}><button onClick={() => { setMenuOpen(false); handleDelete(projectId); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "transparent", border: "none", color: "#DC3545", fontSize: "13px", fontWeight: "600", cursor: "pointer", textAlign: "left" }}>🗑 Delete project</button></div>}</div>;
}
