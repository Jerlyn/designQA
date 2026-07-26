export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-teal/25 text-[#07545a]", running: "bg-brand/15 text-brand", pending: "bg-brand/15 text-brand", error: "bg-pink/20 text-[#8d164b]"
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? styles.pending}`}>{status}</span>;
}
