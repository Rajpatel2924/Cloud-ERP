import React, { useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  HelpCircle,
  Percent,
  Sliders,
  Calculator,
  Layers,
  ArrowRight
} from "lucide-react";
import { ERPState } from "../types";

interface AnalyticsViewProps {
  erpState: ERPState;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

const DEPARTMENT_SPEND = [
  { dept: "Engineering", budget: 1.0, actual: 0.85, efficiency: 94, staff: 42, ROI: "+145%" },
  { dept: "Logistics", budget: 0.5, actual: 0.40, efficiency: 89, staff: 25, ROI: "+112%" },
  { dept: "Procurement", budget: 0.3, actual: 0.32, efficiency: 91, staff: 15, ROI: "+98%" },
  { dept: "Finance", budget: 0.25, actual: 0.20, efficiency: 98, staff: 8, ROI: "+180%" },
  { dept: "Marketing", budget: 0.15, actual: 0.10, efficiency: 86, staff: 6, ROI: "+85%" }
];

export default function AnalyticsView({ erpState, onShowNotification }: AnalyticsViewProps) {
  const [growthTarget, setGrowthTarget] = useState(25); // Slider percentage
  const [isProjecting, setIsProjecting] = useState(false);
  const [projectedRevenue, setProjectedRevenue] = useState(5.25); // Millions
  const [projectedProfit, setProjectedProfit] = useState(3.00); // Millions
  const [aiAdvisory, setAiAdvisory] = useState<string>("Based on a 25% growth target, Nexus AI recommends a 5% increase in Engineering staffing and an automation of 2 additional inventory reorder routes to prevent supply side bottlenecks.");

  const triggerRecalculateProjections = () => {
    setIsProjecting(true);
    setTimeout(() => {
      // Linear scaling simulation based on slider value
      const factor = 1 + (growthTarget / 100);
      const newRev = 4.2 * factor;
      const newExp = 1.8 * (1 + (growthTarget * 0.4 / 100)); // Expenses grow slower
      const newProfit = newRev - newExp;

      setProjectedRevenue(parseFloat(newRev.toFixed(2)));
      setProjectedProfit(parseFloat(newProfit.toFixed(2)));

      // Set custom advisory texts
      if (growthTarget < 20) {
        setAiAdvisory("Steady growth target. Recommend maintaining current headcount and focusing on expense optimization. Existing workflows are sufficient.");
      } else if (growthTarget < 50) {
        setAiAdvisory(`Aggressive growth target of ${growthTarget}%. Recommend accelerating hiring in Engineering and deploying automated supply chain triggers. Anticipated capital efficiency: Excellent.`);
      } else {
        setAiAdvisory(`Hyper-scale target of ${growthTarget}%. Warning: This requires scaling personnel by 22% and securing raw suppliers in advance. Recommend establishing an automated bulk reorder workflow for all zones immediately.`);
      }

      setIsProjecting(false);
      onShowNotification("Projections Recalculated", `AI projected $${newRev.toFixed(2)}M in future revenue.`, "success");
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-100 py-4">
        <h2 className="text-3xl font-bold tracking-tight text-text-dark">Operations & Analytics</h2>
        <p className="text-sm text-text-muted mt-1">Granular financial insights, departmental budgets, and predictive growth modeling.</p>
      </div>

      {/* Main Grid: Bar Chart & Projections Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Spend Chart (SVG) */}
        <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-text-dark mb-1">Departmental Budgets vs Spend</h4>
            <p className="text-xs text-text-muted">Tracking H1 2024 operating efficiency in Millions (USD)</p>
          </div>

          {/* SVG Departmental Budget Bar Chart */}
          <div className="relative h-[250px] w-full mt-6 select-none">
            <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="50" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1"></line>
              <line x1="50" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1"></line>
              <line x1="50" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1"></line>
              <line x1="50" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5"></line>

              {/* Budget Bars vs Actual Bars */}
              {DEPARTMENT_SPEND.map((item, idx) => {
                const x = 70 + (idx * 85);
                const budgetH = item.budget * 150;
                const actualH = item.actual * 150;
                
                return (
                  <g key={item.dept}>
                    {/* Budget Bar (Gray-blue back) */}
                    <rect 
                      x={x} 
                      y={180 - budgetH} 
                      width="16" 
                      height={budgetH} 
                      fill="#e2e8f7" 
                      rx="3"
                    ></rect>
                    {/* Actual Spend Bar (Blue front) */}
                    <rect 
                      x={x + 10} 
                      y={180 - actualH} 
                      width="16" 
                      height={actualH} 
                      fill="#004ac6" 
                      rx="3"
                      className="transition-all duration-500 hover:fill-[#2563eb] cursor-help"
                      title={`Actual: $${item.actual}M`}
                    ></rect>
                  </g>
                );
              })}
            </svg>
            
            {/* Axis Labels */}
            <div className="absolute bottom-1.5 left-0 w-full flex justify-between text-[10px] font-bold text-text-muted px-12">
              {DEPARTMENT_SPEND.map(d => (
                <span key={d.dept} className="w-[70px] text-center">{d.dept.slice(0, 5)}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 border-t border-gray-50 pt-4 text-xs font-semibold text-text-soft">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#e2e8f7]"></span>
              <span>Allocated Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-brand-primary"></span>
              <span>Actual Spend</span>
            </div>
          </div>
        </div>

        {/* Projections Simulator (Interactive Slider) */}
        <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-brand-primary" />
              <h4 className="text-base font-bold text-text-dark">AI Growth Projections Simulator</h4>
            </div>
            <p className="text-xs text-text-muted">Simulate the enterprise impacts of higher operating velocities</p>
          </div>

          <div className="space-y-5 my-6">
            {/* Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-text-soft">Target Growth Multiplier</span>
                <span className="font-extrabold text-brand-primary text-sm">+{growthTarget}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={growthTarget}
                onChange={(e) => setGrowthTarget(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold">
                <span>Steady (5%)</span>
                <span>Hyper Scale (100%)</span>
              </div>
            </div>

            {/* Recalculate button */}
            <button 
              onClick={triggerRecalculateProjections}
              disabled={isProjecting}
              className="w-full bg-brand-primary hover:bg-brand-accent text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isProjecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Financial Models...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Recalculate AI Growth Projections</span>
                </>
              )}
            </button>

            {/* Projection Output Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Projected Revenue</p>
                <p className="text-xl font-extrabold text-text-dark mt-1">${projectedRevenue.toFixed(2)}M</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 
                  +{growthTarget}% vs Current
                </p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Projected Net Profit</p>
                <p className="text-xl font-extrabold text-text-dark mt-1">${projectedProfit.toFixed(2)}M</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 
                  +{Math.round((projectedProfit - 2.4)/2.4 * 100)}% Profit Margin
                </p>
              </div>
            </div>
          </div>

          {/* AI Advisory Summary */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100/50 flex gap-2">
            <Sparkles className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] leading-relaxed text-brand-accent font-medium">
              <span className="font-bold">Nexus AI Recommendation: </span>
              {aiAdvisory}
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-surface-card rounded-xl border border-gray-100 soft-shadow overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/20">
          <h4 className="text-base font-bold text-text-dark">Enterprise Division Ledger</h4>
          <p className="text-xs text-text-muted mt-0.5">Comprehensive audit matrix of personnel and infrastructure ROI</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-text-muted font-bold bg-gray-50/50">
                <th className="p-4">Division</th>
                <th className="p-4">Staff Allocation</th>
                <th className="p-4">Allocated Budget</th>
                <th className="p-4">Actual Expenditure</th>
                <th className="p-4">Audit ROI Score</th>
                <th className="p-4">Efficiency</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEPARTMENT_SPEND.map((item) => (
                <tr key={item.dept} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 font-bold text-text-dark">{item.dept}</td>
                  <td className="p-4 text-text-soft font-medium">{item.staff} Active Specialists</td>
                  <td className="p-4 text-text-soft font-medium">${item.budget.toFixed(2)}M</td>
                  <td className="p-4 text-text-soft font-mono">${item.actual.toFixed(2)}M</td>
                  <td className="p-4 font-extrabold text-emerald-600">{item.ROI}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.efficiency >= 92 ? "bg-emerald-500" :
                            item.efficiency >= 88 ? "bg-brand-primary" :
                            "bg-amber-500"
                          }`}
                          style={{ width: `${item.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-text-soft">{item.efficiency}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.actual <= item.budget 
                        ? "bg-green-50 text-green-700" 
                        : "bg-red-50 text-danger-text"
                    }`}>
                      {item.actual <= item.budget ? "Optimized" : "Over Budget"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
