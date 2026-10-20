import React, { useState } from 'react';
import { EventPlan, BudgetItem } from '../types/event';
import { formatINR } from '../utils/formatters';
import {
  Wallet,
  AlertTriangle,
  PlusCircle,
  Trash2,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Check,
  Percent,
} from 'lucide-react';

interface BudgetPlannerProps {
  event: EventPlan;
  onUpdateBudget: (newBudgetEstimates: BudgetItem[]) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  event,
  onUpdateBudget,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAllocated, setNewCategoryAllocated] = useState(50000);
  const [newCategoryRationale, setNewCategoryRationale] = useState('');

  const totalBudget = event.input.budgetINR;
  const items = event.budgetEstimates;

  const totalAllocated = items.reduce((sum, item) => sum + (Number(item.allocatedAmountINR) || 0), 0);
  const totalSpent = items.reduce((sum, item) => sum + (Number(item.actualSpentINR) || 0), 0);
  
  const remainingAllocated = totalBudget - totalAllocated;
  const isAllocatedOverbudget = remainingAllocated < 0;

  const remainingRealCash = totalBudget - totalSpent;
  const isSpentOverbudget = remainingRealCash < 0;

  // Category color palette for visual chart
  const categoryColors = [
    '#E05A47', // Coral
    '#2A1625', // Dark Plum
    '#D97706', // Amber Ochre
    '#059669', // Emerald
    '#2563EB', // Royal Blue
    '#9333EA', // Purple
    '#DB2777', // Rose Pink
    '#4B5563', // Slate
  ];

  const handleUpdateItem = (id: string, updates: Partial<BudgetItem>) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const nextItem = { ...item, ...updates };
        // Recalculate percentage based on total budget
        if (updates.allocatedAmountINR !== undefined && totalBudget > 0) {
          nextItem.percentage = Math.round((Number(updates.allocatedAmountINR) / totalBudget) * 100);
        }
        return nextItem;
      }
      return item;
    });
    onUpdateBudget(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this budget line item?')) {
      const filtered = items.filter((item) => item.id !== id);
      onUpdateBudget(filtered);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newItem: BudgetItem = {
      id: `b-custom-${Date.now()}`,
      category: newCategoryName.trim(),
      percentage: totalBudget > 0 ? Math.round((newCategoryAllocated / totalBudget) * 100) : 5,
      allocatedAmountINR: Number(newCategoryAllocated),
      actualSpentINR: 0,
      rationale: newCategoryRationale.trim() || 'Custom organizer allocation',
    };

    onUpdateBudget([...items, newItem]);
    setNewCategoryName('');
    setNewCategoryAllocated(50000);
    setNewCategoryRationale('');
    setNewCategoryModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#2A1625]/10 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1625]">
            INR Budget Blueprint & Cash Flow
          </h2>
          <p className="text-xs text-[#2A1625]/60 mt-1">
            Total target for {event.input.name}: <span className="font-bold text-[#2A1625] font-mono">{formatINR(totalBudget)}</span> ({formatINR(totalBudget, true)})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewCategoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Custom Category</span>
          </button>
        </div>
      </div>

      {/* Overspending Alert Banners */}
      {isAllocatedOverbudget && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-red-800">
            <span className="font-bold">Over-Allocation Warning: </span>
            Your planned category allocations total{' '}
            <span className="font-mono font-bold">{formatINR(totalAllocated)}</span>, which exceeds your total budget of{' '}
            <span className="font-mono">{formatINR(totalBudget)}</span> by{' '}
            <span className="font-mono font-bold">{formatINR(Math.abs(remainingAllocated))}</span>. Adjust category amounts below to balance the plan.
          </div>
        </div>
      )}

      {isSpentOverbudget && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <span className="font-bold">Actual Expenses Exceeded: </span>
            Actual paid/committed expenses ({formatINR(totalSpent)}) have surpassed your target limit by{' '}
            <span className="font-mono font-bold">{formatINR(Math.abs(remainingRealCash))}</span>.
          </div>
        </div>
      )}

      {/* Financial Snapshot KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm">
          <span className="text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            Total Allocated
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1625] font-mono tabular-nums mt-2">
            {formatINR(totalAllocated)}
          </div>
          <p className="text-xs text-[#2A1625]/60 mt-1 font-mono">
            {totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(1) : 0}% of target budget
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm">
          <span className="text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            Actual Spent / Committed
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1625] font-mono tabular-nums mt-2">
            {formatINR(totalSpent)}
          </div>
          <p className="text-xs text-[#2A1625]/60 mt-1 font-mono">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% disbursed
          </p>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm ${
          isAllocatedOverbudget ? 'bg-red-50/70 border-red-200' : 'bg-white border-[#2A1625]/10'
        }`}>
          <span className={`text-xs font-semibold uppercase tracking-wider ${
            isAllocatedOverbudget ? 'text-red-700' : 'text-[#2A1625]/60'
          }`}>
            {isAllocatedOverbudget ? 'Deficit' : 'Unallocated Contingency'}
          </span>
          <div className={`font-serif text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-2 ${
            isAllocatedOverbudget ? 'text-red-600' : 'text-emerald-700'
          }`}>
            {formatINR(Math.abs(remainingAllocated))}
          </div>
          <p className={`text-xs mt-1 ${isAllocatedOverbudget ? 'text-red-700' : 'text-[#2A1625]/60'}`}>
            {isAllocatedOverbudget ? 'Exceeds budget cap' : 'Available for unexpected expenses'}
          </p>
        </div>
      </div>

      {/* Visual Proportional Category Breakdown Bar */}
      <div className="bg-white p-6 rounded-xl border border-[#2A1625]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#2A1625]">
            Proportional Allocation Chart
          </h3>
          <span className="text-xs text-[#2A1625]/60">
            {items.length} Cost Pillars
          </span>
        </div>

        {/* Multi-segment stacked bar */}
        <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
          {items.map((item, idx) => {
            const widthPct = totalAllocated > 0 ? (item.allocatedAmountINR / totalAllocated) * 100 : 0;
            if (widthPct <= 0) return null;
            return (
              <div
                key={item.id}
                className="h-full transition-all duration-300 relative group cursor-pointer"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: categoryColors[idx % categoryColors.length],
                }}
                title={`${item.category}: ${formatINR(item.allocatedAmountINR)} (${widthPct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-1.5 text-xs text-[#2A1625]/80">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}
              />
              <span className="font-medium truncate max-w-[150px]">{item.category}</span>
              <span className="text-[#2A1625]/50 font-mono">({formatINR(item.allocatedAmountINR, true)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Category Table */}
      <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A1625]/10 flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#2A1625]">
            Category Ledger & Editable Allotments
          </h3>
          <span className="text-xs text-[#2A1625]/50">
            Click any amount to modify allocations in real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#2A1625]/10 text-[#2A1625]/70 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Category & Scope</th>
                <th className="py-3 px-4 font-semibold text-center w-20">Share %</th>
                <th className="py-3 px-4 font-semibold text-right w-44">Allocated (INR)</th>
                <th className="py-3 px-4 font-semibold text-right w-44">Actual Spent (INR)</th>
                <th className="py-3 px-4 font-semibold text-right w-36">Variance</th>
                <th className="py-3 px-4 font-semibold text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1625]/5">
              {items.map((item, idx) => {
                const variance = item.allocatedAmountINR - (item.actualSpentINR || 0);
                const isOver = variance < 0;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}
                        />
                        <p className="font-semibold text-[#2A1625]">{item.category}</p>
                      </div>
                      <p className="text-xs text-[#2A1625]/60 mt-0.5 line-clamp-1 pl-4.5">
                        {item.rationale}
                      </p>
                    </td>

                    {/* Percentage */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-xs text-[#2A1625]/80">
                      {item.percentage}%
                    </td>

                    {/* Allocated Amount (Editable) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[#2A1625]/40 text-xs">₹</span>
                        <input
                          type="number"
                          step="1000"
                          value={item.allocatedAmountINR}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              allocatedAmountINR: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-32 px-2 py-1 text-right text-xs sm:text-sm font-semibold font-mono tabular-nums text-[#2A1625] bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-[#2A1625]/20 focus:border-[#E05A47] rounded transition-all focus:outline-none"
                        />
                      </div>
                    </td>

                    {/* Actual Spent Amount (Editable) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[#2A1625]/40 text-xs">₹</span>
                        <input
                          type="number"
                          step="1000"
                          value={item.actualSpentINR || 0}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              actualSpentINR: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-32 px-2 py-1 text-right text-xs sm:text-sm font-semibold font-mono tabular-nums text-[#2A1625] bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-[#2A1625]/20 focus:border-[#E05A47] rounded transition-all focus:outline-none"
                        />
                      </div>
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-xs sm:text-sm">
                      <span className={isOver ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                        {isOver ? `-${formatINR(Math.abs(variance))}` : `+${formatINR(variance)}`}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-[#2A1625]/40 hover:text-red-600 rounded transition-colors"
                        title="Delete line item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-[#FAF7F2] font-semibold border-t-2 border-[#2A1625]/15">
              <tr>
                <td className="py-3 px-4 text-[#2A1625]">Total Categorized</td>
                <td className="py-3 px-4 text-center font-mono">100%</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-base text-[#2A1625]">
                  {formatINR(totalAllocated)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-base text-[#2A1625]">
                  {formatINR(totalSpent)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-sm">
                  <span className={remainingAllocated < 0 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                    {remainingAllocated < 0
                      ? `-${formatINR(Math.abs(remainingAllocated))}`
                      : `+${formatINR(remainingAllocated)}`}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: Add Custom Category */}
      {newCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#2A1625]/15 p-6 animate-in fade-in duration-150">
            <h3 className="font-serif text-lg font-bold text-[#2A1625] mb-4">
              Add Custom Budget Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Stationery & Wax Seals"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Allocated Amount (INR) *
                </label>
                <input
                  type="number"
                  required
                  step="5000"
                  min="0"
                  value={newCategoryAllocated}
                  onChange={(e) => setNewCategoryAllocated(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Notes & Inclusions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Calligraphy artist, luxury cotton rag paper, postage"
                  value={newCategoryRationale}
                  onChange={(e) => setNewCategoryRationale(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewCategoryModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#2A1625]/70 hover:text-[#2A1625]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg transition-colors"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
