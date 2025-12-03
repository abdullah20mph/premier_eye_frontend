// src/services/aiCalls.ts
import api from "./client";

export type BackendAiCallRow = {
  id: number;
  timestamp?: string | null;
  ts?: string | null;

  call_status?: string | null;
  call_summary?: string | null;
  recording_url?: string | null;

  service?: string | null;

  lead_id?: number | null;                 // ✅ FIXED
  lead_name?: string | null;
  lead_number?: string | null;
  location_preference?: string | null;
  call_url?: string | null;
};

export type CallItem = {
  id: string;
  ts: string;
  outcome: string;
  summary?: string;
  recordingUrl?: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadLocation?: string;
  service?: string;                         // ✅ NEW
};

type FetchParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export async function fetchAICallFeed(
  params: FetchParams = {}
): Promise<CallItem[]> {

  const res = await api.get("/user/ai-calls/list", {     // ✅ FIXED ENDPOINT
    params: {
      page: params.page ?? 1,
      // limit: params.limit ?? 50,
      status: params.status,
      search: params.search,
    },
  });

  const payload = res.data;
  const data = payload?.data || {};
  const items: BackendAiCallRow[] = data.items ?? data.rows ?? [];

  return items.map((row) => {
    const ts =
      row.timestamp ||
      row.ts ||
      new Date().toISOString();

    return {
      id: String(row.id),
      ts,

      outcome: row.call_status ?? "unknown",
      summary: row.call_summary ?? "",
      recordingUrl: row.recording_url ?? undefined,
      leadId: String(row.id), // <-- FIXED
      leadName: row.lead_name ?? "Unknown",
      leadPhone: row.lead_number ?? "",
      leadLocation: row.location_preference ?? undefined,

      service: row.service ?? undefined,     // needed on frontend
      callUrl: row.call_url ?? undefined,   // added callUrl
    };
  });
}
