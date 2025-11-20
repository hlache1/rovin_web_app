"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  const params = useSearchParams()!;
  const sessionId = params.get("session_id");

  useEffect(() => {
    async function confirm() {
      if (!sessionId) return;
      await fetch(`/api/subscriptions/confirm?session_id=${sessionId}`);
      router.push("/dashboard");
    }
    confirm();
  }, [sessionId, router]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold mb-4">Confirmando tu suscripción...</h1>
      <p>Por favor espera mientras verificamos tu pago.</p>
    </div>
  );
}
