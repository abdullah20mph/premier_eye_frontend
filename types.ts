export type CallOutcome = "answered" | "voicemail" | "no_response" | "booked";

export type LeadStatus =
  | "New"
  | "AI Called – No Answer"
  | "AI Spoke to Lead"
  | "Needs VA Follow-Up"
  | "Appointment Booked"
  | "Appointment Completed"
  | "No Show"
  | "Not Interested";

export type Message = {
  id: string;
  from: "bot" | "lead";
  text: string;
  ts: string; // ISO
};

export type CallAttempt = {
  id: string;
  ts: string;
  durationSec?: number;
  outcome: CallOutcome;
  summary?: string;
  recordingUrl?: string;
};

export type EmailLog = {
  subject: string;
  ts: string;
  opened: boolean;
};

export type LocationOption = "Plantation" | "Boca Raton" | "West Palm";

export type PipelineStage =
  | "NEW_LEAD"
  | "AI_ENGAGING"
  | "NEEDS_ACTION"
  | "BOOKED"
  | "COMPLETED_PAID";


export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  location?: LocationOption;
  created_at?: string;   // 🔥 Backend field — required for sorting and pagination
  dateCaptured?: string;   // 🔥 Existing field used as fallback
  dob?: string;
  insurance?: string | null;
  status: LeadStatus;
  pipelineStage?: PipelineStage; 
  // 🔥 Appointment injected from backend (JOIN)
  appointmentDate?: string | null;
  service?: string | null;
  saleAmount?: number | null;
  notes?: string;
  messages: Message[];
  callAttempts: CallAttempt[];
  lastEmail?: EmailLog | null;
};


export const InsuranceOption = [
  "VSP",
  "EyeMed",
  "Spectera",
  "Humana Vision",
  "Cigna",
  "UnitedHealthcare",
  "Other",
] as const;

export const LocationOptions = [
  "Plantation",
  "Boca Raton",
  "West Palm",
] as const;