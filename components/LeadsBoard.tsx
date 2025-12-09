// src/components/LeadsBoard.tsx
import React, { useState } from "react";
import { Lead, LeadStatus } from "../types";
import { ChevronRight, AlertCircle, MapPin } from "lucide-react";

type Props = {
  leads: Lead[];
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
  onSelectLead: (id: string) => void;
};

const COLUMNS: { id: string; title: string; statuses: LeadStatus[]; color: string }[] =
  [
    {
      id: "new",
      title: "New Leads",
      statuses: ["New"],
      color: "border-t-gray-400",
    },
    {
      id: "engaging",
      title: "AI Engaging",
      statuses: ["AI Called – No Answer", "AI Spoke to Lead"],
      color: "border-t-blue-400",
    },
    {
      id: "action",
      title: "Needs Action / No Show",
      statuses: ["Needs VA Follow-Up", "No Show"],
      color: "border-t-red-500",
    },
    {
      id: "booked",
      title: "Booked",
      statuses: ["Appointment Booked"],
      color: "border-t-emerald-500",
    },
    {
      id: "closed",
      title: "Completed & Paid",
      statuses: ["Appointment Completed"],
      color: "border-t-brand-black",
    },
  ];

export default function LeadsBoard({
  leads,
  onUpdateStatus,
  onSelectLead,
}: Props) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const getLeadsForColumn = (statuses: LeadStatus[]) =>
    leads.filter((l) => statuses.includes(l.status));

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatuses: LeadStatus[]) => {
    e.preventDefault();
    if (draggedLeadId) {
      const newStatus = targetStatuses[0];
      onUpdateStatus(draggedLeadId, newStatus);
      setDraggedLeadId(null);
    }
  };

  const getNextStatus = (current: LeadStatus): LeadStatus | null => {
    if (current === "New") return "AI Spoke to Lead";
    if (current === "AI Spoke to Lead") return "Needs VA Follow-Up";
    if (current === "Needs VA Follow-Up") return "Appointment Booked";
    if (current === "No Show") return "Needs VA Follow-Up";
    if (current === "Appointment Booked") return "Appointment Completed";
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-brand-black">Sales Pipeline</h2>
          <p className="text-sm text-gray-500">
            Drag and drop to update status.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-full">
          {COLUMNS.map((col) => {
            const colLeads = getLeadsForColumn(col.statuses);

            return (
              <div
                key={col.id}
                className="flex-1 min-w-[240px] bg-gray-50/50 rounded-xl flex flex-col max-h-full border border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.statuses)}
              >
                <div
                  className={`p-3 border-t-4 ${col.color} bg-white rounded-t-xl border-b border-gray-100 mb-2`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-brand-black text-sm">
                      {col.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {colLeads.length}
                    </span>
                  </div>
                </div>

                <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => onSelectLead(lead.id)}
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-brand-blue/30 transition group relative flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-brand-black text-brand-blue flex items-center justify-center text-xs font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-brand-black truncate">
                            {lead.name}
                          </div>

                          {lead.location && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] font-medium text-gray-500 truncate">
                                {lead.location}
                              </span>
                            </div>
                          )}

                          {lead.status === "No Show" && (
                            <div className="text-[10px] font-bold text-red-600 mt-1">
                              NO SHOW
                            </div>
                          )}
                          {lead.status === "Needs VA Follow-Up" && (
                            <div className="text-[10px] font-bold text-red-500 mt-1">
                              NEEDS ACTION
                            </div>
                          )}
                        </div>
                      </div>

                      {(lead.status === "Needs VA Follow-Up" ||
                        lead.status === "No Show") && (
                        <div className="text-red-500 animate-pulse shrink-0 ml-2">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}

                      {getNextStatus(lead.status) &&
                        !(
                          lead.status === "Needs VA Follow-Up" ||
                          lead.status === "No Show"
                        ) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = getNextStatus(lead.status);
                              if (next) onUpdateStatus(lead.id, next);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-blue transition ml-2"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="h-16 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
