import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebcamFeed } from "@/components/WebcamFeed";
import { TranslationPanel } from "@/components/TranslationPanel";
import { AslReference } from "@/components/AslReference";
import { BackendSettings } from "@/components/BackendSettings";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSpeech } from "@/hooks/useSpeech";
import {
  applyLetter,
  commitSentence,
  initialSentenceState,
  type SentenceState,
} from "@/lib/sentenceBuilder";
import { Hand } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Signal — Real-time ASL Translator" },
      {
        name: "description",
        content:
          "Translate American Sign Language gestures into text and speech in real time using your webcam.",
      },
    ],
  }),
});

const DEFAULT_WS = "ws://localhost:8000/ws/translate";
const CONFIDENCE_THRESHOLD = 0.8;
const LETTER_HOLD_MS = 1500;

function Index() {
  const [wsUrl, setWsUrl] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_WS;
    return localStorage.getItem("asl_ws_url") || DEFAULT_WS;
  });
  const { status, prediction, send } = useWebSocket(wsUrl);
  const { speak, cancel } = useSpeech();

  const [muted, setMuted] = useState(false);
  const [sentenceState, setSentenceState] = useState<SentenceState>(initialSentenceState);
  const [stableLetter, setStableLetter] = useState<string | null>(null);
  const [stableConfidence, setStableConfidence] = useState(0);

  // Debounce: a letter must hold for LETTER_HOLD_MS before being added to the word.
  const candidateRef = useRef<{ letter: string | null; since: number }>({
    letter: null,
    since: 0,
  });
  const lastAppendedRef = useRef<string | null>(null);

  useEffect(() => {
    const { letter, confidence = 0 } = prediction;
    const valid = !!letter && confidence >= CONFIDENCE_THRESHOLD;
    const now = performance.now();
    const cand = candidateRef.current;

    if (!valid) {
      if (!letter) {
        // No hand — reset candidate so the next sign can re-trigger.
        candidateRef.current = { letter: null, since: now };
        lastAppendedRef.current = null;
        setStableLetter(null);
        setStableConfidence(0);
      }
      return;
    }

    if (cand.letter !== letter) {
      candidateRef.current = { letter, since: now };
      setStableLetter(letter);
      setStableConfidence(confidence);
      return;
    }

    setStableConfidence(confidence);

    if (
      now - cand.since >= LETTER_HOLD_MS &&
      lastAppendedRef.current !== letter
    ) {
      lastAppendedRef.current = letter;
      setSentenceState((s) => applyLetter(s, letter));
    }
  }, [prediction]);

  // Frame send
  const handleFrame = useCallback(
    (dataUrl: string) => {
      send(JSON.stringify({ frame: dataUrl }));
    },
    [send],
  );

  // Auto-speak completed sentences
  const lastHistoryLen = useRef(0);
  useEffect(() => {
    if (muted) return;
    if (sentenceState.history.length > lastHistoryLen.current) {
      const latest = sentenceState.history[sentenceState.history.length - 1];
      speak(latest);
    }
    lastHistoryLen.current = sentenceState.history.length;
  }, [sentenceState.history, muted, speak]);

  // Manual actions
  const handleSpeak = useCallback(() => {
    const text =
      (sentenceState.currentSentence + " " + sentenceState.currentWord).trim() ||
      sentenceState.history[sentenceState.history.length - 1] ||
      "";
    if (text) speak(text);
  }, [sentenceState, speak]);

  const handleClear = useCallback(() => {
    setSentenceState(initialSentenceState);
    cancel();
    lastHistoryLen.current = 0;
    lastAppendedRef.current = null;
  }, [cancel]);

  const handleExport = useCallback(() => {
    const all = [
      ...sentenceState.history,
      (sentenceState.currentSentence + " " + sentenceState.currentWord).trim(),
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([all || "(empty)"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asl-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sentenceState]);

  const handleSpace = useCallback(() => {
    setSentenceState((s) => applyLetter(s, "SPACE"));
    lastAppendedRef.current = null;
  }, []);
  const handleDelete = useCallback(() => {
    setSentenceState((s) => applyLetter(s, "DEL"));
    lastAppendedRef.current = null;
  }, []);
  const handleEnter = useCallback(() => {
    setSentenceState((s) => commitSentence(s));
    lastAppendedRef.current = null;
  }, []);

  const displayLetter = useMemo(() => stableLetter, [stableLetter]);

  return (
    <div className="min-h-screen grid-bg">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary glow-primary">
              <Hand className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">
                Signal
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Real-time ASL translator
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-mono text-muted-foreground sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "open"
                  ? "bg-primary shadow-[0_0_10px_currentColor]"
                  : "bg-muted-foreground/40"
              }`}
            />
            backend {status}
          </div>
        </header>

        {/* Main grid */}
        <div className="grid flex-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Left: webcam + reference + settings */}
          <div className="flex flex-col gap-4">
            <WebcamFeed
              onFrame={handleFrame}
              landmarks={prediction.landmarks}
              status={status}
            />
            <BackendSettings url={wsUrl} onChange={setWsUrl} />
            <AslReference />
          </div>

          {/* Right: translation */}
          <TranslationPanel
            letter={displayLetter}
            confidence={stableConfidence}
            state={sentenceState}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onSpeak={handleSpeak}
            onClear={handleClear}
            onExport={handleExport}
            onSpace={handleSpace}
            onDelete={handleDelete}
            onEnter={handleEnter}
          />
        </div>

        <footer className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          Frontend on Lovable · Backend: FastAPI + MediaPipe + TensorFlow
        </footer>
      </div>
    </div>
  );
}
