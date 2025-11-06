"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@/hooks/useUser";

export default function WhatsAppConnect() {
  const { user, loading } = useUser();
  const [qr, setQr] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [status, setStatus] = useState<
    "checking" | "connected" | "saved" | "disconnected"
  >("checking");
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) {
      setStatus("disconnected");
      return;
    }

    let mounted = true;
    (async () => {
      setStatus("checking");
      try {
        const res = await fetch(`http://localhost:3001/session/${user.id}`);
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json.connected) {
            setStatus(json.active ? "connected" : "saved");
          } else {
            setStatus("disconnected");
          }
        } else {
          setStatus("disconnected");
        }
      } catch (err) {
        setStatus("disconnected");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, loading]);

  // Start session (igual que tenías, con limpieza de interval)
  const startSession = async (user_id: string, opts?: { reconnect?: boolean }) => {
    setLoadingSession(true);
    setQr(null);

    try {
      await fetch("http://localhost:3001/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      if (opts?.reconnect) {
        setStatus("connected");
        setLoadingSession(false);
        return;
      }

      // Poll para obtener QR
      pollRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:3001/qr/${user_id}`);
          if (res.ok) {
            const { qr } = await res.json();
            setQr(qr);
            setLoadingSession(false);
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          }
        } catch (err) {
          // ignora, seguirá intentando
        }
      }, 3000);
    } catch (err) {
      setLoadingSession(false);
    }
  };

  // cleanup al desmontar (evita fugas)
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  if (loading) return <div className="dark:text-white/90">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {status === "checking" && <div className="dark:text-white/90">Comprobando sesión...</div>}

      {status === "saved" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: "#F59E0B" }}
            />
            <div>
              <strong>Sesión guardada</strong>
              <div className="text-sm text-gray-500">
                Hay una sesión guardada — puedes reconectar si lo deseas
              </div>
            </div>
          </div>

          <button
            onClick={() => user?.id && startSession(user.id, { reconnect: true })}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reconectar
          </button>
        </div>
      )}


      {status === "connected" && (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "#10B981" }}
          />
          <div>
            {status === "connected" ? (
              <div>
                <strong className="dark:text-white/90">Conectado a WhatsApp</strong>
                <div className="text-sm text-gray-500 dark:text-white/90">La sesión está activa</div>
              </div>
            ) : (
              <div>
                <strong className="dark:text-white/90">Sesión guardada</strong>
                <div className="text-sm text-gray-500 dark:text-white/90">
                  Hay una sesión guardada — puedes reconectar si lo deseas
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {status === "disconnected" && !qr && (
        <button
          onClick={() => user?.id && startSession(user.id)}
          disabled={loadingSession}
          className="px-4 py-2 text-white  bg-green-600 rounded hover:bg-green-700"
        >
          {loadingSession ? "Generando QR..." : "Generar QR"}
        </button>
      )}

      {qr && (
        <div className="mt-4">
          <Image
            src={qr}
            alt="WhatsApp QR"
            className="border p-2"
            width={300}
            height={300}
          />
        </div>
      )}
    </div>
  );
}




