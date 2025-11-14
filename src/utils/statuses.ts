export type LeadStatusKey =
  | "Promedio"
  | "Hot"
  | "Slow"

export interface LeadStatus {
  key: LeadStatusKey;
  label: string;
  emoji: string;
  plural: string;
  badgeColor: "primary" | "dark" | "warning" | "success" | "error";
}

export const LEAD_STATUS_MAP: Record<LeadStatusKey, LeadStatus> = {
  "Promedio": {
    key: "Promedio",
    label: "Lead promedio",
    emoji: "👤",
    plural: "Leads promedio",
    badgeColor: "dark",
  },
  "Hot": {
    key: "Hot",
    label: "Hot lead",
    emoji: "🔥",
    plural: "Hot leads",
    badgeColor: "warning",
  },
  "Slow": {
    key: "Slow",
    label: "Slow leads",
    emoji: "❄️",
    plural: "Slow leads",
    badgeColor: "primary",
  },
};

// Para iteraciones (arrays)
export const LEAD_STATUSES: LeadStatus[] = Object.values(LEAD_STATUS_MAP);

// Para incluir "Todos"
export const LEAD_STATUSES_WITH_ALL = [
  { key: null, label: "Todos", emoji: "📋", plural: "Todos", badgeColor: "success" },
  ...LEAD_STATUSES,
];
