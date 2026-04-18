import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Eraser, Download, CornerDownLeft, Space, Delete } from "lucide-react";
import type { SentenceState } from "@/lib/sentenceBuilder";

type Props = {
  letter: string | null;
  confidence: number;
  state: SentenceState;
  muted: boolean;
  onToggleMute: () => void;
  onSpeak: () => void;
  onClear: () => void;
  onExport: () => void;
  onSpace: () => void;
  onDelete: () => void;
  onEnter: () => void;
};

export function TranslationPanel({
  letter,
  confidence,
  state,
  muted,
  onToggleMute,
  onSpeak,
  onClear,
  onExport,
  onSpace,
  onDelete,
  onEnter,
}: Props) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="flex h-full flex-col gap-5">
      {/* Letter card */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Detected letter
        </div>
        <div
          className={`font-display font-bold leading-none ${
            letter ? "text-glow text-primary" : "text-muted-foreground/40"
          }`}
          style={{ fontSize: "96px" }}
        >
          {letter ?? "—"}
        </div>
        <div className="mt-6 w-full">
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Confidence</span>
            <span>{letter ? `${pct}%` : "—"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${letter ? pct : 0}%` }}
            />
          </div>
        </div>
        {!letter && (
          <p className="mt-4 text-xs text-muted-foreground">No hand detected</p>
        )}
      </div>

      {/* Word + sentence */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Current word
        </div>
        <div className="min-h-[2.5rem] break-all font-display text-2xl font-semibold tracking-wide">
          {state.currentWord || <span className="text-muted-foreground/40">…</span>}
        </div>
        <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Sentence
        </div>
        <div className="min-h-[2rem] break-words text-base text-foreground/80">
          {state.currentSentence || <span className="text-muted-foreground/40">—</span>}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={onSpace}>
            <Space className="h-4 w-4" /> Space
          </Button>
          <Button variant="secondary" size="sm" onClick={onDelete}>
            <Delete className="h-4 w-4" /> Del
          </Button>
          <Button variant="secondary" size="sm" onClick={onEnter}>
            <CornerDownLeft className="h-4 w-4" /> Enter
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Sentence history
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {state.history.length}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {state.history.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">
              Completed sentences will appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {state.history.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={onSpeak} className="gap-2">
            <Volume2 className="h-4 w-4" /> Speak
          </Button>
          <Button variant="outline" onClick={onToggleMute} className="gap-2">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button variant="outline" onClick={onClear} className="gap-2">
            <Eraser className="h-4 w-4" /> Clear
          </Button>
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>
    </div>
  );
}
