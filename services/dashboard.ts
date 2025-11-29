
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
  latest_reply: string | null;
  created_at: string | null;
  timestamp: string | null;
  appointmentDate?: string | null;
  saleAmount?: number | null;
  notes?: string | null;
};

export async function fetchRecentActivityLeads(): Promise<Lead[]> {
  const res = await api.get("/user/dashboard/recent-activity/list", {
    params: { page: 1, limit: 50 },
  });

  const items: BackendRecentLead[] = res.data?.data?.items ?? [];

  return items.map((row): Lead => {
    // Pick a reasonable timestamp
    const ts =
      row.timestamp
        ? new Date(Number(row.timestamp)).toISOString()
        : row.created_at || new Date().toISOString();

    // Build 1 AI call attempt if we have a summary
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

    return {
      id: String(row.id),

      name: row.lead_name ?? "Unknown",
      phone: row.lead_number ?? "",
      email: row.email ?? "",

      // cast because Lead.location / Lead.status are unions
      location: (row.location_preference ?? "") as any,
      source: (row.source ?? "Unknown") as any,
      status: (row.pipeline_stage ?? "New") as any,

      appointmentDate: row.appointmentDate ?? null,
      saleAmount: row.saleAmount ?? null,
      notes: row.notes ?? row.ai_summary ?? "",

      dateCaptured: ts,
      callAttempts,
      messages,
    };
  });
}
