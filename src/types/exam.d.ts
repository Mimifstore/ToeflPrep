export type ExamOption = {
  id: string;
  label: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  order: number;
  type: string;
  question: string;
  audio?: string | null;
  image?: string | null;
  audioPlayLimit?: number | null;
  answer?: string | null;
  options: ExamOption[];
  playCount?: number;
  directionBefore?: string | null;
  passageDirection?: string | null;
};

export type ExamSection = {
  id: string;
  title: string;
  direction?: string | null;
  order: number;
  questions: ExamQuestion[];
};

export type ExamSessionResponse = {
  id: string;
  status: string;
  expiredAt: string;
  remainingTime: number | null;
  currentQuestionId?: string | null;
  currentSection: number;
  tabWarning?: number;
  fullscreenWarning?: number;


  ujian: {
    id: string;
    title: string;
    showNavigation: boolean;
    showQuestionNumber: boolean;
    autoNextQuestion: boolean;
    showPrevNextButton: boolean;
    questionDisplayType: string;
    questionDisplayType: string;
    maxExitAttempts?: number;
  };

  sections: ExamSection[];
};