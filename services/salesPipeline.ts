// src/services/salesPipeline.ts
import api from "./client";
import { Lead, LeadStatus, PipelineStage, LocationOption } from "../types";

type BackendLeadRow = {
  id: number;
  lead_name: string | null;
  lead_number: string | null;
  email: string | null;
  location_preference: string | null;
  source: string | null;
  pipeline_stage: PipelineStage;
};

export function mapStageToStatus(stage: PipelineStage): LeadStatus {
  switch (stage) {
    case "NEW_LEAD":
      return "New";
    case "AI_ENGAGING":
      return "AI Spoke to Lead"; // or "AI Called – No Answer"
    case "NEEDS_ACTION":
      return "Needs VA Follow-Up";
    case "BOOKED":
      return "Appointment Booked";
    case "COMPLETED_PAID":
      return "Appointment Completed";
  }
}

export function mapStatusToStage(status: LeadStatus): PipelineStage | null {
  switch (status) {
    case "New":
      return "NEW_LEAD";
    case "AI Called – No Answer":
    case "AI Spoke to Lead":
      return "AI_ENGAGING";
    case "Needs VA Follow-Up":
    case "No Show":
      return "NEEDS_ACTION";
    case "Appointment Booked":
      return "BOOKED";
    case "Appointment Completed":
      return "COMPLETED_PAID";
    default:
      return null;
  }
}

// GET /user/sales-pipeline
export async function fetchSalesPipeline(): Promise<Lead[]> {
  const res = await api.get("/user/sales-pipeline");

  const raw = res.data?.data;
  const allRows: BackendLeadRow[] = [];

  if (Array.isArray(raw)) {
    allRows.push(...(raw as BackendLeadRow[]));
  } else if (raw && typeof raw === "object") {
    Object.values(raw).forEach((bucket: any) => {
      if (Array.isArray(bucket?.leads)) {
        allRows.push(...bucket.leads);
      }
    });
  }

  return allRows.map((row) => {
    const stage = row.pipeline_stage || "NEW_LEAD";

    return {
      id: String(row.id),
      name: row.lead_name ?? "Unknown",
      phone: row.lead_number ?? "",
      email: row.email ?? "",
      location: (row.location_preference ?? "Plantation") as LocationOption,
      source: row.source ?? "Unknown",
      status: mapStageToStatus(stage),
      pipelineStage: stage,
      appointmentDate: null,
      saleAmount: null,
      notes: "",
      dateCaptured: new Date().toISOString(),
      callAttempts: [],
      messages: [],
    };
  });
}

// PATCH /user/sales-pipeline/:id/stage
export async function updateLeadPipelineStage(
  id: string,
  stage: PipelineStage
) {
  const numericId = Number(id);

  // we assume App.tsx only calls this for numeric IDs
  const res = await api.patch(`/user/sales-pipeline/${numericId}/stage`, {
    pipeline_stage: stage,
  });
  return res.data;
}