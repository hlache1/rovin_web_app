import { useState, useRef } from 'react'

export function useWhatsappSession() {
    const [status, setStatus] = useState(null);
    const [qr, setQr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
  
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
    const fetchStatus = async () => {
      const resp = await fetch(`/api/whatsapp/status`);
      const data = await resp.json();
      setStatus(data.status);
      return data.status;
    };
  
    const startSession = async () => {
      await fetch("/api/whatsapp/start", { method: "POST" });
    };
  
    const restartSession = async () => {
      await fetch("/api/whatsapp/restart", { method: "POST" });
    };
  
    const fetchQr = async () => {
      setLoading(true);
      const resp = await fetch(`/api/whatsapp/qr`);
      const blob = await resp.blob();
      setQr(URL.createObjectURL(blob));
      setLoading(false);
    };
  
    const handleFlow = async () => {
      const st = await fetchStatus();
      if (!st) return;
  
      switch (st) {
        case "STOPPED":
          await startSession();
          break;
        case "FAILED":
          await restartSession();
          break;
        case "SCAN_QR_CODE":
          await fetchQr();
          break;
        case "WORKING":
          stopPolling();
          break;
      }
    };
  
    const startPolling = () => {
      handleFlow();
      intervalRef.current = setInterval(handleFlow, 10000);
    };
  
    const stopPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  
    return { status, qr, loading, startPolling, stopPolling };
  }
  