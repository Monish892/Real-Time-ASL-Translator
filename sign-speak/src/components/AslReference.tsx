import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function AslReference() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider">
            ASL alphabet reference
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4">
          <div className="grid grid-cols-9 gap-2 sm:grid-cols-13">
            {LETTERS.map((l) => (
              <div
                key={l}
                className="flex aspect-square items-center justify-center rounded-md border border-border/60 bg-background/40 font-display text-base font-bold"
              >
                {l}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sign each letter clearly facing the camera. Use the on-screen Space / Del / Enter
            buttons to control word & sentence flow if your model doesn't include those gestures.
          </p>
        </div>
      )}
    </div>
  );
}
