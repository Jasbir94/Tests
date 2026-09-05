import { create } from 'zustand';

interface AttemptState {
  answers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  visitedQuestions: Record<number, boolean>;
  currentQuestion: number;
  timeRemaining: number; // in seconds
  isSubmitted: boolean;
  pdfPage: number;
  pdfScale: number;
  pdfNumPages: number; // total pages in the loaded PDF
  dbAttemptId: string | null;
  
  setAnswer: (qNum: number, option: string) => void;
  clearAnswer: (qNum: number) => void;
  toggleMarkForReview: (qNum: number) => void;
  markVisited: (qNum: number) => void;
  setCurrentQuestion: (qNum: number) => void;
  setTimeRemaining: (time: number) => void;
  submitTest: () => void;
  resetAttempt: (duration: number, attemptId?: string) => void;
  setPdfPage: (page: number) => void;
  setPdfNumPages: (n: number) => void;
  setPdfScale: (scale: number | ((prev: number) => number)) => void;
}

export const useAttemptStore = create<AttemptState>((set, get) => ({
  answers: {},
  markedForReview: {},
  visitedQuestions: { 1: true },
  currentQuestion: 1,
  timeRemaining: 0,
  isSubmitted: false,
  pdfPage: 1,
  pdfScale: 1.2,
  pdfNumPages: 0,
  dbAttemptId: null,
  
  setAnswer: (qNum, option) => set((state) => ({
    answers: { ...state.answers, [qNum]: option }
  })),
  
  clearAnswer: (qNum) => set((state) => {
    const newAnswers = { ...state.answers };
    delete newAnswers[qNum];
    return { answers: newAnswers };
  }),
  
  toggleMarkForReview: (qNum) => set((state) => ({
    markedForReview: { ...state.markedForReview, [qNum]: !state.markedForReview[qNum] }
  })),

  markVisited: (qNum) => set((state) => ({
    visitedQuestions: { ...state.visitedQuestions, [qNum]: true }
  })),
  
  setCurrentQuestion: (qNum) => set((state) => ({ 
    currentQuestion: qNum,
    visitedQuestions: { ...state.visitedQuestions, [qNum]: true }
  })),
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  submitTest: async () => {
    const state = get();
    if (state.dbAttemptId) {
      // Assuming we need duration to calculate timeTaken, we can calculate it from timeRemaining.
      // But we don't have duration in attemptStore directly unless we infer it.
      // We will just pass timeRemaining.
      try {
        const { submitAttempt } = await import('@/app/actions/attemptActions');
        // We calculate time taken assuming we started with some time. The action can calculate it accurately from `startedAt` anyway.
        await submitAttempt(state.dbAttemptId, state.answers, state.timeRemaining);
      } catch (e) {
        console.error("Failed to submit to backend", e);
      }
    }
    set({ isSubmitted: true });
  },
  
  resetAttempt: (duration, attemptId) => set({
    answers: {},
    markedForReview: {},
    visitedQuestions: { 1: true },
    currentQuestion: 1,
    timeRemaining: duration * 60,
    isSubmitted: false,
    pdfPage: 1,
    pdfScale: 1.2,
    pdfNumPages: 0,
    dbAttemptId: attemptId || null
  }),

  setPdfPage: (page) => set({ pdfPage: page }),
  setPdfNumPages: (n) => set({ pdfNumPages: n }),
  setPdfScale: (scale) => set((state) => ({ 
    pdfScale: typeof scale === 'function' ? scale(state.pdfScale) : scale 
  }))
}));
