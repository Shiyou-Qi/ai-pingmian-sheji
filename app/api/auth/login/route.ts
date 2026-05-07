import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool, initDb } from "@/lib/db";
import { createToken } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function POST(req: Request) {
  await initDb();
  const input = schema.safeParse(await req.json());
  if (!input.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  const user = await pool.query("SELECT id, email, plan, password_hash FROM users WHERE email=$1", [input.data.email]);
  const row = user.rows[0];
  if (!row || !(await bcrypt.compare(input.data.password, row.password_hash))) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const token = await createToken({ userId: row.id, email: row.email });
  const res = NextResponse.json({ user: { id: row.id, email: row.email, plan: row.plan } });
  res.cookies.set("nf_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
