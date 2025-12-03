import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
      const cookieStore = await cookies();
      const phoneNumberId = cookieStore.get("phone_number_id")?.value;
      const metaToken = cookieStore.get("meta_token")?.value;

      if (!metaToken) {
        return NextResponse.json({ error: "Missing Meta access token" }, { status: 400 } );
      }
      
      if (!phoneNumberId) {
        return NextResponse.json({ error: "Missing phone number ID" }, { status: 400 } );
      }

      const { to, content } = await req.json();
      const url = `https://graph.facebook.com/${process.env.META_API_VERSION}/${phoneNumberId}/messages`;
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${metaToken}`,
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
        throw new Error(`Meta error: ${text}`);
      }
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }