import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
