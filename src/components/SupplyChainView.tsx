import React, { useState } from "react";
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  Navigation, 
  AlertTriangle,
  Info,
  Sliders,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { ERPState, Shipment } from "../types";

interface SupplyChainViewProps {
  erpState: ERPState;
  setErpState: React.Dispatch<React.SetStateAction<ERPState>>;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

const TIMELINE_STEPS = [
  { label: "Invoice Audit & Sign-off", description: "Ledger approval completed by finance division" },
  { label: "Cargo Dispatched & Port Loaded", description: "Supplier passed raw inspection and carrier loaded" },
  { label: "In Ocean/Air Transit", description: "In-route cargo tracked via satellite transponder" },
  { label: "Local Customs Clearance", description: "Enterprise legal team approved compliance" },
  { label: "Arrived at Warehouse Dock", description: "Scanned and shelved at warehouse storage bays" }
];

export default function SupplyChainView({ erpState, setErpState, onShowNotification }: SupplyChainViewProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(erpState.shipments[0] || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form states
  const [vendorName, setVendorName] = useState("");
  const [routePath, setRoutePath] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("2026-07-06");

  // Determine active step of shipment based on status
  const getActiveStepIndex = (status: Shipment["status"]) => {
    switch (status) {
      case "Delivered": return 4;
      case "Delayed": return 2; // Stuck in transit
      case "Departed Facility": return 1;
      case "In Transit": return 2;
      default: return 0;
    }
  };

  // Add shipment
  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !routePath.trim()) return;

    const newShipment: Shipment = {
      id: `SHP-${Math.floor(4000 + Math.random() * 999)}`,
      vendor: vendorName,
      route: routePath,
      estDelivery: deliveryDate,
      status: "In Transit"
    };

    setErpState((prev) => ({
      ...prev,
      shipments: [newShipment, ...prev.shipments],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type: "shipment",
          title: `Inbound shipment logged`,
          description: `Logged shipment ${newShipment.id} from ${newShipment.vendor}. Route: ${newShipment.route}`,
          time: "Just now"
        },
        ...prev.activities
      ]
    }));

    onShowNotification("Shipment Scheduled", `Cargo route registered for ${vendorName}.`, "success");
    setIsFormOpen(false);
    setVendorName("");
    setRoutePath("");
    setSelectedShipment(newShipment);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-gray-100 py-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-dark">Global Supply Chain</h2>
          <p className="text-sm text-text-muted mt-1">Satellite carrier tracking, raw material logistics, and real-time custom clearances.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-150 shadow-md self-start shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Register Inbound Shipment</span>
        </button>
      </div>

      {/* Main Layout: Active Shipments List & Visual Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Shipment Table List (8 columns on large) */}
        <div className="lg:col-span-7 bg-surface-card rounded-xl border border-gray-100 soft-shadow overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/10">
            <h4 className="text-base font-bold text-text-dark">Global Supplier Cargo Pipelines</h4>
            <p className="text-xs text-text-muted mt-0.5">Click any shipment row below to overlay live transponder progress</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-text-muted font-bold bg-gray-50/30">
                  <th className="p-4">Cargo ID</th>
                  <th className="p-4">Supplier / Vendor</th>
                  <th className="p-4">Transit Route</th>
                  <th className="p-4">Est. Unload Date</th>
                  <th className="p-4">Transport State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {erpState.shipments.map((shipment) => (
                  <tr 
                    key={shipment.id} 
                    onClick={() => setSelectedShipment(shipment)}
                    className={`hover:bg-gray-50/40 cursor-pointer transition-all ${
                      selectedShipment?.id === shipment.id ? "bg-blue-50/60 font-medium" : ""
                    }`}
                  >
                    <td className="p-4 font-mono font-bold text-text-muted flex items-center gap-2">
                      <Navigation className={`w-3.5 h-3.5 text-brand-primary ${
                        selectedShipment?.id === shipment.id ? "rotate-45" : "text-gray-400"
                      }`} />
                      {shipment.id}
                    </td>
                    <td className="p-4 font-bold text-text-dark">{shipment.vendor}</td>
                    <td className="p-4 text-text-soft font-semibold max-w-[200px] truncate" title={shipment.route}>
                      {shipment.route}
                    </td>
                    <td className="p-4 text-text-soft font-mono font-semibold">{shipment.estDelivery}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        shipment.status === "Delivered" ? "bg-green-50 text-green-700" :
                        shipment.status === "Delayed" ? "bg-red-50 text-danger-text animate-pulse" :
                        shipment.status === "Departed Facility" ? "bg-purple-50 text-purple-700" :
                        "bg-blue-50 text-brand-primary"
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Timeline Details (5 columns on large) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedShipment ? (
            <div className="bg-surface-card p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start gap-4 border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider font-mono">Live Transponder Feed</span>
                    <h4 className="text-base font-bold text-text-dark mt-0.5">{selectedShipment.vendor}</h4>
                    <p className="text-xs text-text-muted mt-1 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {selectedShipment.route}
                    </p>
                  </div>
                  <span className="bg-gray-100 text-text-muted font-mono font-bold text-[11px] px-2 py-1 rounded">
                    {selectedShipment.id}
                  </span>
                </div>

                {/* Progress Steps UI */}
                <div className="mt-6 space-y-5">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const activeIdx = getActiveStepIndex(selectedShipment.status);
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;
                    
                    return (
                      <div key={idx} className="flex gap-4 text-xs select-none">
                        {/* Step Line and circle */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCompleted ? "bg-emerald-500 text-white" :
                            isActive ? "bg-brand-primary text-white ring-4 ring-blue-50" :
                            "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          {idx < TIMELINE_STEPS.length - 1 && (
                            <div className={`w-0.5 h-10 my-1 ${
                              isCompleted ? "bg-emerald-500" : "bg-gray-100"
                            }`}></div>
                          )}
                        </div>
                        <div className="pt-0.5">
                          <p className={`font-bold ${isActive ? "text-brand-primary text-[13px]" : "text-text-dark"}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 border-t border-gray-50 pt-4 flex justify-between items-center text-xs">
                <span className="text-text-muted font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-brand-primary" /> Est: {selectedShipment.estDelivery}
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Secure Carrier cargo
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-surface-card rounded-xl border border-gray-100 p-8 text-center text-text-muted soft-shadow flex flex-col items-center justify-center space-y-3 h-full">
              <Package className="w-12 h-12 text-gray-300" />
              <p className="font-bold text-sm">No shipment selected</p>
              <p className="text-xs">Click any cargo ledger row on the left to inspect satellites tracking feed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Shipment Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
            <div className="bg-brand-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                <h3 className="font-bold text-sm">Log Inbound Satellite Cargo</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateShipment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Supplier / Vendor Enterprise</label>
                <input 
                  type="text" 
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="E.g., Munich Sensor Laboratories"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Carrier Routing Waypoint Path</label>
                <input 
                  type="text" 
                  required
                  value={routePath}
                  onChange={(e) => setRoutePath(e.target.value)}
                  placeholder="E.g., Hamburg Port -> Newark Depot -> Zone D"
                  className="w-full border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-soft">Target Warehouse Unload Date</label>
                <input 
                  type="date" 
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border border-border-subtle rounded-lg px-2 py-2 text-xs text-text-dark focus:ring-2 focus:ring-brand-primary outline-none"
                />
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
                  Confirm Shipment Logging
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
