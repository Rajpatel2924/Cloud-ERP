export interface KPIStats {
  totalRevenue: {
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "steady";
  };
  operatingExpenses: {
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "steady";
  };
  netProfit: {
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "steady";
  };
  activeEmployees: {
    value: string;
    trend: string;
    trendDirection: "up" | "down" | "steady";
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  units: number;
  status: "In Production" | "Low Stock" | "Outbound";
  zone: string;
  lastUpdated: string;
}

export interface RecentActivity {
  id: string;
  type: "invoice" | "shipment" | "onboarding" | "alert" | "system";
  title: string;
  description: string;
  time: string;
}

export interface ProductionBatch {
  id: string;
  name: string;
  units: number;
  stage: "Backlog" | "Scheduled" | "In Progress" | "Quality Control" | "Completed";
  priority: "High" | "Medium" | "Low";
  startDate: string;
  endDate: string;
}

export interface Shipment {
  id: string;
  vendor: string;
  route: string;
  estDelivery: string;
  status: "In Transit" | "Departed Facility" | "Delayed" | "Delivered";
}

export interface ERPWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: {
    id: string;
    action: string;
    department: string;
    agent: string;
  }[];
  estimatedImpact: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
}

export interface ERPState {
  kpis: KPIStats;
  inventory: InventoryItem[];
  activities: RecentActivity[];
  production: ProductionBatch[];
  shipments: Shipment[];
  workflows: ERPWorkflow[];
}
