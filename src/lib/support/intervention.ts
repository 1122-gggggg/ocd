export type InterventionSeverity =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type InterventionType =
  | "NONE"
  | "CRISIS_IMMINENT"
  | "CRISIS_ACTIVE"
  | "CRISIS_PASSIVE"
  | "REASSURANCE_EMPATHY"
  | "REASSURANCE_INLINE"
  | "LOOP_EDUCATION"
  | "PEER_EXPERIENCE"
  | "FACING_UNCERTAINTY"
  | "RECOVERY_PROMPT"
  | "GENERAL_SUPPORT";

export interface InterventionOption {
  id: string;
  label: string;
  actionType: string;
  hint?: string;
}

export interface InterventionCta {
  label: string;
  href?: string;
  action?: string;
  primary?: boolean;
}

export interface SupportIntervention {
  type: InterventionType | string;
  severity: InterventionSeverity;
  title: string;
  message: string;
  options: InterventionOption[];
  dismissible: boolean;
  cta: InterventionCta[];
}
