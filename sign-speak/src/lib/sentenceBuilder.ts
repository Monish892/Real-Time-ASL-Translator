// Sentence building logic - debounce letters, accumulate into words & sentences.
// "SPACE" letter completes a word, "DEL" deletes last char, "ENTER"/"." completes sentence.

export type SentenceState = {
  currentWord: string;
  currentSentence: string;
  history: string[];
};

export const initialSentenceState: SentenceState = {
  currentWord: "",
  currentSentence: "",
  history: [],
};

export function applyLetter(state: SentenceState, raw: string): SentenceState {
  const letter = raw.toUpperCase();
  if (letter === "SPACE" || letter === "_") {
    if (!state.currentWord) return state;
    return {
      ...state,
      currentWord: "",
      currentSentence: (state.currentSentence + " " + state.currentWord).trim(),
    };
  }
  if (letter === "DEL" || letter === "DELETE") {
    return { ...state, currentWord: state.currentWord.slice(0, -1) };
  }
  if (letter === "ENTER" || letter === ".") {
    const sentence = (state.currentSentence + " " + state.currentWord).trim();
    if (!sentence) return state;
    return {
      currentWord: "",
      currentSentence: "",
      history: [...state.history, sentence],
    };
  }
  return { ...state, currentWord: state.currentWord + letter };
}

export function commitSentence(state: SentenceState): SentenceState {
  const sentence = (state.currentSentence + " " + state.currentWord).trim();
  if (!sentence) return state;
  return {
    currentWord: "",
    currentSentence: "",
    history: [...state.history, sentence],
  };
}
