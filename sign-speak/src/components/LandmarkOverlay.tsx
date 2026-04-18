import { useEffect, useRef } from "react";
import type { Landmark } from "@/hooks/useWebSocket";

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function LandmarkOverlay({
  landmarks,
  width,
  height,
}: {
  landmarks?: Landmark[];
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks || landmarks.length === 0) return;

    const pts = landmarks.map((l) => ({ x: l.x * canvas.width, y: l.y * canvas.height }));

    // Connections
    ctx.strokeStyle = "oklch(0.78 0.18 150 / 0.7)";
    ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      if (!pts[a] || !pts[b]) continue;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    }

    // Dots
    ctx.fillStyle = "oklch(0.85 0.2 150)";
    ctx.shadowColor = "oklch(0.78 0.18 150)";
    ctx.shadowBlur = 8;
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ transform: "scaleX(-1)" }}
    />
  );
}
