import React, { useState } from "react";
import { 
  Plus, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  Tag, 
  User, 
  X,
  Play,
  ClipboardList
} from "lucide-react";
import { ERPState, ProductionBatch } from "../types";

interface ProductionViewProps {
  erpState: ERPState;
  setErpState: React.Dispatch<React.SetStateAction<ERPState>>;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

const STAGES: ProductionBatch["stage"][] = [
  "Backlog",
  "Scheduled",
  "In Progress",
  "Quality Control",
  "Completed"
];

export default function ProductionView({ erpState, setErpState, onShowNotification }: ProductionViewProps) {
  // New batch form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [units, setUnits] = useState("");
  const [priority, setPriority] = useState<ProductionBatch["priority"]>("Medium");
  const [startDate, setStartDate] = useState("2026-07-02");
  const [endDate, setEndDate] = useState("2026-07-12");

  // Advance stage of a batch
  const handleAdvanceBatch = (batchId: string) => {
    setErpState((prev) => {
      const updatedProduction = prev.inventory; // wait let's update production list
      const updatedBatches = prev.production.map((batch) => {
        if (batch.id === batchId) {
          const currentIdx = STAGES.indexOf(batch.stage);
          if (currentIdx < STAGES.length - 1) {
            const nextStage = STAGES[currentIdx + 1];
            
            // Trigger activity if completed
            const auditActivities = [...prev.activities];
            if (nextStage === "Completed") {
              auditActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: "shipment",
                title: `Production batch completed`,
                description: `Batch ${batch.id} (${batch.name}) finalized and shipped to storage.`,
                time: "Just now"
              });
            }

            return {
              ...batch,
              stage: nextStage
            };
          }
        }
        return batch;
      });

      // Recalculate activities if stage changed
      let finalActivities = prev.activities;
      const originalBatch = prev.production.find(b => b.id === batchId);
      const updatedBatch = updatedBatches.find(b => b.id === batchId);
      
      if (originalBatch && updatedBatch && originalBatch.stage !== updatedBatch.stage) {
        finalActivities = [
          {
            id: `ACT-${Date.now()}`,
            type: "system",
            title: `${updatedBatch.id} stage advanced`,
            description: `Moved from ${originalBatch.stage} to ${updatedBatch.stage}.`,
            time: "Just now"
          },
          ...prev.activities
        ];
      }

      return {
        ...prev,
        production: updatedBatches,
        activities: finalActivities
      };
    });

    onShowNotification("Batch Advanced", `Batch stage updated successfully.`, "success");
  };

  // Create new batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !units) return;

    const newBatch: ProductionBatch = {
      id: `PRD-${Math.floor(200 + Math.random() * 99)}`,
      name: productName,
      units: parseInt(units),
      stage: "Scheduled",
      priority,
      startDate,
      endDate
    };

    setErpState((prev) => ({
      ...prev,
      production: [newBatch, ...prev.production],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type: "system",
          title: `Production batch ${newBatch.id} scheduled`,
          description: `Sourcing raw materials to build ${newBatch.units} units of ${newBatch.name}.`,
          time: "Just now"
        },
        ...prev.activities
      ]
    }));

    onShowNotification("Production Scheduled", `Scheduled assembly pipeline for ${productName}.`, "success");
    setIsFormOpen(false);
    setProductName("");
    setUnits("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-gray-100 py-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-dark">Production Pipelines</h2>
          <p className="text-sm text-text-muted mt-1">Gantt-aligned assembly lines, assembly stage controls, and hardware scheduling.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-150 shadow-md self-start shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Schedule Production Batch</span>
        </button>
      </div>

      {/* Production Pipeline Board (Kanban Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageBatches = erpState.production.filter(b => b.stage === stage);
          
          return (
            <div key={stage} className="bg-gray-50/55 rounded-xl border border-gray-100/50 p-4 flex flex-col h-[70vh]">
              {/* Stage Header */}
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    stage === "Backlog" ? "bg-gray-400" :
                    stage === "Scheduled" ? "bg-purple-400" :
                    stage === "In Progress" ? "bg-brand-primary" :
                    stage === "Quality Control" ? "bg-amber-500" :
                    "bg-green-500"
                  }`}></span>
                  <span className="text-xs font-bold text-text-dark">{stage}</span>
                </div>
                <span className="bg-white/80 border border-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-text-muted">
                  {stageBatches.length}
                </span>
              </div>

              {/* Cards Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-0.5">
                {stageBatches.length === 0 ? (
                  <div className="border border-dashed border-gray-200/60 rounded-xl p-8 text-center text-[10px] text-text-muted flex flex-col items-center justify-center space-y-1.5 h-32">
                    <ClipboardList className="w-8 h-8 text-gray-300" />
                    <span>No active batches</span>
                  </div>
                ) : (
                  stageBatches.map((batch) => (
                    <div 
                      key={batch.id} 
                      className="bg-white rounded-xl border border-gray-100 p-4 soft-shadow hover:border-brand-primary hover:scale-[1.01] transition-all group relative overflow-hidden"
                    >
                      {/* Priority color bar */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        batch.priority === "High" ? "bg-red-500" :
                        batch.priority === "Medium" ? "bg-brand-primary" :
                        "bg-gray-400"
                      }`}></div>

                      {/* Card Content */}
                      <div className="pl-1.5 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[10px] font-bold text-text-muted">{batch.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            batch.priority === "High" ? "bg-red-50 text-red-600" :
                            batch.priority === "Medium" ? "bg-blue-50 text-brand-primary" :
                            "bg-gray-100 text-text-soft"
                          }`}>
                            {batch.priority}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-bold text-text-dark text-[11px] leading-snug group-hover:text-brand-primary transition-colors">
                            {batch.name}
                          </p>
                          <p className="text-[10px] text-text-muted mt-1 font-semibold flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-gray-400" /> {batch.units.toLocaleString()} Units scheduled
                          </p>
                        </div>

                        <div className="border-t border-gray-50 pt-2 flex justify-between items-center text-[9px] text-text-muted font-semibold">
                          <span>Start: {batch.startDate}</span>
                          <span>End: {batch.endDate}</span>
                        </div>

                        {/* Advance button */}
                        {stage !== "Completed" && (
                          <button 
                            onClick={() => handleAdvanceBatch(batch.id)}
                            className="w-full mt-3 bg-gray-50 hover:bg-brand-primary text-text-soft hover:text-white border border-gray-100 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all duration-150"
                          >
                            <span>Advance Stage</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Form Sidebar Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-sm">Schedule Production pipeline</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Target Assembled Product</label>
                <input 
                  type="text" 
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="E.g., Titanium Actuator Joint"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Manufacturing Units</label>
                  <input 
                    type="number" 
                    required
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    placeholder="E.g., 750"
                    className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Assembly Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Release Date</label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-soft">Target Shipment Date</label>
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-text-soft hover:bg-gray-50 border border-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-primary hover:bg-brand-accent text-white px-5 py-2 rounded-lg text-xs font-bold"
                >
                  Confirm Assembly Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
