import { useCallback, useRef } from "react";

export function useSpeech() {
  const lastSpoken = useRef<string>("");

  const speak = useCallback((text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (text === lastSpoken.current) return;
    lastSpoken.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    lastSpoken.current = "";
  }, []);

  return { speak, cancel };
}
