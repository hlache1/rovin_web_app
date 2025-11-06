
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user_id, message } = await request.json();

    const api_url = process.env.BACKEND_API_URL;
    const response = await fetch(`${api_url}/api/agent/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del backend: ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: "ok",
      response: data.response,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
