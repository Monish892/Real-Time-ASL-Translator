import { useEffect, useRef, useState } from "react";
import { LandmarkOverlay } from "./LandmarkOverlay";
import type { Landmark, WSStatus } from "@/hooks/useWebSocket";
import { Loader2, VideoOff, Wifi, WifiOff } from "lucide-react";

type Props = {
  onFrame: (dataUrl: string) => void;
  landmarks?: Landmark[];
  status: WSStatus;
  intervalMs?: number;
  showFps?: boolean;
};

export function WebcamFeed({ onFrame, landmarks, status, intervalMs = 100, showFps = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ w: 640, h: 480 });
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ count: 0, last: performance.now() });

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            const v = videoRef.current!;
            setSize({ w: v.videoWidth, h: v.videoHeight });
            setReady(true);
          };
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera access denied");
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const v = videoRef.current;
      const c = captureCanvasRef.current;
      if (!v || !c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL("image/jpeg", 0.6);
      onFrame(dataUrl);

      // FPS
      const r = fpsRef.current;
      r.count++;
      const now = performance.now();
      if (now - r.last >= 1000) {
        setFps(r.count);
        r.count = 0;
        r.last = now;
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [ready, intervalMs, onFrame]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black">
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <VideoOff className="h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <LandmarkOverlay landmarks={landmarks} width={size.w} height={size.h} />
          <canvas ref={captureCanvasRef} className="hidden" />

          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Status chip */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur">
            {status === "open" ? (
              <Wifi className="h-3 w-3 text-primary" />
            ) : (
              <WifiOff className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="font-mono uppercase tracking-wider text-muted-foreground">
              {status === "open" ? "live" : status}
            </span>
          </div>

          {showFps && ready && (
            <div className="absolute right-3 top-3 rounded-full border border-border/60 bg-background/70 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
              {fps} fps
            </div>
          )}
        </>
      )}
    </div>
  );
}
