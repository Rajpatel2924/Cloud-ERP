import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Package, 
  RefreshCw, 
  CheckCircle, 
  Layers, 
  ArrowRight,
  TrendingUp,
  X
} from "lucide-react";
import { ERPState, InventoryItem } from "../types";

interface InventoryViewProps {
  erpState: ERPState;
  setErpState: React.Dispatch<React.SetStateAction<ERPState>>;
  onShowNotification: (title: string, msg: string, type: "success" | "info" | "warning") => void;
}

export default function InventoryView({ erpState, setErpState, onShowNotification }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Filter items
  const filteredItems = erpState.inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Unique categories for filter
  const categories = ["All", ...Array.from(new Set(erpState.inventory.map(i => i.category)))];

  // Adjust stock
  const handleAdjustStock = (itemId: string, amount: number) => {
    setErpState((prev) => {
      const updatedInventory = prev.inventory.map((item) => {
        if (item.id === itemId) {
          const newUnits = Math.max(0, item.units + amount);
          
          // Reactive status adjustment
          let newStatus = item.status;
          if (newUnits === 0) {
            newStatus = "Outbound";
          } else if (newUnits < 500) {
            newStatus = "Low Stock";
          } else {
            newStatus = "In Production";
          }

          return {
            ...item,
            units: newUnits,
            status: newStatus as any,
            lastUpdated: "Just now"
          };
        }
        return item;
      });

      return {
        ...prev,
        inventory: updatedInventory
      };
    });

    onShowNotification("Inventory Adjusted", `Adjusted quantity for ${itemId} by ${amount > 0 ? "+" : ""}${amount} units.`, "success");
  };

  // Reorder process
  const handleAutomateReorder = (item: InventoryItem) => {
    // Add stock, trigger activity, notify
    setErpState((prev) => {
      const updatedInventory = prev.inventory.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            units: i.units + 5000,
            status: "In Production" as const,
            lastUpdated: "Just now"
          };
        }
        return i;
      });

      return {
        ...prev,
        inventory: updatedInventory,
        activities: [
          {
            id: `ACT-${Date.now()}`,
            type: "shipment",
            title: `Procured 5,000 units of ${item.name}`,
            description: `Automated reorder triggered due to Low Stock. Delivered to Zone B.`,
            time: "Just now"
          },
          ...prev.activities
        ]
      };
    });

    onShowNotification("Reorder Automated", `Ordered 5,000 extra units of ${item.name} immediately.`, "success");
  };

  // Identify low stock items
  const lowStockItems = erpState.inventory.filter((i) => i.units < 500);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="border-b border-gray-100 py-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-dark">Inventory & Stockpile</h2>
          <p className="text-sm text-text-muted mt-1">Real-time raw material registries, zone distributions, and automatic replenishment pipelines.</p>
        </div>
        <button 
          onClick={() => {
            // Trigger generic reorder for all low stock items
            if (lowStockItems.length === 0) {
              onShowNotification("Stockpile Normal", "All raw materials are currently within safe limits.", "info");
              return;
            }
            lowStockItems.forEach(item => handleAutomateReorder(item));
          }}
          className="bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-150 shadow-md self-start shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Replenish All Low Stock</span>
        </button>
      </div>

      {/* Low Stock Alerts Panel */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200/60 text-warning-text flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">Critical Inventory Advisory ({lowStockItems.length} Warnings)</p>
              <p className="text-xs text-warning-text/90 mt-1">
                The following raw materials are under the company safety margin of 500 units. Factory pipelines might halt if not replenished.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockItems.map(item => (
                  <span key={item.id} className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-amber-200/50 text-amber-800 flex items-center gap-1.5 shadow-sm">
                    {item.name}: <span className="font-extrabold text-red-600">{item.units} units</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              lowStockItems.forEach(item => handleAutomateReorder(item));
            }}
            className="bg-[#943700] hover:bg-[#7a2e00] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 shadow transition-colors"
          >
            <span>Automate All Reorders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-surface-card p-5 rounded-xl border border-gray-100 soft-shadow flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          <input 
            type="text" 
            placeholder="Search raw stockpile by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 hover:bg-white text-xs text-text-dark border border-border-subtle rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              className="absolute right-3 top-3 text-text-muted hover:text-text-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Selector */}
        <div className="w-full md:w-56 flex items-center gap-2 bg-gray-50/30 p-2 border border-border-subtle rounded-lg">
          <Layers className="w-4 h-4 text-text-muted ml-1" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-text-soft font-semibold focus:ring-0 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c} Category</option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="w-full md:w-56 flex items-center gap-2 bg-gray-50/30 p-2 border border-border-subtle rounded-lg">
          <Filter className="w-4 h-4 text-text-muted ml-1" />
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-text-soft font-semibold focus:ring-0 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="In Production">In Production</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Outbound">Outbound</option>
          </select>
        </div>
      </div>

      {/* Main Stockpile Table */}
      <div className="bg-surface-card rounded-xl border border-gray-100 soft-shadow overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/10 flex justify-between items-center">
          <div>
            <h4 className="text-base font-bold text-text-dark">Warehouse Inventory Registries</h4>
            <p className="text-xs text-text-muted">Currently displaying {filteredItems.length} of {erpState.inventory.length} audited items</p>
          </div>
          <span className="bg-blue-50 text-brand-primary text-xs font-bold px-3 py-1 rounded-md">
            Total Inventory: {erpState.inventory.reduce((acc, i) => acc + i.units, 0).toLocaleString()} Units
          </span>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center space-y-2">
            <Package className="w-12 h-12 text-gray-300" />
            <p className="font-bold text-sm">No inventory items matched your search filters.</p>
            <p className="text-xs">Try clearing search phrases or adjusting selectors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-text-muted font-bold bg-gray-50/40">
                  <th className="p-4">SKU / Item ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Warehouse Zone</th>
                  <th className="p-4 text-right">Stock Quantity</th>
                  <th className="p-4 text-center">Velocity State</th>
                  <th className="p-4 text-center">Adjust Stock Levels</th>
                  <th className="p-4">Last Audited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-text-muted">{item.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-text-dark">{item.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Secure Industrial Asset</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-text-soft font-semibold px-2 py-0.5 rounded text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-text-soft font-semibold">{item.zone}</td>
                    <td className="p-4 text-right font-mono font-extrabold text-text-dark text-sm">
                      {item.units.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        item.status === "In Production" ? "bg-blue-50 text-brand-primary" :
                        item.status === "Low Stock" ? "bg-amber-50 text-[#943700]" :
                        "bg-gray-100 text-text-soft"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => handleAdjustStock(item.id, -100)}
                          className="p-1 text-text-muted hover:text-brand-primary hover:bg-white rounded transition-colors cursor-pointer"
                          title="Decrease 100 units"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 font-mono font-bold text-[11px] text-text-dark">100</span>
                        <button 
                          onClick={() => handleAdjustStock(item.id, 100)}
                          className="p-1 text-text-muted hover:text-brand-primary hover:bg-white rounded transition-colors cursor-pointer"
                          title="Increase 100 units"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-text-muted font-semibold">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
