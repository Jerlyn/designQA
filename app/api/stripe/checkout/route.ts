import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
    metadata: { user_id: user.id },
  });
  return Response.json({ url: session.url });
}
