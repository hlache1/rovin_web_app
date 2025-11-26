import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, content } = await req.json();

    if (!Array.isArray(to)) {
      throw new Error(`'to' debe ser un array de números.`);
    }

    const url = `${process.env.WHATSAPP_API_URL}/api/sendText`;

    const tasks = to.map(async (number) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.WAHA_API_KEY!,
          Accept: "application/json",
        },
        body: JSON.stringify({
          chatId: String(number),
          reply_to: null,
          text: content,
          linkPreview: true,
          linkPreviewHighQuality: false,
          session: "default",
        }),
      });

      return {
        number,
        ok: res.ok,
        status: res.status,
        response: await res.json(),
      };
    });

    const results = await Promise.all(tasks);

    return NextResponse.json({
      success: true,
      total: results.length,
      sent: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
