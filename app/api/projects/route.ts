import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool, initDb } from "@/lib/db";

export async function GET() {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const result = await pool.query(
    `SELECT p.* FROM projects p
     LEFT JOIN project_members m ON p.id = m.project_id
     WHERE p.owner_id=$1 OR m.user_id=$1
     GROUP BY p.id ORDER BY p.created_at DESC`,
    [auth.userId]
  );
  return NextResponse.json({ projects: result.rows });
}

export async function POST(req: Request) {
  await initDb();
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { name } = await req.json();
  const created = await pool.query("INSERT INTO projects (owner_id, name) VALUES ($1, $2) RETURNING *", [auth.userId, name || "未命名项目"]);
  await pool.query("INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING", [created.rows[0].id, auth.userId]);
  return NextResponse.json({ project: created.rows[0] });
}
