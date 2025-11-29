import api from "./client";

export type BackendAppointment = {
  id: number;
  lead_id: number;
  scheduled_at: string;
  status: string;
  service_type: string | null;
  expected_value: number | null;
  notes: string | null;
  lead: {
    id: number;
    lead_name: string;
    lead_number: string;
    location_preference: string | null;
    email: string | null;
  };
};

export async function fetchAllAppointments(): Promise<BackendAppointment[]> {
  const res = await api.get("/user/appointments/all");
  return res.data?.data ?? [];
}
