import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId) await supabase.from("profiles").update({ plan: "pro", stripe_customer_id: session.customer as string, stripe_subscription_id: session.subscription as string, subscribed_at: new Date().toISOString() }).eq("id", userId);
  }
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase.from("profiles").update({ plan: "free" }).eq("stripe_subscription_id", subscription.id);
  }
  return Response.json({ received: true });
}
