export interface InternshipQuestionResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export interface InternshipApplication {
  uuid: string;
  applicant: string;
  status: string;
  responses: InternshipQuestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export type FetchApplicationByIdResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string };

export interface InternshipCommitteeQuestion {
  questionKey: string;
  questionText: string;
  questionType: "short_text" | "long_text" | "multiple_choice";
  required: boolean;
  order: number;
  choices: string[];
}

export interface InternshipCommittee {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  subcommittees: string[];
  isActive: boolean;
  internLimit?: number;
  applicationDeadline?: string;
  customQuestions: InternshipCommitteeQuestion[];
}

export type FetchCommitteeByIdResult = { success: true; data: InternshipCommittee } | { success: false; error: string };
