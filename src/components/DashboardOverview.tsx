import React from 'react';
import { EventPlan } from '../types/event';
import { formatINR, formatDate, getCountdown } from '../utils/formatters';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Lightbulb,
} from 'lucide-react';

interface DashboardOverviewProps {
  event: EventPlan;
  onNavigateTab: (tab: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  event,
  onNavigateTab,
  onToggleMilestone,
}) => {
  const countdown = getCountdown(event.input.date);

  // Financial calculations
  const totalBudget = event.input.budgetINR;
  const totalAllocated = event.budgetEstimates.reduce((acc, curr) => acc + curr.allocatedAmountINR, 0);
  const totalSpent = event.budgetEstimates.reduce((acc, curr) => acc + (curr.actualSpentINR || 0), 0);
  const remainingBudget = totalBudget - (totalSpent > 0 ? totalSpent : totalAllocated);
  const isOverbudget = remainingBudget < 0;

  // Milestone statistics
  const totalMilestones = event.planningMilestones.length;
  const completedMilestones = event.planningMilestones.filter((m) => m.completed).length;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const upcomingMilestones = event.planningMilestones.filter((m) => !m.completed).slice(0, 3);

  // Vendor statistics
  const totalVendors = event.vendorChecklist.length;
  const bookedVendors = event.vendorChecklist.filter((v) => v.status === 'Booked' || v.status === 'Completed').length;
  const vendorProgress = totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 100) : 0;

  // Determine hero image based on event type
  let heroImage = '/src/assets/images/festivo_hero_celebration_1792499857862.jpg';
  if (event.input.type === 'wedding') {
    heroImage = '/src/assets/images/festivo_wedding_mandap_1792499858667.jpg';
  } else if (event.input.type === 'birthday') {
    heroImage = '/src/assets/images/festivo_birthday_soiree_1792499859496.jpg';
  }

  return (
    <div className="space-y-6">
      
      {/* Hero Banner with Measured Scrim and Event Info */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#2A1625]/10 min-h-[220px] sm:min-h-[260px] flex items-end">
        <img
          src={heroImage}
          alt={event.input.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1625]/95 via-[#2A1625]/60 to-transparent" />
        
        <div className="relative z-10 p-5 sm:p-8 text-white w-full">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/80 mb-2">
            <span className="capitalize">{event.input.type}</span>
            <span aria-hidden="true">·</span>
            <span>{event.input.location}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(event.input.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{event.input.guestCount} Guests</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 text-balance">
            {event.input.name}
          </h1>

          <p className="text-xs sm:text-sm text-white/90 max-w-3xl line-clamp-2">
            {event.conceptAndTheme?.tagline || event.conceptAndTheme?.description}
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Countdown */}
        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            <span>Countdown</span>
            <Clock className="w-4 h-4 text-[#E05A47]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#2A1625] font-mono tabular-nums">
              {countdown.days} <span className="text-base font-normal font-sans text-[#2A1625]/70">days</span>
            </div>
            <p className="text-xs text-[#2A1625]/60 mt-1">
              {countdown.statusText}
            </p>
          </div>
          <div className="text-xs text-[#2A1625]/70 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2A1625]/40" />
            <span>Target: {formatDate(event.input.date)}</span>
          </div>
        </div>

        {/* Card 2: Total Budget */}
        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            <span>Total Budget</span>
            <Wallet className="w-4 h-4 text-[#2A1625]/60" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#2A1625] font-mono tabular-nums">
              {formatINR(totalBudget, true)}
            </div>
            <p className="text-xs text-[#2A1625]/60 mt-1 font-mono tabular-nums">
              {formatINR(totalBudget)}
            </p>
          </div>
          <div className="text-xs text-[#2A1625]/70">
            {event.budgetEstimates.length} allocated categories
          </div>
        </div>

        {/* Card 3: Remaining / Overspend Status */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between transition-colors ${
          isOverbudget ? 'bg-red-50/70 border-red-200' : 'bg-white border-[#2A1625]/10'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
            <span className={isOverbudget ? 'text-red-700' : 'text-[#2A1625]/60'}>
              {isOverbudget ? 'Over Budget' : 'Remaining Buffer'}
            </span>
            {isOverbudget ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="my-3">
            <div className={`font-serif text-3xl font-bold font-mono tabular-nums ${
              isOverbudget ? 'text-red-600' : 'text-[#2A1625]'
            }`}>
              {formatINR(Math.abs(remainingBudget), true)}
            </div>
            <p className={`text-xs mt-1 ${isOverbudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {isOverbudget
                ? `Exceeding target by ${formatINR(Math.abs(remainingBudget))}`
                : `₹${Math.round(totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0)}% funds remaining`}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('budget')}
            className="text-xs font-medium text-[#E05A47] hover:underline flex items-center gap-1 text-left"
          >
            <span>Review Budget Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Roadmap Execution */}
        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            <span>Planning Progress</span>
            <CheckCircle2 className="w-4 h-4 text-[#E05A47]" />
          </div>
          <div className="my-3">
            <div className="font-serif text-3xl font-bold text-[#2A1625] font-mono tabular-nums">
              {milestoneProgress}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-[#E05A47] h-full transition-all duration-500"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-[#2A1625]/70 flex items-center justify-between">
            <span>{completedMilestones} of {totalMilestones} milestones</span>
            <span className="font-mono">{bookedVendors}/{totalVendors} vendors</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Actions & Concept Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Immediate Milestones & Vendor Health */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Milestone Tasks */}
          <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2A1625]">
                  Immediate Milestone Tasks
                </h3>
                <p className="text-xs text-[#2A1625]/60">
                  Priority checkpoints calculated relative to your celebration date
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-1"
              >
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="p-6 text-center text-[#2A1625]/60 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-[#2A1625]">All scheduled milestones completed!</p>
                <p className="text-xs mt-1">Add new custom milestones in the Timeline tab.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2A1625]/5">
                {upcomingMilestones.map((m) => (
                  <div key={m.id} className="py-3 flex items-start gap-3 group">
                    <button
                      onClick={() => onToggleMilestone(m.id)}
                      className="mt-0.5 w-5 h-5 rounded border border-[#2A1625]/30 flex items-center justify-center text-transparent hover:border-[#E05A47] hover:text-[#E05A47] transition-colors shrink-0"
                      aria-label={`Mark ${m.milestoneTitle} as completed`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#2A1625] truncate">
                          {m.milestoneTitle}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          m.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.priority}
                        </span>
                      </div>
                      <p className="text-xs text-[#2A1625]/70 line-clamp-1 mt-0.5">
                        {m.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#2A1625]/50 mt-1">
                        <span>Due: {formatDate(m.dueDate)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{m.daysBeforeEvent} days before event</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{m.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Money-Saving Recommendation */}
          {event.moneySavingIdeas && event.moneySavingIdeas.length > 0 && (
            <div className="bg-[#FAF7F2] rounded-xl border border-[#2A1625]/10 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E05A47] uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4" />
                <span>AI Financial Optimization Tip</span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#2A1625]">
                {event.moneySavingIdeas[0].tip}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-[#2A1625]/10">
                  <span className="font-semibold text-emerald-700">Estimated Savings: </span>
                  <span className="text-[#2A1625] font-mono">{event.moneySavingIdeas[0].estimatedSavings}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#2A1625]/10">
                  <span className="font-semibold text-[#2A1625]/70">Strategic Trade-off: </span>
                  <span className="text-[#2A1625]">{event.moneySavingIdeas[0].tradeOff}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Theme Palette & Quick Actions */}
        <div className="space-y-6">
          
          {/* Aesthetic Palette Box */}
          <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-[#2A1625]">
                Design & Color Palette
              </h3>
              <button
                onClick={() => onNavigateTab('creative')}
                className="text-xs font-semibold text-[#E05A47] hover:underline"
              >
                Details
              </button>
            </div>

            <p className="text-xs text-[#2A1625]/70 mb-4">
              {event.conceptAndTheme?.aestheticVibe || 'Curated festive tone'}
            </p>

            {/* Color Swatches */}
            <div className="space-y-2.5">
              {event.decorationAndColorPalette?.primaryColors?.slice(0, 4).map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#2A1625] truncate">{c.name}</p>
                    <p className="text-[11px] text-[#2A1625]/60 truncate font-mono">{c.hex} · {c.usage}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#2A1625]/10 text-xs text-[#2A1625]/70">
              <span className="font-semibold text-[#2A1625]">Lighting Ambiance: </span>
              <span>{event.decorationAndColorPalette?.lightingStyle}</span>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6">
            <h3 className="font-serif text-base font-bold text-[#2A1625] mb-3">
              Planning Workspaces
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('budget')}
                className="w-full text-left p-3 rounded-lg border border-[#2A1625]/10 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-[#2A1625]">INR Budget Matrix</p>
                  <p className="text-[11px] text-[#2A1625]/60">Recalculate allocations and real expenses</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2A1625]/40 group-hover:text-[#E05A47] transition-colors" />
              </button>

              <button
                onClick={() => onNavigateTab('vendors')}
                className="w-full text-left p-3 rounded-lg border border-[#2A1625]/10 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-[#2A1625]">Vendor Operations</p>
                  <p className="text-[11px] text-[#2A1625]/60">{bookedVendors} of {totalVendors} services contracted</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2A1625]/40 group-hover:text-[#E05A47] transition-colors" />
              </button>

              <button
                onClick={() => onNavigateTab('advisor')}
                className="w-full text-left p-3 rounded-lg border border-[#2A1625]/10 hover:border-[#E05A47]/40 hover:bg-[#FAF7F2] flex items-center justify-between transition-colors group"
              >
                <div>
                  <p className="text-xs font-semibold text-[#2A1625]">Consult Gemini AI Advisor</p>
                  <p className="text-[11px] text-[#2A1625]/60">Negotiation tactics & custom vendor queries</p>
                </div>
                <Sparkles className="w-4 h-4 text-[#E05A47]" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
