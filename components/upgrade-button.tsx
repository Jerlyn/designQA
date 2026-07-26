"use client";

import { useState } from "react";

export function UpgradeButton({ children = "Upgrade to Pro — $9/mo" }: { children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json();
    if (response.ok && data.url) window.location.assign(data.url);
    else {
      alert(data.error || "Could not start checkout.");
      setLoading(false);
    }
  }

  return <button onClick={checkout} disabled={loading} className="rounded-lg bg-gradient-to-r from-brand to-pink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Opening checkout…" : children}</button>;
}
