"use client";
import { useEffect } from "react";

export default function MetaAuthPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      const redirectUri = `${window.location.origin}/meta-auth`;

      fetch("/api/meta/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
      })
        .then((r) => r.json())
        .then((data) => {
          console.log("Access token recibido:", data);
        })
        .catch((err) => {
          console.error("Error enviando code a backend:", err);
        });
    }
  }, []);

  return <div>Autenticando con Meta...</div>;
}
