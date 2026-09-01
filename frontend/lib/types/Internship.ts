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
  firstChoiceOfficer1Rating?: "yes" | "no" | "maybe" | null;
  secondChoiceOfficer1Rating?: "yes" | "no" | "maybe" | null;
  thirdChoiceOfficer1Rating?: "yes" | "no" | "maybe" | null;
  firstChoiceOfficer2Rating?: "yes" | "no" | "maybe" | null;
  secondChoiceOfficer2Rating?: "yes" | "no" | "maybe" | null;
  thirdChoiceOfficer2Rating?: "yes" | "no" | "maybe" | null;
  firstChoiceNotes?: string;
  secondChoiceNotes?: string;
  thirdChoiceNotes?: string;
  applicationCycle: string;
  submittedAt: string;
  lastModifiedAt: string;
  submissionStatus?: "draft" | "submitted";
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
  isActive: boolean;
  internLimit?: number;
  applicationDeadline?: string;
  customQuestions: InternshipCommitteeQuestion[];
}

export type FetchCommitteeByIdResult = { success: true; data: InternshipCommittee } | { success: false; error: string };

export interface InternshipCommitteeAdminListItem extends InternshipCommittee {
  applicationCount: number;
}

export type FetchCommitteesResult =
  | { success: true; data: InternshipCommitteeAdminListItem[] }
  | { success: false; error: string };

export type BulkCommitteeStatusAction = "open" | "close";

export type BulkUpdateCommitteeStatusPayload = {
  action: BulkCommitteeStatusAction;
  committeeIds?: string[];
};

export type BulkUpdateCommitteeStatusResult =
  | { success: true; modified: number }
  | { success: false; error: string };

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
  isActive?: boolean;
  internLimit?: number;
  applicationDeadline?: string | Date;
  customQuestions?: InternshipCustomQuestion[];
};

export type CreateInternshipCommitteeResult =
  | { success: true; data: InternshipCommittee }
  | { success: false; error: string };

export type UpdateInternshipCommitteePayload = Partial<CreateInternshipCommitteePayload>;

export type UpdateInternshipCommitteeResult =
  | { success: true; data: InternshipCommittee }
  | { success: false; error: string };

export type DeleteInternshipCommitteeResult =
  | { success: true; deletedApplications: number; updatedApplications: number }
  | { success: false; error: string };

export interface InternshipCycleInfo {
  currentCycle: string;
  suggestedNextCycle: string;
  pastCycles: string[];
}

export type FetchCycleInfoResult =
  | { success: true; data: InternshipCycleInfo }
  | { success: false; error: string };

export type AdvanceCycleResult =
  | { success: true; previousCycle: string; newCycle: string; archivedCount: number }
  | { success: false; error: string };

export interface FetchApplicationsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  committeeId?: string;
  choiceRank?: "1" | "2" | "3";
  applicationCycle?: string;
  archived?: boolean;
  includeDrafts?: boolean;
}

export interface InternshipApplicationsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export type InternshipApplicationsListResult =
  | { success: true; data: InternshipApplication[]; pagination: InternshipApplicationsPagination }
  | { success: false; error: string };
