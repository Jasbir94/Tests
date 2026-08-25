import { create } from 'zustand';

export type QuestionData = {
  type: "MCQ" | "MSQ" | "NAT";
  key: string;
  marks: number;
};

export type AnswerMap = Record<number, QuestionData>;

interface TestCreationState {
  step: number;
  pdfFile: File | null;
  pdfPreviewUrl: string | null;
  answerKey: AnswerMap;
  testName: string;
  duration: number; // in minutes
  totalQuestions: number;
  questionPageMap: Record<number, number>;
  questionOptionsMap: Record<number, Record<string, string>>;
  dbTestId: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPdfFile: (file: File | null) => void;
  setAnswerKey: (key: AnswerMap) => void;
  updateAnswer: (qNum: number, data: QuestionData) => void;
  setTestConfig: (config: Partial<TestCreationState>) => void;
  reset: () => void;
}

export const useTestCreationStore = create<TestCreationState>((set) => ({
  step: 1,
  pdfFile: null,
  pdfPreviewUrl: null,
  answerKey: {},
  testName: '',
  duration: 180,
  totalQuestions: 0,
  questionPageMap: {},
  questionOptionsMap: {},
  dbTestId: null,
  
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  
  setPdfFile: (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      set({ pdfFile: file, pdfPreviewUrl: url });
    } else {
      set({ pdfFile: null, pdfPreviewUrl: null });
    }
  },
  
  setAnswerKey: (key) => set({ answerKey: key }),
  
  updateAnswer: (qNum, data) => set((state) => ({
    answerKey: { ...state.answerKey, [qNum]: data }
  })),
  
  setTestConfig: (config) => set((state) => ({ ...state, ...config })),
  
  reset: () => set({
    step: 1,
    pdfFile: null,
    pdfPreviewUrl: null,
    answerKey: {},
    testName: '',
    duration: 180,
    totalQuestions: 0,
    questionPageMap: {},
    questionOptionsMap: {},
    dbTestId: null,
  })
}));
