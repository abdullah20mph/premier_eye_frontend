// src/services/aiCalls.ts
import api from "./client";

export type BackendAiCallRow = {
  id: number;
  ts?: string | null;                 // if you store timestamp as ts
  called_at?: string | null;          // or called_at - we'll prefer this if present
  outcome?: string | null;            // "answered", "voicemail", ...
  summary?: string | null;
  recording_url?: string | null;
  lead_id?: number | null;
  lead_name?: string | null;
  lead_number?: string | null;
  location_preference?: string | null;
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
};

type FetchParams = {
  page?: number;
  limit?: number;
  status?: string;  // e.g. "answered,booked"
  search?: string;  // lead name
};

export async function fetchAICallFeed(
  params: FetchParams = {}
): Promise<CallItem[]> {
  const res = await api.get("/user/ai-sales-calls/list", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      status: params.status,
      search: params.search,
    },
  });

  // Because you're using response.send(), the shape is:
  // { success, statusCode, message, data }
  const payload = res.data;
  const data = payload?.data || {};
  const items: BackendAiCallRow[] = data.items ?? data.rows ?? [];

  return items.map((row) => {
    const ts = row.called_at || row.ts || new Date().toISOString();

    return {
      id: String(row.id),
      ts,
      outcome: row.outcome ?? "unknown",
      summary: row.summary ?? "",
      recordingUrl: row.recording_url ?? undefined,
      leadId: row.lead_id ? String(row.lead_id) : "",
      leadName: row.lead_name ?? "Unknown",
      leadPhone: row.lead_number ?? "",
      leadLocation: row.location_preference ?? undefined,
    };
  });
}

