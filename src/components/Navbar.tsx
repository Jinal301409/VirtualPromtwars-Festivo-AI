import React from 'react';
import { EventPlan } from '../types/event';
import { Sparkles, Calendar, PlusCircle, Printer, Download, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSelectEvent: (eventId: string) => void;
  onOpenCreateModal: () => void;
  onExportJSON: () => void;
  onTriggerPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  activeTab,
  onSelectTab,
  onSelectEvent,
  onOpenCreateModal,
  onExportJSON,
  onTriggerPrint,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'budget', label: 'Budget Planner' },
    { id: 'timeline', label: 'Milestones' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'creative', label: 'Concept & Menu' },
    { id: 'advisor', label: 'AI Advisor' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#2A1625]/10 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E05A47] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2A1625]">
                Festivo AI
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2A1625] text-[#FAF7F2] shadow-sm'
                      : 'text-[#2A1625]/70 hover:text-[#2A1625] hover:bg-[#2A1625]/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Event Switcher & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Event Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-[#2A1625] bg-white border border-[#2A1625]/15 rounded-lg hover:border-[#2A1625]/30 transition-all max-w-[170px] sm:max-w-[220px]"
                title={activeEvent?.input?.name}
              >
                <Calendar className="w-3.5 h-3.5 text-[#E05A47] shrink-0" />
                <span className="truncate">{activeEvent?.input?.name || 'Select Event'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#2A1625]/50 shrink-0 ml-auto" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#2A1625]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2A1625]/50 border-b border-[#2A1625]/10">
                    Switch Celebration
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onSelectEvent(evt.id);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-[#FAF7F2] flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="truncate">
                          <p className="font-medium text-[#2A1625] truncate">{evt.input.name}</p>
                          <p className="text-xs text-[#2A1625]/60">{evt.input.location} · {evt.input.date}</p>
                        </div>
                        {evt.id === activeEvent?.id && (
                          <Check className="w-4 h-4 text-[#E05A47] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#2A1625]/10 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCreateModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#E05A47] hover:bg-[#E05A47]/10 rounded-lg transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Plan New Event with Gemini
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Export / Print Tools */}
            <div className="hidden sm:flex items-center gap-1 border-l border-[#2A1625]/10 pl-2">
              <button
                onClick={onTriggerPrint}
                className="p-2 text-[#2A1625]/70 hover:text-[#2A1625] hover:bg-white rounded-lg transition-colors"
                title="Print Event Dossier / PDF"
                aria-label="Print Event Dossier"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onExportJSON}
                className="p-2 text-[#2A1625]/70 hover:text-[#2A1625] hover:bg-white rounded-lg transition-colors"
                title="Export JSON Blueprint"
                aria-label="Export JSON Blueprint"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action Button: New Event */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan with AI</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#2A1625]/10 scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#2A1625] text-[#FAF7F2]'
                    : 'text-[#2A1625]/70 hover:bg-[#2A1625]/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
