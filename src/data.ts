import { ERPState } from "./types";

export const initialERPState: ERPState = {
  kpis: {
    totalRevenue: {
      value: "$4.2M",
      trend: "+12%",
      trendDirection: "up"
    },
    operatingExpenses: {
      value: "$1.8M",
      trend: "-2%",
      trendDirection: "down"
    },
    netProfit: {
      value: "$2.4M",
      trend: "+15%",
      trendDirection: "up"
    },
    activeEmployees: {
      value: "1,240",
      trend: "Steady",
      trendDirection: "steady"
    }
  },
  inventory: [
    {
      id: "INV-1021",
      name: "Titanium Chassis Core",
      category: "Raw Material",
      units: 12400,
      status: "In Production",
      zone: "Zone A",
      lastUpdated: "10 mins ago"
    },
    {
      id: "INV-8890",
      name: "Semi-conductor Array B3",
      category: "Electronics",
      units: 320,
      status: "Low Stock",
      zone: "Zone B",
      lastUpdated: "45 mins ago"
    },
    {
      id: "INV-4322",
      name: "Pneumatic Lift Arm",
      category: "Mechanical",
      units: 2100,
      status: "Outbound",
      zone: "Zone D",
      lastUpdated: "2 hours ago"
    },
    {
      id: "INV-9043",
      name: "Optical Laser Diode",
      category: "Optics",
      units: 450,
      status: "In Production",
      zone: "Zone C",
      lastUpdated: "1 hour ago"
    },
    {
      id: "INV-3312",
      name: "Alloy Shield Plate",
      category: "Raw Material",
      units: 180,
      status: "Low Stock",
      zone: "Zone B",
      lastUpdated: "4 hours ago"
    }
  ],
  activities: [
    {
      id: "ACT-001",
      type: "invoice",
      title: "Invoice #IV-2091 approved",
      description: "Sarah J. (Finance Lead) completed the final audit and signing.",
      time: "2 mins ago"
    },
    {
      id: "ACT-002",
      type: "shipment",
      title: "New batch shipment arrived",
      description: "Raw material bulk load successfully docked and scanned at Zone B.",
      time: "45 mins ago"
    },
    {
      id: "ACT-003",
      type: "onboarding",
      title: "New developer onboarding",
      description: "Alex Chen joined the AI Infrastructure and automation team.",
      time: "3 hours ago"
    },
    {
      id: "ACT-004",
      type: "alert",
      title: "System alert: API Latency",
      description: "Latency detected in API Node 4 (>1200ms). Load balancing applied.",
      time: "5 hours ago"
    }
  ],
  production: [
    {
      id: "PRD-201",
      name: "Quantum Processor Node v2",
      units: 500,
      stage: "In Progress",
      priority: "High",
      startDate: "2026-06-28",
      endDate: "2026-07-05"
    },
    {
      id: "PRD-202",
      name: "Autonomous Drive Kit",
      units: 1200,
      stage: "Scheduled",
      priority: "Medium",
      startDate: "2026-07-01",
      endDate: "2026-07-10"
    },
    {
      id: "PRD-203",
      name: "Lidar Navigation Unit",
      units: 300,
      stage: "Quality Control",
      priority: "High",
      startDate: "2026-06-25",
      endDate: "2026-07-02"
    },
    {
      id: "PRD-204",
      name: "Chassis Frame Weld-set",
      units: 1500,
      stage: "Completed",
      priority: "Low",
      startDate: "2026-06-15",
      endDate: "2026-06-25"
    },
    {
      id: "PRD-205",
      name: "Auxiliary Energy Core S4",
      units: 200,
      stage: "Backlog",
      priority: "High",
      startDate: "2026-07-08",
      endDate: "2026-07-15"
    }
  ],
  shipments: [
    {
      id: "SHP-8821",
      vendor: "Atlas Electronics Inc.",
      route: "Shenzhen Hub -> Oakland Port -> Zone B",
      estDelivery: "2026-07-02",
      status: "In Transit"
    },
    {
      id: "SHP-3021",
      vendor: "Apex Alloys Corp",
      route: "Chicago Depot -> Denver Rail -> Zone A",
      estDelivery: "2026-06-30",
      status: "Delivered"
    },
    {
      id: "SHP-1294",
      vendor: "Nippon Sensors Ltd",
      route: "Tokyo Narita -> LAX Cargo -> Zone C",
      estDelivery: "2026-07-04",
      status: "In Transit"
    },
    {
      id: "SHP-4402",
      vendor: "Vertex Precision Rails",
      route: "Hamburg Port -> NY Port -> Zone D",
      estDelivery: "2026-07-08",
      status: "Departed Facility"
    }
  ],
  workflows: [
    {
      id: "WF-01",
      name: "Automated Reorder System",
      trigger: "Stock falls below minimum threshold (e.g. 15%)",
      steps: [
        { id: "S1", action: "Identify vendor & retrieve price index", department: "Procurement", agent: "AI System" },
        { id: "S2", action: "Generate purchase request invoice", department: "Finance", agent: "AI System" },
        { id: "S3", action: "Approve draft purchase order (> $5,000)", department: "Finance", agent: "Sarah J. (Human)" },
        { id: "S4", action: "Transmit API payload to supplier", department: "IT Infrastructure", agent: "System Gateway" }
      ],
      estimatedImpact: "Reduces stockouts by 42% and processing time by 12 hours",
      active: true
    },
    {
      id: "WF-02",
      name: "AI Talent Screening & Sourcing",
      trigger: "New opening approved by Division Head",
      steps: [
        { id: "S1", action: "Parse resume attachments and rank skills", department: "Human Resources", agent: "Nexus AI" },
        { id: "S2", action: "Schedule live screening slots with calendar API", department: "Human Resources", agent: "System Gateway" },
        { id: "S3", action: "Compile feedback and score scorecard", department: "Engineering", agent: "Team Lead (Human)" }
      ],
      estimatedImpact: "Halves recruitment cycle time and improves hiring quality",
      active: true
    }
  ]
};
