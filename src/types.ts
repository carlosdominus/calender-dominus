export type DayOfWeek = "Segunda-feira" | "Quarta-feira" | "Sexta-feira";

export interface ScheduledCall {
  id: string;
  dayOfWeek: DayOfWeek;
  dayShort: string; // "SEG", "QUA", "SEX"
  time: string; // "14:30"
  topic: string;
  host: string;
  description: string;
  meetingLink?: string;
}

export interface CallOccurrence {
  id: string;
  date: string; // "2026-07-28"
  formattedDate: string; // "Segunda-feira, 28 de Julho"
  dayOfWeek: DayOfWeek;
  time: string; // "14:30"
  topic: string;
  host: string;
  isToday: boolean;
  status: "upcoming" | "in_progress" | "completed";
}

export interface PresenceConfirmation {
  id: string;
  callId: string;
  name: string;
  email: string;
  role: string;
  status: "confirmed" | "late" | "absent";
  notes?: string;
  timestamp: string;
}

export interface WebhookLog {
  id: string;
  type: "dispatch_n8n" | "presence_response";
  url: string;
  payload: any;
  status: "success" | "error";
  statusCode?: number;
  response?: string;
  timestamp: string;
}

export interface AppConfig {
  webhookUrl: string;
  callDays: string[];
  callTime: string;
  topics: Record<string, { topic: string; host: string }>;
}
