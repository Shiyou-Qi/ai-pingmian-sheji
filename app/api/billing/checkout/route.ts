import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { priceId } = await req.json();

  const user = await pool.query("SELECT id,email,stripe_customer_id FROM users WHERE id=$1", [auth.userId]);
  const row = user.rows[0];
  if (!row) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  let customerId = row.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: row.email, metadata: { userId: String(row.id) } });
    customerId = customer.id;
    await pool.query("UPDATE users SET stripe_customer_id=$1 WHERE id=$2", [customerId, row.id]);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?billing=cancel`
  });
  return NextResponse.json({ url: session.url });
}
