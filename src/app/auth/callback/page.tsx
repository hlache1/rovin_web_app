// app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  async function handleWhatsappSession(email: string) {
    try {
      const resp = await fetch("/api/whatsapp/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      if (!resp.ok) {
        const { error } = await resp.json();
        throw new Error(error || "Error en sesión de WhatsApp");
      }

      const data = await resp.json();
      return data;
    } catch (err) {
      console.error("Error en WhatsApp:", err);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        await handleWhatsappSession(data.session.user.email! || '');
        router.replace("/dashboard");
      }
      else router.replace("/signin");
    });
  }, [router]);

  return <p>Redirigiendo...</p>;
}
