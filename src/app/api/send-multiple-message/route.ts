import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, content } = await req.json();

    console.log("Enviando mensaje a múltiples números:", to);

    if (!Array.isArray(to)) {
      throw new Error(`'to' debe ser un array de números.`);
    }

    const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PHONE_NUMBER_ID}/messages`;

    const tasks = to.map(async (number) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.META_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: number,
          type: "text",
          text: { body: content },
        }),
      });

      return {
        number,
        ok: res.ok,
        response: await res.json(),
      };
    });

    const results = await Promise.all(tasks);

    console.log("Resultados del envío masivo:", results);

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
