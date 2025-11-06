import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const { to, content } = await req.json();
  
      const response = await fetch("https://conversations.messagebird.com/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.WHATSAPP_CHANNEL_ID,
          to,
          type: "text",
          content: { text: content },
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