import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  LineChart, 
  Package, 
  Factory, 
  Truck, 
  Settings as SettingsIcon, 
  HelpCircle, 
  FileText,
  Search,
  Bell,
  Grid,
  Sparkles,
  HelpCircle as SupportIcon,
  Menu,
  X,
  Info,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

import { ERPState } from "./types";
import { initialERPState } from "./data";

// Sub-views
import DashboardView from "./components/DashboardView";
import AnalyticsView from "./components/AnalyticsView";
import InventoryView from "./components/InventoryView";
import ProductionView from "./components/ProductionView";
import SupplyChainView from "./components/SupplyChainView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [erpState, setErpState] = useState<ERPState>(initialERPState);
  
  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App settings state (propagated to child views)
  const [currency, setCurrency] = useState("USD");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Nexus AI, the operations optimizer for Cloud ERP. Answer concisely, analytically, and strategically."
  );
  const [temperature, setTemperature] = useState(0.7);

  // Notifications/Toast State
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: "success" | "info" | "warning" }[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeployingAI, setIsDeployingAI] = useState(false);

  // Modal states (Help/Docs)
  const [activeOverlayModal, setActiveOverlayModal] = useState<"support" | "docs" | "avatar" | null>(null);

  const showNotification = (title: string, message: string, type: "success" | "info" | "warning" = "success") => {
    const newToast = {
      id: Date.now().toString(),
      title,
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification("Enterprise Data Exported", "All ledgers, stockpile counts, and timelines compiled into secure CSV formats.", "success");
    }, 1500);
  };

  const handleDeployAI = () => {
    setIsDeployingAI(true);
    setTimeout(() => {
      setIsDeployingAI(false);
      showNotification("Nexus AI Production Deploy", "Active neural heuristics compiled and optimized across global factory hubs.", "success");
    }, 2000);
  };

  // Convert stats to respect currency selection
  const getCurrencySymbol = () => {
    switch (currency) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return "$";
    }
  };

  // Map state to customized values depending on currency selection
  const customizedErpState = {
    ...erpState,
    kpis: {
      ...erpState.kpis,
      totalRevenue: {
        ...erpState.kpis.totalRevenue,
        value: erpState.kpis.totalRevenue.value.replace("$", getCurrencySymbol())
      },
      operatingExpenses: {
        ...erpState.kpis.operatingExpenses,
        value: erpState.kpis.operatingExpenses.value.replace("$", getCurrencySymbol())
      },
      netProfit: {
        ...erpState.kpis.netProfit,
        value: erpState.kpis.netProfit.value.replace("$", getCurrencySymbol())
      }
    }
  };

  return (
    <div className="min-h-screen text-text-dark bg-background-base flex font-sans antialiased selection:bg-brand-primary/10">
      
      {/* Global Sidebar - Left Anchor */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-surface-card flex-col border-r border-gray-100 z-50">
        <div className="p-6">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-primary flex items-center justify-center rounded-xl soft-shadow text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 010 18M12 3a9.004 9.004 0 00-8.716 3.247M12 3a9.004 9.004 0 018.716 3.247" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-brand-primary leading-none">Cloud ERP</h1>
              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mt-1.5">AI Production System</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {[
              { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "Analytics", label: "Analytics", icon: LineChart },
              { id: "Inventory", label: "Inventory", icon: Package },
              { id: "Production", label: "Production", icon: Factory },
              { id: "Supply Chain", label: "Supply Chain", icon: Truck },
              { id: "Settings", label: "Settings", icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-blue-50/80 text-brand-primary border-l-4 border-brand-primary rounded-l-none pl-3 shadow-sm" 
                      : "text-text-soft hover:text-brand-primary hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-brand-primary" : "text-text-muted"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Trigger Button */}
          <div className="mt-8">
            <button 
              onClick={() => {
                setActiveTab("Dashboard");
                showNotification("AI Core Triggered", "Scroll down to 'Ask Nexus Anything' chat module to design custom ERP automations.", "info");
              }}
              className="w-full bg-brand-primary text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-accent transition-all hover:shadow-lg active:scale-98 duration-150 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>New AI Workflow</span>
            </button>
          </div>
        </div>

        {/* Support & Docs - Bottom Stick */}
        <div className="mt-auto p-6 border-t border-gray-100 space-y-1">
          <button 
            onClick={() => setActiveOverlayModal("support")}
            className="w-full flex items-center gap-3 px-4 py-2 text-text-soft hover:text-brand-primary hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <HelpCircle className="w-4.5 h-4.5 text-text-muted" />
            <span>Support Helpdesk</span>
          </button>
          <button 
            onClick={() => setActiveOverlayModal("docs")}
            className="w-full flex items-center gap-3 px-4 py-2 text-text-soft hover:text-brand-primary hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileText className="w-4.5 h-4.5 text-text-muted" />
            <span>Documentation</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-surface-card border-b border-gray-100 px-4 h-16 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 010 18M12 3a9.004 9.004 0 00-8.716 3.247M12 3a9.004 9.004 0 018.716 3.247" />
            </svg>
          </div>
          <span className="font-extrabold text-brand-primary text-sm">Cloud ERP</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-text-soft hover:bg-gray-50 rounded-lg cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 w-[260px] bg-surface-card z-50 border-r border-gray-100 flex flex-col p-6 shadow-2xl pt-20"
          >
            <nav className="space-y-1.5 flex-1">
              {[
                { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "Analytics", label: "Analytics", icon: LineChart },
                { id: "Inventory", label: "Inventory", icon: Package },
                { id: "Production", label: "Production", icon: Factory },
                { id: "Supply Chain", label: "Supply Chain", icon: Truck },
                { id: "Settings", label: "Settings", icon: SettingsIcon },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-blue-50 text-brand-primary border-l-4 border-brand-primary rounded-l-none pl-3 shadow-sm" 
                        : "text-text-soft hover:text-brand-primary hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="border-t border-gray-50 pt-4 space-y-1">
              <button 
                onClick={() => { setActiveOverlayModal("support"); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-text-soft hover:text-brand-primary rounded-lg text-xs font-bold cursor-pointer"
              >
                <HelpCircle className="w-4.5 h-4.5 text-text-muted" />
                <span>Support</span>
              </button>
              <button 
                onClick={() => { setActiveOverlayModal("docs"); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-text-soft hover:text-brand-primary rounded-lg text-xs font-bold cursor-pointer"
              >
                <FileText className="w-4.5 h-4.5 text-text-muted" />
                <span>Documentation</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Header & Main View Wrappers */}
      <div className="flex-1 flex flex-col lg:pl-[280px] pt-16 lg:pt-0 min-h-screen">
        
        {/* TopNavBar Anchor */}
        <header className="sticky top-0 h-[72px] bg-white/95 border-b border-gray-100 flex justify-between items-center px-6 z-30 shadow-sm glass-header select-none">
          {/* Search Box */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-border-subtle hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary rounded-full px-4 py-1.5 w-72 transition-all">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input 
                type="text" 
                placeholder="Search enterprise stockpile..."
                onClick={() => {
                  setActiveTab("Inventory");
                  showNotification("Search Triggered", "Redirected to stockpile registry.", "info");
                }}
                className="bg-transparent border-none focus:outline-none text-xs w-full p-0 text-text-dark"
              />
            </div>
            
            <nav className="hidden md:flex gap-6 text-xs font-bold text-text-soft">
              <button 
                onClick={() => {
                  setActiveTab("Analytics");
                  showNotification("Enterprise Divisions", "Audit details and personnel levels mapped below.", "info");
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer"
              >
                Organizations
              </button>
              <button 
                onClick={() => {
                  setActiveTab("Supply Chain");
                  showNotification("Logistic Operations", "Supplier route waypoints and transponders live.", "info");
                }}
                className="hover:text-brand-primary transition-colors cursor-pointer"
              >
                Resources
              </button>
            </nav>
          </div>

          {/* User & Actions Hub */}
          <div className="flex items-center gap-3.5">
            {/* Header Icons */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100">
              <button 
                onClick={() => {
                  showNotification("Operational Alert Feed", "API diagnostics stable. Raw components within standard buffer.", "info");
                }}
                className="p-2 text-text-soft hover:bg-gray-50 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5 text-text-soft" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
              </button>
              <button 
                onClick={() => setActiveTab("Settings")}
                className="p-2 text-text-soft hover:bg-gray-50 rounded-full transition-colors cursor-pointer animate-spin-hover"
              >
                <SettingsIcon className="w-4.5 h-4.5 text-text-soft" />
              </button>
              <button 
                onClick={() => {
                  showNotification("Integration Grid", "Warehouse ERP sync active. Connectors running on port 3000.", "info");
                }}
                className="p-2 text-text-soft hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
              >
                <Grid className="w-4.5 h-4.5 text-text-soft" />
              </button>
            </div>

            {/* CTA action buttons */}
            <button 
              onClick={handleExportAll}
              disabled={isExporting}
              className="hidden md:block bg-gray-50 border border-gray-150 hover:bg-gray-100 text-text-soft font-bold text-xs py-2.5 px-4.5 rounded-lg soft-shadow transition-all duration-150 cursor-pointer disabled:opacity-60"
            >
              {isExporting ? "Exporting..." : "Export"}
            </button>
            
            <button 
              onClick={handleDeployAI}
              disabled={isDeployingAI}
              className="bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs py-2.5 px-4.5 rounded-lg soft-shadow transition-all duration-150 hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isDeployingAI ? "Deploying..." : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Deploy AI</span>
                </>
              )}
            </button>

            {/* Avatar Headshot */}
            <div 
              onClick={() => setActiveOverlayModal("avatar")}
              className="w-10 h-10 rounded-full border-2 border-blue-100 ring-2 ring-white overflow-hidden cursor-pointer hover:border-brand-primary hover:scale-105 transition-all shrink-0 select-none"
            >
              <img 
                referrerPolicy="no-referrer"
                alt="Sarah J." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3unbGhlfUHh_YzS-qrR8VXMiAT6TmtBu6Em6OagcMRx8To8NrVwvf00gqxg9UeVBRsVBE-wR1HzC1CH4d_fd3grdT03pwanmayd0PbYw4vFy2G17efrVxo2cX3RcVzEC79UPa5e-ZNEXi8oGJuB-hXp1azyYaDFzNsofq2jhTP9TGczY_g29h9YSG-1MiwF3Z4wuN_-03V-deNG47VDZ-whUpFkBtQ_mym8bFJy7W8NpE4Ih2gNdQ-7Cqom5trhFbgNLxOKbfXnoE" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Core Main View Stage */}
        <main className="flex-1 px-6 sm:px-8 py-8 overflow-x-hidden max-w-7xl w-full mx-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "Dashboard" && (
                <DashboardView 
                  erpState={customizedErpState}
                  setErpState={setErpState}
                  onNavigate={setActiveTab}
                  onShowNotification={showNotification}
                />
              )}
              {activeTab === "Analytics" && (
                <AnalyticsView 
                  erpState={customizedErpState}
                  onShowNotification={showNotification}
                />
              )}
              {activeTab === "Inventory" && (
                <InventoryView 
                  erpState={erpState}
                  setErpState={setErpState}
                  onShowNotification={showNotification}
                />
              )}
              {activeTab === "Production" && (
                <ProductionView 
                  erpState={erpState}
                  setErpState={setErpState}
                  onShowNotification={showNotification}
                />
              )}
              {activeTab === "Supply Chain" && (
                <SupplyChainView 
                  erpState={erpState}
                  setErpState={setErpState}
                  onShowNotification={showNotification}
                />
              )}
              {activeTab === "Settings" && (
                <SettingsView 
                  erpState={erpState}
                  onShowNotification={showNotification}
                  currency={currency}
                  setCurrency={setCurrency}
                  systemPrompt={systemPrompt}
                  setSystemPrompt={setSystemPrompt}
                  temperature={temperature}
                  setTemperature={setTemperature}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* --- TOAST NOTIFICATIONS (Slide in from top-right) --- */}
      <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none max-w-sm w-full select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`p-4 rounded-xl shadow-2xl border pointer-events-auto flex gap-3 text-xs ${
                toast.type === "success" ? "bg-white border-emerald-100 text-text-dark" :
                toast.type === "warning" ? "bg-white border-red-100 text-text-dark" :
                "bg-white border-blue-100 text-text-dark"
              }`}
            >
              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold ${
                toast.type === "success" ? "bg-emerald-50 text-emerald-600" :
                toast.type === "warning" ? "bg-red-50 text-red-500" :
                "bg-blue-50 text-brand-primary"
              }`}>
                {toast.type === "success" ? "✓" : "i"}
              </div>
              <div className="flex-1">
                <p className="font-extrabold">{toast.title}</p>
                <p className="text-text-muted mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- OVERLAY SYSTEM MODALS --- */}
      <AnimatePresence>
        
        {/* 1. Support Modal */}
        {activeOverlayModal === "support" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
              <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SupportIcon className="w-5 h-5" />
                  <h3 className="font-bold text-sm">ERP Technical Support Desk</h3>
                </div>
                <button onClick={() => setActiveOverlayModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs leading-relaxed text-text-soft">
                <p>
                  Welcome to the cloud support center. Your node is fully active and synchronized.
                </p>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 font-semibold">
                    <span className="text-text-muted">Node ID:</span>
                    <span className="font-mono text-text-dark">cl-node-401-west</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 font-semibold">
                    <span className="text-text-muted">Container Port:</span>
                    <span className="font-mono text-text-dark">3000</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-text-muted">User Handle:</span>
                    <span className="text-text-dark font-mono">Sarah J. (Finance COO)</span>
                  </div>
                </div>
                <p>
                  If you require operational assistance, please contact our system administrators or ask Nexus AI to automate a support ticket flow directly in the chat widget!
                </p>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setActiveOverlayModal(null)}
                    className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2.5 rounded-lg font-bold"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Documentation Modal */}
        {activeOverlayModal === "docs" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
              <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-sm">Cloud ERP Integration Manual</h3>
                </div>
                <button onClick={() => setActiveOverlayModal(null)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs leading-relaxed text-text-soft overflow-y-auto max-h-[60vh] custom-scrollbar">
                <h4 className="font-bold text-text-dark text-sm border-b border-gray-100 pb-1">1. Cloud ERP System Architecture</h4>
                <p>
                  The Cloud ERP application is an advanced full-stack enterprise planner powered by React on Vite (frontend) and an Express.js container proxy (backend server) running on port 3000.
                </p>
                <h4 className="font-bold text-text-dark text-sm border-b border-gray-100 pb-1 mt-4">2. Interactive AI Grounding</h4>
                <p>
                  The **Ask Nexus Anything** assistant utilizes Google Gemini GenAI modeling to query the live active databases. By injecting real-time KPI structures and inventory levels directly into system instructions, Nexus can evaluate raw resource stockpiles and plan schedules without mock delays.
                </p>
                <h4 className="font-bold text-text-dark text-sm border-b border-gray-100 pb-1 mt-4">3. Operating Workflows</h4>
                <p>
                  Users can deploy automated reorders, manage stock levels, advance stages of production on the Kanban pipeline, and track inbound cargo transponders securely.
                </p>
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => setActiveOverlayModal(null)}
                    className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2.5 rounded-lg font-bold"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Avatar Executive Modal */}
        {activeOverlayModal === "avatar" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
              <div className="bg-gradient-to-br from-brand-primary to-brand-accent p-6 text-white flex flex-col items-center">
                <button 
                  onClick={() => setActiveOverlayModal(null)} 
                  className="text-white/80 hover:text-white font-bold text-sm absolute right-4 top-4"
                >
                  ✕
                </button>
                <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-lg mb-3">
                  <img 
                    referrerPolicy="no-referrer"
                    alt="Sarah J." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3unbGhlfUHh_YzS-qrR8VXMiAT6TmtBu6Em6OagcMRx8To8NrVwvf00gqxg9UeVBRsVBE-wR1HzC1CH4d_fd3grdT03pwanmayd0PbYw4vFy2G17efrVxo2cX3RcVzEC79UPa5e-ZNEXi8oGJuB-hXp1azyYaDFzNsofq2jhTP9TGczY_g29h9YSG-1MiwF3Z4wuN_-03V-deNG47VDZ-whUpFkBtQ_mym8bFJy7W8NpE4Ih2gNdQ-7Cqom5trhFbgNLxOKbfXnoE" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-extrabold text-sm">Sarah Jenkins</h3>
                <p className="text-[10px] text-blue-100 uppercase tracking-widest font-extrabold mt-1">Chief Operations & Financial Officer</p>
              </div>
              <div className="p-6 space-y-4 text-xs leading-relaxed text-text-soft bg-gray-50/50">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 font-semibold">
                    <span className="text-text-muted">Direct Division:</span>
                    <span className="text-text-dark font-bold">Executive Office</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 font-semibold">
                    <span className="text-text-muted">Security Clearance:</span>
                    <span className="font-bold text-brand-primary flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-brand-primary" /> Level 5 Administrator
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-text-muted">Primary Handle:</span>
                    <span className="text-text-dark font-mono">sarah.j@nexuserp.io</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => setActiveOverlayModal(null)}
                    className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2.5 rounded-lg font-bold w-full"
                  >
                    Return to Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
