import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plan";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { projectId } = await params;
  const { email, role = "editor" } = await req.json();

  const ownership = await pool.query("SELECT * FROM projects WHERE id=$1 AND owner_id=$2", [projectId, auth.userId]);
  if (!ownership.rows[0]) return NextResponse.json({ error: "仅项目拥有者可添加成员" }, { status: 403 });


  const owner = await pool.query("SELECT u.plan FROM users u JOIN projects p ON p.owner_id=u.id WHERE p.id=$1", [projectId]);
  const memberCount = await pool.query("SELECT COUNT(*)::int AS count FROM project_members WHERE project_id=$1", [projectId]);
  const seatLimit = PLAN_LIMITS[owner.rows[0]?.plan || "free"] || 1;
  if (memberCount.rows[0].count >= seatLimit) return NextResponse.json({ error: "已达到团队席位上限" }, { status: 403 });

  const user = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (!user.rows[0]) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  await pool.query("INSERT INTO project_members (project_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT(project_id,user_id) DO UPDATE SET role=$3", [projectId, user.rows[0].id, role]);
  return NextResponse.json({ ok: true });
}
