import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ user: null }, { status: 401 });
  const user = await pool.query("SELECT id, email, plan FROM users WHERE id=$1", [auth.userId]);
  return NextResponse.json({ user: user.rows[0] ?? null });
}
