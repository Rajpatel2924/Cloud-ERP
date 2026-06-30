import React, { useState, useRef, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Zap, 
  Download, 
  Calendar, 
  ChevronRight, 
  Play, 
  Plus, 
  UserPlus, 
  FileText, 
  AlertTriangle,
  RefreshCw,
  Send,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  Package,
  Info
} from "lucide-react";
import { ERPState, ChatMessage, InventoryItem } from "../types";

interface DashboardViewProps {
  erpState: ERPState;
  setErpState: React.Dispatch<React.SetStateAction<ERPState>>;
  onNavigate: (tab: string) => void;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

const MONTH_DATA = [
  { name: "JAN", rev: 2.1, exp: 1.2, x: 50, yRev: 350, yExp: 320 },
  { name: "FEB", rev: 2.4, exp: 1.3, x: 200, yRev: 310, yExp: 315 },
  { name: "MAR", rev: 2.8, exp: 1.4, x: 350, yRev: 260, yExp: 290 },
  { name: "APR", rev: 3.2, exp: 1.5, x: 500, yRev: 210, yExp: 275 },
  { name: "MAY", rev: 3.5, exp: 1.6, x: 650, yRev: 180, yExp: 285 },
  { name: "JUN", rev: 3.9, exp: 1.7, x: 800, yRev: 130, yExp: 250 },
  { name: "JUL", rev: 4.2, exp: 1.8, x: 950, yRev: 95, yExp: 230 }
];

export default function DashboardView({ erpState, setErpState, onNavigate, onShowNotification }: DashboardViewProps) {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<typeof MONTH_DATA[0] | null>(null);
  
  // Quick Action Modals
  const [activeModal, setActiveModal] = useState<"workflow" | "hire" | "invoice" | "report" | null>(null);
  const [newWorkflowPrompt, setNewWorkflowPrompt] = useState("");
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  
  // Quick Action States
  const [hireName, setHireName] = useState("");
  const [hireDept, setHireDept] = useState("Engineering");
  const [hireRole, setHireRole] = useState("Senior AI Systems Developer");
  
  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceCategory, setInvoiceCategory] = useState("Professional Services");

