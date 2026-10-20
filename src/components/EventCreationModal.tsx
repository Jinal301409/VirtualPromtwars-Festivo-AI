import React, { useState } from 'react';
import { EventInput, EventPlan } from '../types/event';
import { formatINR } from '../utils/formatters';
import { Sparkles, X, AlertCircle, RefreshCw, CheckCircle2, Heart, Cake, Users, Award } from 'lucide-react';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: EventPlan) => void;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [formData, setFormData] = useState<EventInput>({
    name: '',
    type: 'wedding',
    date: '2026-11-20',
    location: 'Udaipur, Rajasthan',
    guestCount: 200,
    budgetINR: 1800000,
    theme: 'Lakeside Palace Heritage & Marigold Illumination',
    preferences: 'Evening lakeside pheras, live Sufi band, organic floral decor, vegetarian Rajasthani and global live counters, customized welcome favours.',
  });

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const loadingSteps = [
    'Connecting to Gemini 3.8 Flash model...',
    'Synthesizing event concept, color swatches & decor aesthetic...',
    'Allocating INR budget proportions across venue, catering & media...',
    'Calculating chronological milestone countdown roadmap...',
    'Curating service questions & vendor checklists...',
  ];

  // Quick preset autofills for hackathon testing
  const applyPreset = (type: 'wedding' | 'birthday' | 'community') => {
    if (type === 'wedding') {
      setFormData({
        name: "Rohan & Ananya's Royal Lakeside Wedding",
        type: 'wedding',
        date: '2026-12-12',
        location: 'Udaipur, Rajasthan',
        guestCount: 250,
        budgetINR: 2800000,
        theme: 'Heritage Rajputana Palace with Marigold & Rose Canopy',
        preferences: 'Lakeside banquet, live folk fusion artists, royal Rajasthani feast + woodfired pizza counter, brass lantern lighting, zero plastic policy.',
      });
    } else if (type === 'birthday') {
      setFormData({
        name: "Vikram's 40th Retro Vinyl & Cocktail Night",
        type: 'birthday',
        date: '2026-11-15',
        location: 'Bandra, Mumbai',
        guestCount: 60,
        budgetINR: 450000,
        theme: 'Vintage Speakeasy with Brass, Velvet & Jazz',
        preferences: 'Craft cocktail bar with mixologist, small-plate artisanal appetizers, live saxophonist & vinyl DJ, custom velvet guest favors.',
      });
    } else {
      setFormData({
        name: 'Vasant Vihar Spring Neighborhood Utsav',
        type: 'community',
        date: '2026-10-30',
        location: 'New Delhi',
        guestCount: 400,
        budgetINR: 650000,
        theme: 'Eco-conscious Spring Blossom & Folk Bazaar',
        preferences: 'Community park amphitheatre, 10 food kiosks, pottery & kite workshop, local youth band, biodegradable dining wares.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    setLoadingStage(0);

    // Progress animation ticker
    const interval = setInterval(() => {
      setLoadingStage((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/plan-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.plan) {
        onPlanCreated(result.plan);
        onClose();
      } else {
        throw new Error(result.error || 'Invalid plan response from server');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('Plan generation failed:', err);
      setErrorMessage(err.message || 'Failed to connect to the Gemini planning server. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 no-print animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#2A1625]/15 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-white border-b border-[#2A1625]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E05A47]/15 text-[#E05A47] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2A1625]">Create New Celebration</h2>
              <p className="text-xs text-[#2A1625]/60">Gemini AI generates full budgets, milestones, and vendor blueprints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-[#2A1625]/50 hover:text-[#2A1625] rounded-lg hover:bg-[#FAF7F2] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Preset Buttons for judges / evaluators */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#2A1625]/70 uppercase tracking-wider">
                Quick Demo Presets
              </span>
              <span className="text-xs text-[#2A1625]/50">Click to autofill sample details</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('wedding')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 text-xs font-medium bg-white hover:bg-[#E05A47]/5 border border-[#2A1625]/10 hover:border-[#E05A47]/40 rounded-lg text-[#2A1625] transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-[#E05A47]" />
                <span>Royal Wedding</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('birthday')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 text-xs font-medium bg-white hover:bg-[#E05A47]/5 border border-[#2A1625]/10 hover:border-[#E05A47]/40 rounded-lg text-[#2A1625] transition-colors"
              >
                <Cake className="w-3.5 h-3.5 text-[#E05A47]" />
                <span>40th Birthday</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('community')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 text-xs font-medium bg-white hover:bg-[#E05A47]/5 border border-[#2A1625]/10 hover:border-[#E05A47]/40 rounded-lg text-[#2A1625] transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-[#E05A47]" />
                <span>Spring Utsav</span>
              </button>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm text-red-800">
                <p className="font-semibold">Planning Assistant Encountered an Issue</p>
                <p className="mt-1">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Generating with Gemini</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation Box */}
          {loading && (
            <div className="p-6 bg-white rounded-xl border border-[#2A1625]/15 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E05A47]/10 flex items-center justify-center text-[#E05A47] animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2A1625]">
                  Festivo AI is Architecting Your Event
                </h3>
                <p className="text-xs sm:text-sm text-[#2A1625]/70 mt-1 min-h-[20px]">
                  {loadingSteps[loadingStage]}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#E05A47] h-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStage + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#2A1625]/50">
                Grounded via Gemini 3.8 Flash server-side integration
              </p>
            </div>
          )}

          {/* Form */}
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1.5">
                  Event Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['wedding', 'birthday', 'community', 'anniversary', 'festival', 'corporate'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border capitalize text-center transition-colors ${
                        formData.type === t
                          ? 'bg-[#2A1625] text-white border-[#2A1625]'
                          : 'bg-white text-[#2A1625]/80 border-[#2A1625]/15 hover:border-[#2A1625]/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya & Kabir's Sunset Sangeet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    City / Venue Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Rajasthan"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                  />
                </div>
              </div>

              {/* Guest Count & Budget INR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
                      Expected Guests *
                    </label>
                    <span className="text-xs text-[#2A1625]/60 font-mono tabular-nums">
                      {formData.guestCount} guests
                    </span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    required
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40 font-mono tabular-nums"
                  />
                  {/* Preset steppers */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[35, 75, 150, 300, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: preset })}
                        className="px-2 py-0.5 text-xs bg-white border border-[#2A1625]/15 rounded text-[#2A1625]/70 hover:text-[#2A1625] hover:border-[#2A1625]/30"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
                      Total Budget (INR) *
                    </label>
                    <span className="text-xs font-bold text-[#E05A47] font-mono tabular-nums">
                      {formatINR(formData.budgetINR, true)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={formData.budgetINR}
                    onChange={(e) => setFormData({ ...formData, budgetINR: parseInt(e.target.value, 10) || 100000 })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40 font-mono tabular-nums"
                  />
                  {/* Quick budget presets */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[
                      { label: '₹2.5L', val: 250000 },
                      { label: '₹8L', val: 800000 },
                      { label: '₹18L', val: 1800000 },
                      { label: '₹35L', val: 3500000 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, budgetINR: preset.val })}
                        className="px-2 py-0.5 text-xs bg-white border border-[#2A1625]/15 rounded text-[#2A1625]/70 hover:text-[#2A1625] hover:border-[#2A1625]/30 font-mono"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme & Style */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Desired Aesthetic / Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Rajputana Heritage with Marigold Bloom & Candlelight"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              {/* Preferences & Special Requirements */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Preferences & Special Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Food preferences (vegetarian, live chaat stalls, regional specialties), music and entertainment vibe, outdoor vs indoor, special rituals, sustainability goals..."
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#2A1625]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#2A1625]/70 hover:text-[#2A1625] bg-white border border-[#2A1625]/15 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-md transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Blueprint with Gemini</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
