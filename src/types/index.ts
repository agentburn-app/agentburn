export interface CostEventInput {
  agentId: string;
  provider: string;
  model?: string;
  operation: "llm_call" | "tool_call" | "compute" | "api_call";
  inputTokens?: number;
  outputTokens?: number;
  costUsd: number;
  taskId?: string;
  workflowId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  totalCost: number;
  eventCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  lastActivity: string | null;
  costByProvider: Record<string, number>;
}

export interface CostBreakdown {
  totalCost: number;
  costByProvider: Record<string, number>;
  costByOperation: Record<string, number>;
  costByModel: Record<string, number>;
  costByAgent: Record<string, number>;
  eventCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface TimeSeriesPoint {
  date: string;
  cost: number;
  events: number;
}

export interface BudgetAlertStatus {
  id: string;
  name: string;
  agentId: string | null;
  agentName: string | null;
  budgetUsd: number;
  periodType: string;
  currentSpend: number;
  percentUsed: number;
  isOver: boolean;
}

export interface DashboardData {
  totalCostToday: number;
  totalCostWeek: number;
  totalCostMonth: number;
  costChangePercent: number | null;
  activeAgents: number;
  totalEvents: number;
  costByProvider: Record<string, number>;
  costTimeSeries: TimeSeriesPoint[];
  topAgents: AgentSummary[];
  budgetAlerts: BudgetAlertStatus[];
}
