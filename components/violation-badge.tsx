export function ViolationBadge({ impact }: { impact: string | null }) {
  const name = impact || "minor";
  const styles: Record<string, string> = { critical: "bg-[#FDECEA] text-[#C62828]", serious: "bg-[#FFE0EE] text-[#8B0040]", moderate: "bg-[#FFF0E0] text-[#7A3800]", minor: "bg-[#F0F0F4] text-[#4A4A5A]" };
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-bold capitalize ${styles[name] ?? styles.minor}`}>{name}</span>;
}
