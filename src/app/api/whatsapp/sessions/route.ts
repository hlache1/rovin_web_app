import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const API_KEY = process.env.WAHA_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "WAHA_API_KEY no configurado" },
        { status: 500 }
      );
    }

    const whatsappApiUrl = process.env.WHATSAPP_API_URL || "http://localhost:3000";
    const sessionName = "default"
    // email.replace(/[^a-zA-Z0-9]/g, "_");

    // Check if session exists
    const checkResp = await fetch(
      `${whatsappApiUrl}/api/sessions/${sessionName}`,
      {
        method: "GET",
        headers: { "X-Api-Key": API_KEY, accept: "application/json" },
      }
    );

    if (checkResp.ok) {
      return NextResponse.json({ ok: true, exists: true });
    }

    // Create new session
    const createResp = await fetch(`${whatsappApiUrl}/api/sessions`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: sessionName,
        start: true,
        config: {
          metadata: {
            "user.email": email,
          },
          proxy: null,
          debug: false,
          ignore: { status: null, groups: null, channels: null },
          noweb: { store: { enabled: true, fullSync: false } },
          webjs: { tagsEventsOn: false },
          webhooks: [
            {
              url: "https://webhook.site/11111111-1111-1111-1111-11111111",
              events: ["message", "session.status"],
            },
          ],
        },
      }),
    });

    if (!createResp.ok) {
      const error = await createResp.json().catch(() => ({}));
      return NextResponse.json(
        { error: error?.message || "No se pudo crear la sesión" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, exists: false });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
