import { NextResponse } from "next/server";
import { readUserFromCookie } from "@/lib/auth";
import { pool } from "@/lib/db";
import { client } from "@/lib/openai";

async function canAccess(projectId: string, userId: number) {
  const q = await pool.query(
    `SELECT p.id FROM projects p LEFT JOIN project_members m ON p.id=m.project_id WHERE p.id=$1 AND (p.owner_id=$2 OR m.user_id=$2) LIMIT 1`,
    [projectId, userId]
  );
  return !!q.rows[0];
}

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { projectId } = await params;
  if (!(await canAccess(projectId, auth.userId))) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const history = await pool.query("SELECT id, prompt, image_data, created_at FROM image_generations WHERE project_id=$1 ORDER BY created_at DESC LIMIT 50", [projectId]);
  return NextResponse.json({ images: history.rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await readUserFromCookie();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { projectId } = await params;
  if (!(await canAccess(projectId, auth.userId))) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { prompt, size = "1024x1024" } = await req.json();
  const imageResp = await client.images.generate({ model: "gpt-image-2", prompt, size });
  const b64 = imageResp.data?.[0]?.b64_json;
  if (!b64) return NextResponse.json({ error: "生成失败" }, { status: 500 });
  const imageData = `data:image/png;base64,${b64}`;
  const saved = await pool.query(
    "INSERT INTO image_generations (project_id, user_id, prompt, image_data) VALUES ($1,$2,$3,$4) RETURNING id, prompt, image_data, created_at",
    [projectId, auth.userId, prompt, imageData]
  );
  return NextResponse.json({ image: saved.rows[0] });
}
