// src/services/appointments.ts
import api from "./client";
import { Lead, LeadStatus } from "../types";

// mirror backend enums here for mapping
const BACKEND_STATUS_VALUES = [
  "AI CALLED - NO ANSWER",
  "AI SPOKE TO LEAD",
  "SCHEDULED",
  "NEEDS VA TO FOLLOW UP",
  "APPOINTMENT BOOKED",
  "APPOINTMENT COMPLETED",
  "NO SHOW",
  "NOT INTERESTED",
] as const;

type BackendStatus = (typeof BACKEND_STATUS_VALUES)[number];

const BACKEND_SERVICE_TYPES = [
  "LASIK CONSULTANT",
  "COMPREHENSIVE EYE EXAM",
  "CONTACT LENS FITTING",
  "DRY EYE TREATMENT",
] as const;

type BackendService = (typeof BACKEND_SERVICE_TYPES)[number];

const BACKEND_LOCATIONS = ["Plantation", "Boca Raton", "West Palm"] as const;
type BackendLocation = (typeof BACKEND_LOCATIONS)[number];

const BACKEND_INSURANCE_PROVIDERS = [
  "VSP",
  "EyeMed",
  "Spectera",
  "Humana Vision",
  "Cigna",
  "UnitedHealthcare",
  "Other",
] as const;
type BackendInsurance = (typeof BACKEND_INSURANCE_PROVIDERS)[number];

function mapStatusToBackend(status?: LeadStatus): BackendStatus | undefined {
  switch (status) {
    case "AI Called – No Answer":
      return "AI CALLED - NO ANSWER";
    case "AI Spoke to Lead":
      return "AI SPOKE TO LEAD";
    case "Needs VA Follow-Up":
      return "NEEDS VA TO FOLLOW UP";
    case "Appointment Booked":
      return "APPOINTMENT BOOKED";
    case "Appointment Completed":
      return "APPOINTMENT COMPLETED";
    case "No Show":
      return "NO SHOW";
    case "Not Interested":
      return "NOT INTERESTED";
    default:
      // "New" or anything else → we don't send a status override
      return undefined;
  }
}

function mapServiceToBackend(
  service?: string | null
): BackendService | undefined {
  if (!service) return undefined;
  switch (service) {
    case "Comprehensive Exam":
      return "COMPREHENSIVE EYE EXAM";
    case "Contact Lens Fitting":
      return "CONTACT LENS FITTING";
    case "Dry Eye Treatment":
      return "DRY EYE TREATMENT";
    case "LASIK Consult":
      return "LASIK CONSULTANT";
    default:
      return undefined;
  }
}

function normalizeLocationForBackend(
  loc?: string | null
): BackendLocation | undefined {
  if (!loc) return undefined;
  const found = BACKEND_LOCATIONS.find((x) => x === loc);
  return found;
}

function normalizeInsuranceForBackend(
  ins?: string | null
): BackendInsurance | undefined {
  if (!ins) return undefined;

  const matched = BACKEND_INSURANCE_PROVIDERS.find(
    (p) => p.toLowerCase() === ins.toLowerCase()
  );
  if (matched) return matched as BackendInsurance;

  // any custom input → "Other"
  return "Other";
}

/**
 * Create / update appointment data for a lead from the modal.
 * - Does nothing if lead.id is not numeric (demo/seed leads).
 * - Does nothing if there is no appointment date.
 */
export async function createAppointmentFromLead(
  lead: Lead,
  draft: Partial<Lead>
) {
  console.log("[createAppointmentFromLead] called with", {
    leadId: lead.id,
    draftAppointmentDate: draft.appointmentDate,
  });

  const numericId = Number(lead.id);
  if (!Number.isFinite(numericId)) {
    console.log("[createAppointmentFromLead] skip: non-numeric id", lead.id);
    return;
  }

  // If no date picked, use "now" so Joi isoDate passes
  const scheduled_at =
    draft.appointmentDate ||
    lead.appointmentDate ||
    new Date().toISOString();

  const payload: any = {
    lead_id: numericId,
    scheduled_at,
  };

  const effectiveName = (draft.name ?? lead.name)?.trim();
  if (effectiveName) {
    payload.lead_name = effectiveName;
  }

  const backendStatus = mapStatusToBackend(draft.status ?? lead.status);
  if (backendStatus) payload.status = backendStatus;

  const backendService = mapServiceToBackend(draft.service ?? lead.service);
  if (backendService) payload.service_type = backendService;

  const expectedValue = draft.saleAmount ?? lead.saleAmount;
  if (typeof expectedValue === "number") payload.expected_value = expectedValue;

  const notes = draft.notes ?? lead.notes;
  if (typeof notes === "string" && notes.trim().length > 0) {
    payload.notes = notes;
  }

  const backendLocation = normalizeLocationForBackend(
    (draft.location as string | null | undefined) ?? (lead.location as any)
  );
  if (backendLocation) payload.location = backendLocation;

  const dob = draft.dob ?? lead.dob;
  if (dob) payload.dob = dob;

  const backendInsurance = normalizeInsuranceForBackend(
    (draft.insurance as string | null | undefined) ?? (lead.insurance as any)
  );
  if (backendInsurance) payload.insurance = backendInsurance;

  console.log("[createAppointmentFromLead] POST /user/appointments", payload);
  await api.post("/user/appointments", payload);
}
