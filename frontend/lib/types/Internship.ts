export interface InternshipQuestionResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export interface InternshipApplication {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university: string;
  major: string;
  graduationYear: number;
  resumeUrl?: string;
  coverLetter?: string;
  firstChoiceCommittee: string;
  secondChoiceCommittee?: string;
  thirdChoiceCommittee?: string;
  firstChoiceResponses: InternshipQuestionResponse[];
  secondChoiceResponses: InternshipQuestionResponse[];
  thirdChoiceResponses: InternshipQuestionResponse[];
  firstChoiceStatus: string;
  secondChoiceStatus: string;
  thirdChoiceStatus: string;
  applicationCycle: string;
  submittedAt: string;
  lastModifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type InternshipApplicationsResult =
  | { success: true; data: InternshipApplication[] }
  | { success: false; error: string };

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

export interface InternshipCustomQuestion {
  questionKey: string;
  questionText: string;
  questionType: "short_text" | "long_text" | "multiple_choice";
  required?: boolean;
  order?: number;
  choices?: string[];
}

export type CreateInternshipCommitteePayload = {
  name: string;
  displayName: string;
  description?: string;
  subcommittees?: string[];
  isActive?: boolean;
  internLimit?: number;
  applicationDeadline?: string | Date;
  customQuestions?: InternshipCustomQuestion[];
};

export type CreateInternshipCommitteeResult =
  | { success: true; data: InternshipCommittee }
  | { success: false; error: string };