  const [aiReportMarkdown, setAiReportMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "init-0",
      role: "model",
      text: "Hello! I am Nexus AI. I have live operational access to your Cloud ERP system. Ask me about financial metrics, low-stock warnings, production stages, or supply pipelines!",
      time: "Just now"
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Recalculate utilization
  const totalUnits = erpState.inventory.reduce((acc, item) => acc + item.units, 0);
  const inProductionUnits = erpState.inventory.filter(i => i.status === "In Production").reduce((acc, item) => acc + item.units, 0);
  const lowStockUnits = erpState.inventory.filter(i => i.status === "Low Stock").reduce((acc, item) => acc + item.units, 0);
  const outboundUnits = erpState.inventory.filter(i => i.status === "Outbound").reduce((acc, item) => acc + item.units, 0);
  const utilizationPercentage = Math.round((inProductionUnits / (totalUnits || 1)) * 100);

  // Handle Chart Hover
  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRatio = 1000 / rect.width;
    const mouseX = (e.clientX - rect.left) * xRatio;
    
    // Find closest data point
    let closest = MONTH_DATA[0];
    let minDiff = Math.abs(closest.x - mouseX);
    for (let i = 1; i < MONTH_DATA.length; i++) {
      const diff = Math.abs(MONTH_DATA[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = MONTH_DATA[i];
      }
    }
    
    if (minDiff < 80) {
      setHoveredPoint(closest);
    } else {
      setHoveredPoint(null);
    }
  };

  const handleChartMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Chat API Integration
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          history: chatHistory.map(h => ({ role: h.role, text: h.text })),
          erpData: {
            kpis: erpState.kpis,
            inventory: erpState.inventory,
            activities: erpState.activities.slice(0, 5),
            production: erpState.production.slice(0, 3),
            shipments: erpState.shipments.slice(0, 3)
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Communication error");
      }

      setChatHistory(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      const isConfigError = err.message?.includes("GEMINI_API_KEY") || err.message?.includes("configured");
      
      let errorText = "I encountered an error connecting to my core brain. Please check your network connection.";
      if (isConfigError) {
        errorText = "⚠️ **Gemini API Key Missing**\nTo enable Nexus AI smart replies, please open the **Settings** panel in the bottom-left sidebar and configure your `GEMINI_API_KEY` environment variable in the Secrets tab. Currently running in mockup sandbox mode.";
      }
      
      setChatHistory(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        role: "model",
        text: errorText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Strategic Executive Report
  const triggerGenerateReport = async () => {
    setIsGeneratingReport(true);
    setActiveModal("report");
    setAiReportMarkdown(null);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ erpData: erpState })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAiReportMarkdown(data.report);
      onShowNotification("Executive Report Generated", "Strategic optimizations compiled successfully.", "success");
    } catch (err: any) {
      console.error(err);
      setAiReportMarkdown(`# Sandbox Report (API Key Missing)\n\n## 1. Executive Summary\n*Net profit is tracking beautifully at $2.4M (up 15% from last period). Operating expenses decreased by 2%.*\n\n## 2. Supply Chain Risks\n- **Semi-conductor Array B3** is currently in **Low Stock** with only 320 units remaining. Recommend automated reorder.\n\n## 3. Recommended Actions\n1. Hire 1 more AI Infrastructure developer to clear production backlog.\n2. Leverage automated reorder workflows to replenish stock at Zone B.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Generate AI Workflow
  const handleAIWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowPrompt.trim()) return;
    setIsGeneratingWorkflow(true);

    try {
      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newWorkflowPrompt, erpData: erpState })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Add workflow to ERP state
      const newWF = {
        id: `WF-${Date.now().toString().slice(-2)}`,
        name: data.name,
        trigger: data.trigger,
        steps: data.steps,
        estimatedImpact: data.estimatedImpact,
        active: true
      };

      setErpState(prev => ({
        ...prev,
        workflows: [newWF, ...prev.workflows],
        activities: [{
          id: `ACT-${Date.now()}`,
          type: "system",
          title: `New automated workflow deployed`,
          description: `AI engineered: ${data.name}. Triggered by: ${data.trigger}`,
          time: "Just now"
        }, ...prev.activities]
      }));

      onShowNotification("Workflow Architected", `Deployed: ${data.name}`, "success");
      setActiveModal(null);
      setNewWorkflowPrompt("");
    } catch (err) {
      console.error(err);
      // Mock workflow generation as fallback
      const fallbackWF = {
        id: `WF-MOCK`,
        name: "Intelligent Ingress Dispatch",
        trigger: "Arriving shipment notification",
        steps: [
          { id: "S1", action: "Verify packing lists automatically", department: "Logistics", agent: "Nexus AI" },
          { id: "S2", action: "Optimize warehouse shelving locations", department: "Inventory", agent: "Nexus AI" }
        ],
        estimatedImpact: "Saves 4 hours in unloading delay and 15% shelf-spacing efficiency.",
        active: true
      };
      setErpState(prev => ({
        ...prev,
        workflows: [fallbackWF, ...prev.workflows],
        activities: [{
          id: `ACT-${Date.now()}`,
          type: "system",
          title: `New workflow compiled (Sandbox)`,
          description: `Deployed 'Intelligent Ingress Dispatch' automation.`,
          time: "Just now"
        }, ...prev.activities]
      }));
      onShowNotification("Workflow Created (Sandbox)", "Mock workflow deployed safely.", "info");
      setActiveModal(null);
      setNewWorkflowPrompt("");
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  // Add Simulated Staff
  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireName.trim()) return;

    const currentCount = parseInt(erpState.kpis.activeEmployees.value.replace(/,/g, ""));
    const updatedCount = (currentCount + 1).toLocaleString();

    setErpState(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        activeEmployees: { ...prev.kpis.activeEmployees, value: updatedCount }
      },
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type: "onboarding",
          title: `${hireName} hired successfully`,
          description: `Onboarded as ${hireRole} in ${hireDept} division.`,
          time: "Just now"
        },
        ...prev.activities
      ]
    }));

    onShowNotification("Onboarding Triggered", `${hireName} registered on company payroll.`, "success");
    setActiveModal(null);
    setHireName("");
  };

  // Create Simulated Invoice
  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceClient.trim() || !invoiceAmount) return;

    const numericAmount = parseFloat(invoiceAmount);
    const revStr = erpState.kpis.totalRevenue.value.replace("$", "").replace("M", "");
    const currentRev = parseFloat(revStr);
    const addedRevM = numericAmount / 1000000;
    const updatedRev = `$${(currentRev + addedRevM).toFixed(2)}M`;

    // Recalculate profit too
    const expStr = erpState.kpis.operatingExpenses.value.replace("$", "").replace("M", "");
    const currentExp = parseFloat(expStr);
    const updatedProfit = `$${((currentRev + addedRevM) - currentExp).toFixed(2)}M`;

    setErpState(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        totalRevenue: { ...prev.kpis.totalRevenue, value: updatedRev },
        netProfit: { ...prev.kpis.netProfit, value: updatedProfit }
      },
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type: "invoice",
          title: `Invoice #IV-${Math.floor(1000 + Math.random() * 9000)} approved`,
          description: `Billed $${parseFloat(invoiceAmount).toLocaleString()} to ${invoiceClient} for ${invoiceCategory}.`,
          time: "Just now"
        },
        ...prev.activities
      ]
    }));

    onShowNotification("Invoice Approved", `Added $${parseFloat(invoiceAmount).toLocaleString()} to enterprise revenue.`, "success");
    setActiveModal(null);
    setInvoiceClient("");
    setInvoiceAmount("");
  };

  // Static manual export trigger
  const triggerManualExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onShowNotification("Data Export Successful", "ERP database dump compiled and downloaded as CSV.", "success");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 py-4 border-b border-gray-100">
        <div>
          <h2 id="executive-title" className="text-3xl font-bold tracking-tight text-text-dark">Executive Overview</h2>
          <p className="text-sm text-text-muted mt-1">Real-time performance metrics across global departments.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Time range selector */}
          <div className="relative inline-block text-left shrink-0">
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                onShowNotification("Metrics Adjusted", `Now displaying statistics for: ${e.target.value}`, "info");
              }}
              className="appearance-none bg-surface-card border border-border-subtle rounded-lg px-4 py-2 pr-10 text-xs font-semibold text-text-soft hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer soft-shadow"
            >
              <option>Last 3 Days</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 60 Days</option>
              <option>Year-to-Date</option>
            </select>
            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          <button 
            onClick={triggerGenerateReport}
            className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-gray-50 text-text-soft font-semibold text-xs py-2 px-4 rounded-lg soft-shadow transition-colors duration-150 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-brand-primary" />
            Strategic Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div 
          onClick={() => onShowNotification("Financial Audit", "Year-to-date Revenue is tracking 12% ahead of target, driven by core system contracts.", "info")}
          className="bg-surface-card p-6 rounded-xl border border-gray-100 hover:border-brand-primary cursor-pointer soft-shadow hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-brand-primary rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {erpState.kpis.totalRevenue.trend}
            </span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-bold text-text-dark mt-1">{erpState.kpis.totalRevenue.value}</h3>
          <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Live ledger sync active</p>
        </div>

        {/* Expenses */}
        <div 
          onClick={() => onShowNotification("Cost Accounting", "Operating expenses decreased by 2% due to server consolidation and pipeline optimization.", "info")}
          className="bg-surface-card p-6 rounded-xl border border-gray-100 hover:border-brand-primary cursor-pointer soft-shadow hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-danger-text rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-brand-accent text-xs font-bold rounded-full flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              {erpState.kpis.operatingExpenses.trend}
            </span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Operating Expenses</p>
          <h3 className="text-2xl font-bold text-text-dark mt-1">{erpState.kpis.operatingExpenses.value}</h3>
          <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Under budget threshold</p>
        </div>

        {/* Net Profit */}
        <div 
          onClick={() => onShowNotification("Profit Margins", "Net profit margins stand at an elite 57% this quarter. AI automation contributes to 8% margin improvement.", "info")}
          className="bg-surface-card p-6 rounded-xl border border-gray-100 hover:border-brand-primary cursor-pointer soft-shadow hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {erpState.kpis.netProfit.trend}
            </span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Net Profit</p>
          <h3 className="text-2xl font-bold text-text-dark mt-1">{erpState.kpis.netProfit.value}</h3>
          <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500 animate-pulse" /> 4% higher than target</p>
        </div>

        {/* Active Employees */}
        <div 
          onClick={() => onNavigate("Analytics")}
          className="bg-surface-card p-6 rounded-xl border border-gray-100 hover:border-brand-primary cursor-pointer soft-shadow hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-text-soft text-xs font-bold rounded-full">
              {erpState.kpis.activeEmployees.trend}
            </span>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Employees</p>
          <h3 className="text-2xl font-bold text-text-dark mt-1">{erpState.kpis.activeEmployees.value}</h3>
          <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1"><Users className="w-3 h-3 text-purple-500" /> Full staffing capacity</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h4 className="text-lg font-bold text-text-dark">Revenue vs Expenses</h4>
            <p className="text-sm text-text-muted">Projected vs actual growth across H1 2024 (Interactive)</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-primary"></span>
              <span className="text-xs font-semibold text-text-soft">Revenue (Actual)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-dashed border-2 border-slate-300 bg-transparent"></span>
              <span className="text-xs font-semibold text-text-soft">Expenses (Projected)</span>
            </div>
          </div>
        </div>

        {/* High Fidelity SVG Chart */}
        <div className="relative h-[320px] w-full">
          <svg 
            className="w-full h-full cursor-crosshair" 
            viewBox="0 0 1000 400" 
            preserveAspectRatio="none"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25"></stop>
                <stop offset="100%" stopColor="#004ac6" stopOpacity="0"></stop>
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="1000" y1="100" y2="100"></line>
            <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="1000" y1="200" y2="200"></line>
            <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="1000" y1="300" y2="300"></line>

            {/* Expense Path (Dashed) */}
            <path 
              d="M50,320 Q200,315 350,290 T650,285 T950,230" 
              fill="none" 
              stroke="#94a3b8" 
              strokeDasharray="8,6" 
              strokeWidth="3"
              className="transition-all duration-300"
            ></path>

            {/* Revenue Area Fill */}
            <path 
              d="M50,350 L50,350 Q200,310 350,260 T650,180 T950,95 L950,400 L50,400 Z" 
              fill="url(#chartGradient)"
              className="transition-all duration-300"
            ></path>

            {/* Revenue Path (Solid Line) */}
            <path 
              d="M50,350 Q200,310 350,260 T650,180 T950,95" 
              fill="none" 
              stroke="#004ac6" 
              strokeLinejoin="round" 
              strokeLinecap="round"
              strokeWidth="4"
              className="transition-all duration-300"
            ></path>

            {/* Points and Tooltip Line */}
            {hoveredPoint && (
              <>
                {/* Vertical Guideline */}
                <line 
                  stroke="#cbd5e1" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,4" 
                  x1={hoveredPoint.x} 
                  x2={hoveredPoint.x} 
                  y1="50" 
                  y2="370"
                ></line>
                
                {/* Highlight Point on Revenue */}
                <circle 
                  cx={hoveredPoint.x} 
                  cy={hoveredPoint.yRev} 
                  r="7" 
                  fill="#004ac6" 
                  stroke="#ffffff" 
                  strokeWidth="2.5"
                  className="shadow-md"
                ></circle>

                {/* Highlight Point on Expense */}
                <circle 
                  cx={hoveredPoint.x} 
                  cy={hoveredPoint.yExp} 
                  r="6" 
                  fill="#94a3b8" 
                  stroke="#ffffff" 
                  strokeWidth="2"
                  className="shadow-md"
                ></circle>
              </>
            )}

            {/* Base static markers */}
            {MONTH_DATA.map((pt, idx) => (
              <circle 
                key={idx}
                cx={pt.x}
                cy={pt.yRev}
                r="4"
                fill="#ffffff"
                stroke="#004ac6"
                strokeWidth="2"
                className="opacity-75"
              />
            ))}
          </svg>

          {/* Month Labels */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between font-bold text-xs text-text-muted px-4 select-none">
            {MONTH_DATA.map((pt) => (
              <span key={pt.name} style={{ width: '40px', textAlign: 'center' }}>{pt.name}</span>
            ))}
          </div>

          {/* Fully Interactive HTML Tooltip Inside Parent */}
          {hoveredPoint && (
            <div 
              className="absolute bg-text-dark text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 pointer-events-none transition-all duration-100 z-30"
              style={{
                left: `${(hoveredPoint.x / 1000) * 85}%`,
                top: `${hoveredPoint.yRev - 110}px`
              }}
            >
              <p className="font-bold border-b border-gray-600 pb-1 mb-1.5">{hoveredPoint.name} 2024</p>
              <div className="space-y-1 text-[11px]">
                <p className="flex justify-between gap-4">
                  <span className="text-gray-400">Revenue:</span> 
                  <span className="font-semibold text-emerald-400">${hoveredPoint.rev}M</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-gray-400">Expenses:</span> 
                  <span className="font-semibold text-rose-400">${hoveredPoint.exp}M</span>
                </p>
                <p className="flex justify-between gap-4 font-bold border-t border-gray-700 pt-1">
                  <span>Net Margin:</span>
                  <span className="text-sky-300">{((hoveredPoint.rev - hoveredPoint.exp) / hoveredPoint.rev * 100).toFixed(0)}%</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory Status Donut */}
        <div className="bg-surface-card p-6 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-text-dark mb-1">Inventory Status</h4>
            <p className="text-xs text-text-muted">Current industrial asset allotment</p>
          </div>
          
          <div className="relative flex justify-center items-center py-6">
            {/* SVG Interactive Donut */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" fill="transparent" r="76" stroke="#f1f5f9" strokeWidth="18"></circle>
              {/* In Production */}
              <circle 
                cx="96" 
                cy="96" 
                fill="transparent" 
                r="76" 
                stroke="#004ac6" 
                strokeDasharray="477" 
                strokeDashoffset="120" 
                strokeLinecap="round" 
                strokeWidth="18"
                className="transition-all duration-500 hover:scale-105 origin-center cursor-pointer"
                title="In Production"
              ></circle>
              {/* Low Stock */}
              <circle 
                cx="96" 
                cy="96" 
                fill="transparent" 
                r="76" 
                stroke="#943700" 
                strokeDasharray="477" 
                strokeDashoffset="410" 
                strokeLinecap="round" 
                strokeWidth="18"
                className="transition-all duration-500 hover:scale-105 origin-center cursor-pointer"
                title="Low Stock"
              ></circle>
            </svg>
            <div className="absolute text-center select-none">
              <span className="block text-3xl font-extrabold text-text-dark">{utilizationPercentage}%</span>
              <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">Utilization</span>
            </div>
          </div>

          <div className="space-y-3 mt-2 border-t border-gray-50 pt-4">
            <div 
              onClick={() => onNavigate("Inventory")}
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
                <span className="text-xs font-semibold text-text-soft">In Production</span>
              </div>
              <span className="text-xs font-bold text-text-dark">{inProductionUnits.toLocaleString()} units</span>
            </div>
            <div 
              onClick={() => onNavigate("Inventory")}
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#943700]"></span>
                <span className="text-xs font-semibold text-text-soft">Low Stock</span>
              </div>
              <span className="text-xs font-bold text-danger-text">{lowStockUnits.toLocaleString()} units</span>
            </div>
            <div 
              onClick={() => onNavigate("Inventory")}
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold text-text-soft">Outbound</span>
              </div>
              <span className="text-xs font-bold text-text-dark">{outboundUnits.toLocaleString()} units</span>
            </div>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="bg-surface-card p-6 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-bold text-text-dark mb-1">Recent Activities</h4>
              <p className="text-xs text-text-muted">Live event log pipeline</p>
            </div>
            <button 
              onClick={() => {
                onShowNotification("Refresh Active", "Synced with latest system audits.", "info");
              }}
              className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-gray-50 rounded-full transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-[290px] overflow-y-auto custom-scrollbar pr-1 flex-1">
            {erpState.activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 text-xs leading-relaxed hover:bg-gray-50/50 p-1 rounded transition-all">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === "invoice" ? "bg-blue-50 text-brand-primary" :
                  activity.type === "shipment" ? "bg-green-50 text-green-600" :
                  activity.type === "onboarding" ? "bg-purple-50 text-purple-600" :
                  activity.type === "alert" ? "bg-red-50 text-danger-text" :
                  "bg-amber-50 text-warning-text"
                }`}>
                  {activity.type === "invoice" && <FileText className="w-4 h-4" />}
                  {activity.type === "shipment" && <Package className="w-4 h-4" />}
                  {activity.type === "onboarding" && <Users className="w-4 h-4" />}
                  {activity.type === "alert" && <AlertTriangle className="w-4 h-4 animate-bounce" />}
                  {activity.type === "system" && <Sparkles className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-dark">{activity.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{activity.description}</p>
                  <p className="text-[10px] text-text-muted font-mono mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & AI Status */}
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-xl border border-gray-100 soft-shadow">
            <h4 className="text-base font-bold text-text-dark mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveModal("workflow")}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-brand-primary bg-gray-50/40 hover:bg-white text-xs font-semibold text-text-soft hover:text-brand-primary transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span>AI Workflow Designer</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setActiveModal("hire")}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-brand-primary bg-gray-50/40 hover:bg-white text-xs font-semibold text-text-soft hover:text-brand-primary transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Hire Simulated Employee</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setActiveModal("invoice")}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-brand-primary bg-gray-50/40 hover:bg-white text-xs font-semibold text-text-soft hover:text-brand-primary transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Approve Billing Invoice</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mini Nexus AI Alert banner */}
          <div className="bg-brand-primary p-5 rounded-xl text-white soft-shadow relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-24 h-24 bg-brand-accent/20 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-300 fill-amber-300" />
              <h5 className="font-bold text-sm">Nexus AI Core</h5>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              "Net profit is 4% higher than your target for this quarter. Active supply routes are stable. Recommend automated reordering of semiconductors in Zone B."
            </p>
            <button 
              onClick={() => {
                const element = document.getElementById("chat-box-input");
                element?.focus();
              }}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer"
            >
              Consult Nexus Systems
            </button>
          </div>
        </div>
      </div>

      {/* Nexus Chatbot Interface (Full width, beautiful widget) */}
      <div className="bg-surface-card rounded-xl border border-gray-100 soft-shadow overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white soft-shadow">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-dark">Ask Nexus Anything</h4>
              <p className="text-[11px] text-text-muted flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Active ERP Data Sync Connection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-primary font-bold">
            <Info className="w-4 h-4" />
            <span>Consultant Engine</span>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="p-4 sm:p-6 h-[280px] overflow-y-auto custom-scrollbar space-y-4 bg-gray-50/10">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                msg.role === "user" ? "bg-gray-100 text-text-dark" : "bg-brand-primary text-white"
              }`}>
                {msg.role === "user" ? "U" : "N"}
              </div>
              <div>
                <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-brand-primary text-white rounded-tr-none" 
                    : "bg-white text-text-soft border border-gray-100 rounded-tl-none whitespace-pre-line"
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-text-muted mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <div className="bg-white border border-gray-100 p-3.5 rounded-xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Area */}
        <form onSubmit={handleSendChat} className="border-t border-gray-100 p-4 bg-white flex gap-3">
          <input 
            type="text" 
            id="chat-box-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            placeholder="E.g., Which items are low in stock? Or help me budget operating expenses..."
            className="flex-1 border border-border-subtle rounded-lg px-4 py-2.5 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none disabled:bg-gray-50"
          />
          <button 
            type="submit" 
            disabled={isChatLoading || !chatInput.trim()}
            className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Workflow Builder Modal */}
      {activeModal === "workflow" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Nexus AI Workflow Architect</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleAIWorkflowSubmit} className="p-6 space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                Describe the business workflow automation you'd like to install in the ERP. Nexus AI will analyze your prompt, architect the multi-department triggers and system integration steps, and run a production simulation.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-soft">Automation Requirement Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newWorkflowPrompt}
                  onChange={(e) => setNewWorkflowPrompt(e.target.value)}
                  placeholder="E.g., Automatically reorder titanium chassis cores when stock falls below 2000 units and send Slack alert to Logistics."
                  className="w-full border border-border-subtle rounded-lg p-3 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-text-soft hover:bg-gray-50 border border-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isGeneratingWorkflow}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 rounded-lg text-xs font-bold disabled:opacity-75 flex items-center gap-1.5"
                >
                  {isGeneratingWorkflow ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Flow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Deploy Workflow</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Hire Employee Modal */}
      {activeModal === "hire" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-sm">Register Enterprise Employee</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleHireSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={hireName}
                  onChange={(e) => setHireName(e.target.value)}
                  placeholder="E.g., Dr. Elizabeth Stone"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Department</label>
                  <select 
                    value={hireDept}
                    onChange={(e) => setHireDept(e.target.value)}
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option>Engineering</option>
                    <option>Procurement</option>
                    <option>Finance</option>
                    <option>Logistics</option>
                    <option>Administration</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Compensation Band</label>
                  <select 
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option>Grade L1 ($95k)</option>
                    <option>Grade L2 ($130k)</option>
                    <option>Grade L3 ($175k)</option>
                    <option>Grade L4 ($240k)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Corporate Role / Title</label>
                <input 
                  type="text" 
                  required
                  value={hireRole}
                  onChange={(e) => setHireRole(e.target.value)}
                  placeholder="E.g., Lead Supply Security Specialist"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-text-soft hover:bg-gray-50 border border-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 rounded-lg text-xs font-bold"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Invoice Modal */}
      {activeModal === "invoice" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-sm">Approve Accounts Receivable Invoice</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Client / Customer Enterprise</label>
                <input 
                  type="text" 
                  required
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  placeholder="E.g., Tesla Advanced Robotics Div"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Billed Amount (USD)</label>
                  <input 
                    type="number" 
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="E.g., 250000"
                    className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Service Category</label>
                  <select 
                    value={invoiceCategory}
                    onChange={(e) => setInvoiceCategory(e.target.value)}
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option>Raw Component Delivery</option>
                    <option>Professional Services</option>
                    <option>AI Pipeline License</option>
                    <option>Hardware Integration</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-text-soft hover:bg-gray-50 border border-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 rounded-lg text-xs font-bold"
                >
                  Approve and Ledger Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Executive Report Modal (Displays Generated Strategic Summary) */}
      {activeModal === "report" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full h-[85vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Executive Operational Intelligence Report</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-brand-primary animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-brand-primary absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-text-soft">Nexus AI compiling corporate ledger data...</p>
                  <p className="text-[11px] text-text-muted">Analyzing supply constraints, financial budgets, and operating outputs...</p>
                </div>
              ) : (
                <div className="prose prose-sm text-xs leading-relaxed text-text-soft space-y-4 max-w-none">
                  {aiReportMarkdown ? (
                    <div className="whitespace-pre-wrap font-sans text-xs bg-white p-5 rounded-lg border border-gray-100 soft-shadow">
                      {aiReportMarkdown}
                    </div>
                  ) : (
                    <p className="text-center text-text-muted py-8">No report data compiled yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-primary" /> Generated just now by Nexus-3.5-Flash
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-text-soft hover:bg-gray-50 border border-gray-100 rounded-lg"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    onShowNotification("Download Initiated", "Saving executive report in PDF format...", "success");
                  }}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
