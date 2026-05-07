import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const user = await pool.query("SELECT stripe_customer_id FROM users WHERE id=$1", [auth.userId]);
  const customerId = user.rows[0]?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ error: "请先订阅" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
  });

  return NextResponse.json({ url: session.url });
}
