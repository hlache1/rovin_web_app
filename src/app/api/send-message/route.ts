import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const { to, content } = await req.json();
      const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PHONE_NUMBER_ID}/messages`;
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.META_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: content },
        }),
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`MessageBird error: ${text}`);
      }
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }