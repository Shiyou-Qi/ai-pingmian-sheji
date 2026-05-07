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

  const hash = await bcrypt.hash(input.data.password, 10);
  const result = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT(email) DO NOTHING RETURNING id, email, plan",
    [input.data.email, hash]
  );
  if (!result.rows[0]) return NextResponse.json({ error: "邮箱已存在" }, { status: 409 });

  const token = await createToken({ userId: result.rows[0].id, email: result.rows[0].email });
  const res = NextResponse.json({ user: result.rows[0] });
  res.cookies.set("nf_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
