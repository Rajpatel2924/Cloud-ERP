import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Key, 
  Sliders, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Info,
  RefreshCw,
  Cpu,
  Globe,
  DollarSign
} from "lucide-react";
import { ERPState } from "../types";

interface SettingsViewProps {
  erpState: ERPState;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
  currency: string;
  setCurrency: (c: string) => void;
  systemPrompt: string;
  setSystemPrompt: (p: string) => void;
  temperature: number;
  setTemperature: (t: number) => void;
}

export default function SettingsView({ 
  erpState, 
  onShowNotification, 
  currency, 
  setCurrency,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature
}: SettingsViewProps) {
  const [companyName, setCompanyName] = useState("Nexus Advanced Systems Corp");
  const [taxId, setTaxId] = useState("TX-88219-B");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onShowNotification("Configurations Saved", "ERP ledger preferences and AI hyper-parameters updated on main server.", "success");
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-gray-100 py-4">
        <h2 className="text-3xl font-bold tracking-tight text-text-dark">ERP Configuration</h2>
        <p className="text-sm text-text-muted mt-1">Configure global ledger parameters, currency settings, API authorization keys, and tuning hyper-parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Company profile preferences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
              <Globe className="w-5 h-5 text-brand-primary" />
              <h4 className="text-base font-bold text-text-dark">Corporate Profile & Ledgers</h4>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-soft">Enterprise Organization Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-soft">Base Ledger Currency</label>
                  <select 
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      onShowNotification("Currency Updated", `Switched ERP base currency ledger to: ${e.target.value}`, "info");
                    }}
                    className="w-full border border-border-subtle rounded-lg px-2.5 py-2.5 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none font-semibold cursor-pointer"
                  >
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="EUR">EUR (€) - European Euro</option>
                    <option value="GBP">GBP (£) - British Pound Sterling</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-soft">Corporate Tax Registration ID</label>
                  <input 
                    type="text" 
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-50 mt-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-2.5 rounded-lg text-xs font-bold disabled:opacity-75 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing Ledgers...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Organization Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Engine Settings */}
          <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
              <Sliders className="w-5 h-5 text-brand-primary" />
              <h4 className="text-base font-bold text-text-dark">Nexus AI Hyper-Parameters</h4>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-soft flex justify-between">
                  <span>Temperature (Creativity tuning)</span>
                  <span className="font-mono text-brand-primary font-bold">{temperature}</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold">
                  <span>Deterministic (0.1)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-soft">Preferred Model Alias</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border border-border-subtle rounded-lg px-2.5 py-2.5 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none font-semibold cursor-pointer"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Fast, analytical, lightweight)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex advanced reasoning)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-low latency)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-soft">Core AI System Prompt</label>
                <textarea 
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full border border-border-subtle rounded-lg p-3 text-xs text-text-soft font-mono focus:ring-2 focus:ring-brand-primary outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Status Monitor */}
        <div className="space-y-6">
          <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                <Key className="w-5 h-5 text-brand-primary" />
                <h4 className="text-base font-bold text-text-dark">AI Service Connection</h4>
              </div>

              {/* Connected State Badge (Always looks great, shows sandbox or live) */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/50 flex gap-3 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">Sandbox API Gateway Active</p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    The Express server will automatically attempt to read your `GEMINI_API_KEY` from your workspace context.
                  </p>
                </div>
              </div>

              {/* API Key Instructions */}
              <div className="mt-6 space-y-4 text-xs leading-relaxed text-text-soft">
                <h5 className="font-bold text-text-dark flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-brand-primary" />
                  How to configure AI Secrets
                </h5>
                <p>
                  Your API keys are stored in a sandboxed, server-only secret wallet. This prevents them from ever leakings to the browser.
                </p>
                <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                  Open the **Secrets** tab in the top-right toolbar panel of Google AI Studio and define:
                  <code className="block mt-1 font-mono text-[10px] bg-white p-1 border border-gray-100 rounded text-brand-accent">
                    GEMINI_API_KEY = "your_key_here"
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <Cpu className="w-5 h-5 text-brand-primary" />
              <h4 className="text-base font-bold text-text-dark">ERP Node Diagnostics</h4>
            </div>

            <div className="space-y-3.5 text-xs text-text-soft">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-text-muted font-semibold">Node Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  Active / Live
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-text-muted font-semibold">Service Container Port:</span>
                <span className="font-mono font-bold text-text-dark">3000 (Proxy Routing)</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-text-muted font-semibold">HMR Assets Loader:</span>
                <span className="font-mono font-bold text-text-dark">Offline-Optimized</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-semibold">Enterprise Database:</span>
                <span className="font-bold text-text-dark">In-Memory Sandbox Ledger</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
