// app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
      else router.replace("/signin");
    });
  }, [router]);

  return <p>Redirigiendo...</p>;
}
