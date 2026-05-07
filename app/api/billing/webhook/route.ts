import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { PRICE_TO_PLAN } from "@/lib/plan";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch {
    return NextResponse.json({ error: "签名校验失败" }, { status: 400 });
  }

  if (event.type.startsWith("customer.subscription.")) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const user = await pool.query("SELECT id FROM users WHERE stripe_customer_id=$1", [customerId]);
    const userId = user.rows[0]?.id;
    if (!userId) return NextResponse.json({ ok: true });

    const priceId = sub.items.data[0]?.price?.id || null;
    const plan = (priceId && PRICE_TO_PLAN[priceId]) || "free";
    const status = sub.status;

    await pool.query(
      `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_price_id, status, current_period_end, updated_at)
       VALUES ($1,$2,$3,$4,to_timestamp($5),NOW())
       ON CONFLICT(user_id) DO UPDATE SET stripe_subscription_id=$2, stripe_price_id=$3, status=$4, current_period_end=to_timestamp($5), updated_at=NOW()`,
      [userId, sub.id, priceId, status, sub.current_period_end]
    );

    await pool.query("UPDATE users SET plan=$1 WHERE id=$2", [status === "active" || status === "trialing" ? plan : "free", userId]);
  }

  return NextResponse.json({ received: true });
}
