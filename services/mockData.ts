
import { Lead } from '../types';

const now = new Date();
const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const sample = (n: number) => `sample-${n}`;

export const leadsSeed: Lead[] = [
  {
    id: "lead-action-1",
    name: "David Kim",
    phone: "+1 (212) 555-1234",
    email: "david.kim@example.com",
    source: "Google Ads",
    location: "Plantation",
    dateCaptured: now.toISOString(),
    dob: "05/20/1990",
    insurance: "Aetna",
    status: "Needs VA Follow-Up",
    appointmentDate: null,
    service: null,
    saleAmount: null,
    notes: "AI detected booking intent.",
    messages: [
      { id: sample(10), from: "bot", text: "Great, mornings are usually open.", ts: now.toISOString() },
      { id: sample(11), from: "lead", text: "Perfect, I'd like to come in next Tuesday morning.", ts: now.toISOString() },
    ],
    callAttempts: [
      {
        id: "call-action-1",
        ts: now.toISOString(),
        durationSec: 145,
        outcome: "answered",
        summary: "Lead confirmed interest in comprehensive exam and LASIK. Requested Tuesday morning. Needs manual scheduling.",
        recordingUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"
      }
    ],
    lastEmail: null,
  },
  {
    id: "lead-action-2",
    name: "Sarah Jenkins",
    phone: "+1 (561) 555-0922",
    email: "sarah.j@example.com",
    source: "Website Chat",
    location: "West Palm",
    dateCaptured: subDays(now, 0).toISOString(),
    dob: "11/15/1985",
    insurance: "Blue Cross",
    status: "Needs VA Follow-Up",
    appointmentDate: null,
    service: null,
    saleAmount: null,
    notes: "Insurance verification failed by AI.",
    messages: [
      { id: sample(20), from: "bot", text: "Could you confirm your insurance provider?", ts: subDays(now, 0).toISOString() },
      { id: sample(21), from: "lead", text: "It's Blue Cross but I don't have my card on me right now.", ts: subDays(now, 0).toISOString() },
    ],
    callAttempts: [
      {
        id: "call-action-2",
        ts: subDays(now, 0).toISOString(),
        durationSec: 45,
        outcome: "answered",
        summary: "Lead unsure of specific plan details. AI escalated for manual insurance verification.",
        recordingUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"
      }
    ],
    lastEmail: null,
  },
  {
    id: "lead-action-3",
    name: "Michael Ross",
    phone: "+1 (954) 555-7788",
    email: "mross@example.com",
    source: "Walk-in",
    location: "Boca Raton",
    dateCaptured: subDays(now, 1).toISOString(),
    dob: "03/22/1978",
    insurance: null,
    status: "Needs VA Follow-Up",
    appointmentDate: null,
    service: "Dry Eye Treatment",
    saleAmount: null,
    notes: "Requested to speak with Dr. Smith specifically.",
    messages: [],
    callAttempts: [
       {
        id: "call-action-3",
        ts: subDays(now, 1).toISOString(),
        durationSec: 60,
        outcome: "voicemail",
        summary: "Left voicemail regarding dry eye consultation availability.",
      }
    ],
    lastEmail: null,
  },
  {
    id: "lead-1",
    name: "Maria Alvarez",
    phone: "+1 (305) 555-0142",
    email: "maria@example.com",
    source: "FB Lead Ad",
    location: "Boca Raton",
    dateCaptured: subDays(now, 2).toISOString(),
    dob: "06/14/1989",
    insurance: "VSP",
    status: "AI Spoke to Lead",
    appointmentDate: null,
    service: null,
    saleAmount: null,
    notes: "Interested in comprehensive exam. Asked about pricing.",
    messages: [
      { id: sample(1), from: "bot", text: "Hello Maria — are you looking to book an eye exam?", ts: subDays(now, 2).toISOString() },
      { id: sample(2), from: "lead", text: "Yes, how much for a comprehensive?", ts: subDays(now, 2).toISOString() },
    ],
    callAttempts: [
      {
        id: "call-1",
        ts: subDays(now, 2).toISOString(),
        durationSec: 120,
        outcome: "answered",
        summary: "Spoke about pricing. Lead asked to book morning appointment.",
        recordingUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg" // Sample audio
      },
    ],
    lastEmail: { subject: "Welcome to Agentum", ts: subDays(now, 2).toISOString(), opened: true },
  },
  {
    id: "lead-2",
    name: "James Carter",
    phone: "+1 (305) 555-0117",
    email: "jamesc@example.com",
    source: "Website Chat",
    location: "West Palm",
    dateCaptured: subDays(now, 1).toISOString(),
    dob: "12/03/1976",
    insurance: null,
    status: "New",
    appointmentDate: null,
    service: null,
    saleAmount: null,
    notes: "",
    messages: [
      { id: sample(3), from: "bot", text: "Hi James — can we help schedule your exam?", ts: subDays(now, 1).toISOString() },
    ],
    callAttempts: [
      { id: "call-2", ts: subDays(now, 1).toISOString(), outcome: "no_response" }
    ],
    lastEmail: { subject: "Confirm your interest", ts: subDays(now, 1).toISOString(), opened: false },
  },
  {
    id: "lead-3",
    name: "Aisha Khan",
    phone: "+1 (305) 555-0199",
    email: "aisha@example.com",
    source: "IG Message",
    location: "Plantation",
    dateCaptured: now.toISOString(),
    dob: "09/05/1995",
    insurance: "EyeMed",
    status: "Appointment Booked",
    appointmentDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    service: "Comprehensive Exam",
    saleAmount: 120,
    notes: "Paid deposit $40",
    messages: [
      { id: sample(4), from: "lead", text: "Can I bring my child?", ts: now.toISOString() },
      { id: sample(5), from: "bot", text: "Yes, children are welcome. We have family slots.", ts: now.toISOString() },
    ],
    callAttempts: [
      {
        id: "call-3",
        ts: now.toISOString(),
        durationSec: 90,
        outcome: "booked",
        summary: "Booked appointment for next week",
        recordingUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"
      }
    ],
    lastEmail: { subject: "Appointment Confirmed", ts: now.toISOString(), opened: true },
  },
  {
    id: "lead-4",
    name: "Robert Chen",
    phone: "+1 (415) 555-8822",
    email: "robert.chen@example.com",
    source: "Walk-in",
    location: "Boca Raton",
    dateCaptured: subDays(now, 5).toISOString(),
    dob: "02/20/1965",
    insurance: "Cigna",
    status: "Appointment Completed",
    appointmentDate: subDays(now, 1).toISOString(),
    service: "LASIK Consult",
    saleAmount: 2500,
    notes: "Very interested in procedure, scheduled follow up.",
    messages: [],
    callAttempts: [],
    lastEmail: null,
  }
];