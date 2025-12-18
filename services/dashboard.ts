
import api from "./client";
import { Lead } from "../types";

type BackendRecentLead = {
  id: number;
  lead_name: string | null;
  lead_number: string | null;
  email: string | null;
  location_preference: string | null;
  source: string | null;
  pipeline_stage: string | null;
  ai_summary: string | null;
  dob?: string | null;
  insurance?: string | null;
  call_summary?: string | null;
  latest_reply: string | null;
  created_at: string | null;
  timestamp: string | null;

  // 🔥 NEW: match what backend actually returns
  scheduled_at?: string | null;              // if you return this from appointments
  appointmentDate?: string | null;  // or this alias

  saleAmount?: number | null;
  notes?: string | null;
};

export async function fetchRecentActivityLeads(): Promise<Lead[]> {
  const res = await api.get("/user/dashboard/recent-activity/list", {
    params: { page: 1, limit: 1000 },
  });

  const items: BackendRecentLead[] = res.data?.data?.items ?? [];

  return items.map((row): Lead => {
    const ts =
      row.timestamp
        ? new Date(Number(row.timestamp)).toISOString()
        : row.created_at || new Date().toISOString();

    const callAttempts =
      row.ai_summary
        ? [
            {
              id: `${row.id}-ai-1`,
              type: "ai",
              ts,
              outcome: "answered",
              summary: row.ai_summary,
            } as any,
          ]
        : [];

    const messages =
      row.latest_reply
        ? [
            {
              id: `${row.id}-msg-1`,
              from: "lead",
              text: row.latest_reply,
              ts,
            } as any,
          ]
        : [];

    // 🔥 Pull appointment from backend fields
    const appointmentDate =
      row.appointmentDate||
      row.scheduled_at ||
      null;

    return {
      id: String(row.id),

      name: row.lead_name ?? "Unknown",
      phone: row.lead_number ?? "",
      email: row.email ?? "",

      location: (row.location_preference ?? "") as any,
      source: (row.source ?? "Unknown") as any,
      status: (row.pipeline_stage ?? "New") as any,

      appointmentDate: appointmentDate,                        // 👈 now populated
      saleAmount: row.saleAmount ?? null,
      notes: row.notes ?? row.ai_summary ?? "",
      callSummary: row.call_summary ?? null,
      dob: row.dob ?? null,
      insurance: row.insurance ?? null,

      dateCaptured: ts,
      callAttempts,
      messages,
    };
  });
}
