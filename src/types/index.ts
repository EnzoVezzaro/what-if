export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  imageUrl?: string;
  isBranchPoint: boolean;
  category: string; // e.g., 'war', 'technology', 'politics'
  region?: string; // e.g., 'Europe', 'North America'
  year: number; // For easier sorting and filtering
}

export interface AlternativeScenario {
  id: string;
  title: string;
  description: string;
  parentEventId: string; // Which event this branches from
  consequences: string; // Brief description of the potential consequences
  imageUrl?: string;
}

export interface TimelineBranch {
  id: string;
  name: string;
  description: string;
  events: TimelineEvent[];
  parentBranchId?: string; // Which branch this came from
  branchPointEventId: string; // At which event this branch started
  alternativeScenarioId: string; // Which scenario choice created this branch
  color: string; // Color to represent this branch
}

export interface TimelineData {
  mainBranch: TimelineBranch;
  alternativeBranches: TimelineBranch[];
  alternativeScenarios: Record<string, AlternativeScenario[]>; // Map of eventId -> possible scenarios
}

export interface User {
  id: string;
  name: string;
  email: string;
  savedTimelines: string[]; // IDs of saved timelines
}

export type TimelineFilter = {
  era?: string;
  region?: string;
  category?: string;
  startYear?: number;
  endYear?: number;
};

export type TimelineZoomLevel = 'century' | 'decade' | 'year' | 'month';