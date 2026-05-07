import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { prompt, size = "1024x1024" } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt 不能为空" }, { status: 400 });

    const result = await client.images.generate({
      model: "gpt-image-2",
      prompt,
      size
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "生成失败" }, { status: 500 });
    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    return NextResponse.json({ error: "调用 OpenAI 失败", detail: String(error) }, { status: 500 });
  }
}
