import React, { useState } from 'react';
import { EventPlan, MilestoneItem } from '../types/event';
import { formatDate } from '../utils/formatters';
import {
  Calendar,
  CheckCircle2,
  Circle,
  PlusCircle,
  Clock,
  Trash2,
  Edit2,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';

interface TimelineMilestonesProps {
  event: EventPlan;
  onUpdateMilestones: (milestones: MilestoneItem[]) => void;
}

export const TimelineMilestones: React.FC<TimelineMilestonesProps> = ({
  event,
  onUpdateMilestones,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Milestone Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState(event.input.date);
  const [newCategory, setNewCategory] = useState('General');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const milestones = event.planningMilestones || [];
  const total = milestones.length;
  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Toggle milestone completion
  const handleToggle = (id: string) => {
    const updated = milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
    onUpdateMilestones(updated);
  };

  // Delete milestone
  const handleDelete = (id: string) => {
    if (confirm('Delete this milestone task?')) {
      const updated = milestones.filter((m) => m.id !== id);
      onUpdateMilestones(updated);
    }
  };

  // Add custom milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Calculate days before event
    const eventTime = new Date(event.input.date).getTime();
    const dueTime = new Date(newDueDate).getTime();
    const daysBefore = Math.max(0, Math.round((eventTime - dueTime) / (1000 * 60 * 60 * 24)));

    const newMilestone: MilestoneItem = {
      id: `m-custom-${Date.now()}`,
      milestoneTitle: newTitle.trim(),
      description: newDesc.trim() || 'Custom organizer checkpoint',
      dueDate: newDueDate,
      daysBeforeEvent: daysBefore,
      category: newCategory,
      priority: newPriority,
      completed: false,
    };

    onUpdateMilestones([...milestones, newMilestone]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  // Filtered milestones sorted by dueDate ascending
  const filteredMilestones = [...milestones]
    .filter((m) => {
      if (filterStatus === 'pending') return !m.completed;
      if (filterStatus === 'completed') return m.completed;
      return true;
    })
    .filter((m) => {
      if (filterPriority === 'all') return true;
      return m.priority.toLowerCase() === filterPriority.toLowerCase();
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#2A1625]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1625]">
            Celebration Milestone Roadmap
          </h2>
          <p className="text-xs text-[#2A1625]/60 mt-1">
            Dynamic timeline scheduled backwards from {formatDate(event.input.date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Metrics */}
      <div className="bg-white p-6 rounded-xl border border-[#2A1625]/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#2A1625]">
              Overall Execution Progress: {progressPercent}%
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#2A1625]/70">
            {completedCount} of {total} Milestones Cleared
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#E05A47] h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A1625]/10">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-white text-[#2A1625] shadow-sm'
                    : 'text-[#2A1625]/60 hover:text-[#2A1625]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#2A1625]/70">
            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1 bg-white border border-[#2A1625]/15 rounded text-xs text-[#2A1625] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Milestones Chronological Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2A1625]/15">
        {filteredMilestones.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#2A1625]/10 text-center text-sm text-[#2A1625]/60">
            No milestones match the selected filter.
          </div>
        ) : (
          filteredMilestones.map((m) => {
            const isPastDue = !m.completed && m.dueDate < todayStr;

            return (
              <div key={m.id} className="relative group">
                
                {/* Node icon */}
                <button
                  onClick={() => handleToggle(m.id)}
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    m.completed
                      ? 'bg-emerald-600 text-white'
                      : isPastDue
                      ? 'bg-red-500 text-white ring-4 ring-red-100'
                      : 'bg-white border-2 border-[#2A1625]/30 text-transparent hover:border-[#E05A47]'
                  }`}
                  aria-label={m.completed ? 'Mark pending' : 'Mark completed'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Milestone Card */}
                <div className={`p-5 rounded-xl border transition-all ${
                  m.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : isPastDue
                    ? 'bg-red-50/40 border-red-200 shadow-sm'
                    : 'bg-white border-[#2A1625]/10 shadow-sm hover:border-[#2A1625]/25'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-base font-semibold ${
                          m.completed ? 'line-through text-[#2A1625]/60' : 'text-[#2A1625]'
                        }`}>
                          {m.milestoneTitle}
                        </h4>
                        
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          m.priority === 'High'
                            ? 'bg-red-50 text-red-700'
                            : m.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.priority}
                        </span>

                        <span className="text-xs text-[#2A1625]/50 capitalize">
                          {m.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#2A1625]/75 mt-1">
                        {m.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                      <div className="text-right">
                        <p className={`text-xs font-semibold font-mono tabular-nums ${
                          isPastDue ? 'text-red-600' : 'text-[#2A1625]'
                        }`}>
                          Due: {formatDate(m.dueDate)}
                        </p>
                        <p className="text-[11px] text-[#2A1625]/50">
                          {m.daysBeforeEvent > 0
                            ? `${m.daysBeforeEvent} days before event`
                            : 'Event Day / Follow-up'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1 text-[#2A1625]/30 hover:text-red-600 rounded transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#2A1625]/15 p-6 animate-in fade-in duration-150">
            <h3 className="font-serif text-lg font-bold text-[#2A1625] mb-4">
              Add New Milestone Task
            </h3>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Bridal Mehndi Artist Trial"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Target Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Photography">Photography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Guests">Guests & RSVP</option>
                    <option value="Logistics">Logistics</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Task Scope / Action Items
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, contacts, or requirements for this checkpoint..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#2A1625]/70 hover:text-[#2A1625]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg transition-colors"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
