import { useState } from "react";
import { Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  url: string;
  onChange: (url: string) => void;
};

export function BackendSettings({ url, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(url);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider">Backend WebSocket</span>
        </div>
        <span className="max-w-[60%] truncate font-mono text-[10px] text-muted-foreground">
          {url}
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Point this at your running FastAPI backend, e.g.{" "}
            <code className="text-primary">ws://localhost:8000/ws/translate</code> or a hosted
            URL like <code className="text-primary">wss://your-api.onrender.com/ws/translate</code>.
          </p>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="ws://localhost:8000/ws/translate"
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              onClick={() => {
                onChange(draft);
                localStorage.setItem("asl_ws_url", draft);
              }}
            >
              <Check className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
