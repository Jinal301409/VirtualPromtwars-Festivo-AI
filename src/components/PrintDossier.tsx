import React from 'react';
import { EventPlan } from '../types/event';
import { formatINR, formatDate } from '../utils/formatters';
import { Printer, Download, Sparkles } from 'lucide-react';

interface PrintDossierProps {
  event: EventPlan;
  onPrint: () => void;
  onExportJSON: () => void;
}

export const PrintDossier: React.FC<PrintDossierProps> = ({
  event,
  onPrint,
  onExportJSON,
}) => {
  const totalBudget = event.input.budgetINR;
  const totalAllocated = event.budgetEstimates.reduce((acc, curr) => acc + curr.allocatedAmountINR, 0);
  const totalSpent = event.budgetEstimates.reduce((acc, curr) => acc + (curr.actualSpentINR || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar (hidden during print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-[#2A1625]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2A1625]">
            Master Celebration Dossier & Executive Brief
          </h2>
          <p className="text-xs text-[#2A1625]/60">
            Export a comprehensive, print-optimized document for your vendors, family elders, or committee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportJSON}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#2A1625] bg-white border border-[#2A1625]/20 hover:bg-[#FAF7F2] rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-[#E05A47]" />
            <span>Download JSON</span>
          </button>
          
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#2A1625]/10 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#2A1625]/20 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E05A47]">
                Festivo AI · Master Event Dossier
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1625]">
              {event.input.name}
            </h1>
            <p className="font-serif italic text-sm text-[#2A1625]/75 mt-1">
              {event.conceptAndTheme?.tagline}
            </p>
          </div>

          <div className="text-right text-xs text-[#2A1625]/70 space-y-1">
            <p><span className="font-semibold">Date:</span> {formatDate(event.input.date)}</p>
            <p><span className="font-semibold">Location:</span> {event.input.location}</p>
            <p><span className="font-semibold">Guests:</span> {event.input.guestCount}</p>
            <p><span className="font-semibold">Budget:</span> {formatINR(totalBudget)}</p>
          </div>
        </div>

        {/* Creative Concept & Palette */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#2A1625] border-b border-[#2A1625]/10 pb-1">
            1. Concept & Aesthetic Tone
          </h2>
          <p className="text-xs sm:text-sm text-[#2A1625]/85 leading-relaxed">
            {event.conceptAndTheme?.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {event.decorationAndColorPalette?.primaryColors?.map((c, i) => (
              <div key={i} className="p-2 border border-[#2A1625]/10 rounded bg-[#FAF7F2] text-xs">
                <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: c.hex }} />
                <p className="font-bold text-[#2A1625] truncate">{c.name}</p>
                <p className="text-[10px] font-mono text-[#2A1625]/60">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Allocations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A1625]/10 pb-1">
            <h2 className="font-serif text-lg font-bold text-[#2A1625]">
              2. Budget & Financial Ledger (INR)
            </h2>
            <div className="text-xs font-mono">
              <span className="font-bold text-[#2A1625]">Total Target: {formatINR(totalBudget)}</span>
              <span className="mx-2">·</span>
              <span>Allocated: {formatINR(totalAllocated)}</span>
              <span className="mx-2">·</span>
              <span>Spent: {formatINR(totalSpent)}</span>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2A1625]/15 text-[#2A1625]/70">
                <th className="py-2">Category</th>
                <th className="py-2 text-center">Share</th>
                <th className="py-2 text-right">Planned (INR)</th>
                <th className="py-2 text-right">Actual Spent (INR)</th>
                <th className="py-2 pl-4">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1625]/5">
              {event.budgetEstimates.map((b) => (
                <tr key={b.id}>
                  <td className="py-2 font-semibold text-[#2A1625]">{b.category}</td>
                  <td className="py-2 text-center font-mono">{b.percentage}%</td>
                  <td className="py-2 text-right font-mono font-medium">{formatINR(b.allocatedAmountINR)}</td>
                  <td className="py-2 text-right font-mono">{formatINR(b.actualSpentINR || 0)}</td>
                  <td className="py-2 pl-4 text-[#2A1625]/70 text-[11px] truncate max-w-xs">{b.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Milestone Timeline */}
        <div className="space-y-3 print-page-break">
          <h2 className="font-serif text-lg font-bold text-[#2A1625] border-b border-[#2A1625]/10 pb-1">
            3. Scheduled Milestones & Checklist
          </h2>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2A1625]/15 text-[#2A1625]/70">
                <th className="py-2 w-28">Due Date</th>
                <th className="py-2 w-20">Timing</th>
                <th className="py-2">Milestone / Action Item</th>
                <th className="py-2 w-20 text-center">Priority</th>
                <th className="py-2 w-20 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1625]/5">
              {event.planningMilestones.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 font-mono font-medium text-[#2A1625]">{formatDate(m.dueDate)}</td>
                  <td className="py-2 text-[#2A1625]/60 text-[11px]">T-{m.daysBeforeEvent}d</td>
                  <td className="py-2">
                    <p className="font-semibold text-[#2A1625]">{m.milestoneTitle}</p>
                    <p className="text-[11px] text-[#2A1625]/70">{m.description}</p>
                  </td>
                  <td className="py-2 text-center text-[11px]">{m.priority}</td>
                  <td className="py-2 text-right text-[11px] font-semibold">
                    {m.completed ? 'Completed' : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vendor Contacts */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#2A1625] border-b border-[#2A1625]/10 pb-1">
            4. Vendor Services & Directory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {event.vendorChecklist.map((v) => (
              <div key={v.id} className="p-3 border border-[#2A1625]/10 rounded bg-[#FAF7F2]/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2A1625]">{v.serviceTitle}</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100">
                    {v.status}
                  </span>
                </div>
                <p className="text-[#2A1625]/80">
                  {v.vendorName ? `${v.vendorName} (${v.contactPerson || 'Contact'})` : 'Unassigned'}
                </p>
                {v.phoneOrEmail && (
                  <p className="font-mono text-[#2A1625]/60">{v.phoneOrEmail}</p>
                )}
                <p className="font-mono text-right font-medium text-[#2A1625]">
                  Cost: {formatINR(v.finalCostINR > 0 ? v.finalCostINR : v.estimatedCostINR)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Tips & Contingencies */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#2A1625] border-b border-[#2A1625]/10 pb-1">
            5. Risk Contingency Protocols
          </h2>
          <div className="space-y-2 text-xs">
            {event.risksAndPracticalTips.map((r, i) => (
              <div key={i} className="p-2.5 bg-amber-50/60 border border-amber-200/50 rounded">
                <p className="font-bold text-amber-950">Risk: {r.risk}</p>
                <p className="text-amber-900 mt-0.5">Mitigation: {r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#2A1625]/20 text-center text-xs text-[#2A1625]/50 flex items-center justify-between">
          <span>Generated by Festivo AI · Powered by Google Gemini</span>
          <span>Confidential Event Dossier · Printed {new Date().toLocaleDateString('en-IN')}</span>
        </div>

      </div>

    </div>
  );
};
