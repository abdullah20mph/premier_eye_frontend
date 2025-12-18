import api from "./client";
import type { Lead } from "../types";

// Map backend item → Lead used by ActionCenter
function mapOverviewItemToLead(item: any): Lead {
  return {
    id: String(item.id),

    // identity
    name: item.lead_name ?? "Unknown",
    phone: item.lead_number ?? "",
    location: item.location_preference ?? "",
    source: item.source ?? "",
    dob: item.dob ?? null,
    insurance: item.insurance ?? null,

    // we only show “Needs VA Follow-Up” in ActionCenter
    status: "Needs VA Follow-Up",

    // used for “3 days ago”
    dateCaptured: item.created_at ?? new Date().toISOString(),

    // used by ActionCenter: lastCall.summary + ts
    callSummary: item.call_summary ?? null,

    callAttempts: [
      {
        ts: item.created_at ?? new Date().toISOString(),
        summary: item.call_summary ?? "",
      } as any, // we only need ts + summary in UI
    ],

    // used by ActionCenter: lastMsg.text
    messages: item.latest_reply
      ? [
          {
            text: item.latest_reply,
          } as any,
        ]
      : [],
  };
}

export async function fetchActionRequiredLeads(): Promise<Lead[]> {
  const res = await api.get(
    "/user/dashboard/overview/action-required/get-list",
    {
      params: { page: 1, limit: 500 },
    }
  );

  const items = res.data?.data?.items ?? [];
  return items.map(mapOverviewItemToLead);
}
