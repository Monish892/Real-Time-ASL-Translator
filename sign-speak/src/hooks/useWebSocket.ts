import { useEffect, useRef, useState, useCallback } from "react";

export type Landmark = { x: number; y: number };
export type Prediction = {
  letter: string | null;
  confidence?: number;
  landmarks?: Landmark[];
};

export type WSStatus = "idle" | "connecting" | "open" | "closed" | "error";

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>("idle");
  const [prediction, setPrediction] = useState<Prediction>({ letter: null });
  const reconnectTimer = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!url) return;
    try {
      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setStatus("open");
      ws.onclose = () => {
        setStatus("closed");
        // auto-retry after 2s
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = window.setTimeout(connect, 2000);
      };
      ws.onerror = () => setStatus("error");
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setPrediction(data);
        } catch {
          // ignore malformed
        }
      };
    } catch {
      setStatus("error");
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const send = useCallback((payload: string | ArrayBuffer) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      return true;
    }
    return false;
  }, []);

  return { status, prediction, send };
}
