import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    const clientId = process.env.META_APP_ID!;
    const clientSecret = process.env.META_APP_SECRET!;
    
    const redirect_url = "https://localhost:8080/meta-auth"

    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirect_url)}` +
      `&client_secret=${clientSecret}` +
      `&code=${code}`;

    const tokenRes = await fetch(tokenUrl, { method: "GET" });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token exchange error", tokenData);
      return NextResponse.json(
        { error: "Error exchanging code", details: tokenData },
        { status: 500 }
      );
    }

    // tokenData = { access_token, token_type, expires_in }
    console.log("Token data:", tokenData);

    // TODO: Check data and save to DB

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error: any) {
    console.error("Backend auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
