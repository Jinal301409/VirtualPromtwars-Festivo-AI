import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import {
  Sparkles,
  Palette,
  UtensilsCrossed,
  GlassWater,
  Music,
  Lightbulb,
  ShieldAlert,
  Copy,
  Check,
  Building,
  Flower2,
} from 'lucide-react';

interface CreativeConceptViewProps {
  event: EventPlan;
}

export const CreativeConceptView: React.FC<CreativeConceptViewProps> = ({ event }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const {
    conceptAndTheme,
    decorationAndColorPalette,
    venueAndCatering,
    activitiesAndEntertainment,
    moneySavingIdeas,
    risksAndPracticalTips,
  } = event;

  return (
    <div className="space-y-8">
      
      {/* 1. Concept & Theme Hero */}
      <div className="bg-white rounded-2xl border border-[#2A1625]/10 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E05A47]">
          <Sparkles className="w-4 h-4" />
          <span>Curated Creative Direction</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1625]">
          {conceptAndTheme?.title || 'Celebration Creative Blueprint'}
        </h2>

        <p className="font-serif italic text-base sm:text-lg text-[#2A1625]/80 border-l-2 border-[#E05A47] pl-4">
          "{conceptAndTheme?.tagline || 'A distinctive celebration crafted with distinction'}"
        </p>

        <p className="text-sm text-[#2A1625]/80 leading-relaxed max-w-4xl">
          {conceptAndTheme?.description}
        </p>

        <div className="inline-flex items-center gap-2 pt-2 text-xs text-[#2A1625]/70">
          <span className="font-semibold text-[#2A1625]">Aesthetic Vibe:</span>
          <span>{conceptAndTheme?.aestheticVibe}</span>
        </div>
      </div>

      {/* 2. Color Palette & Decor Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Color Swatches */}
        <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
            <Palette className="w-4 h-4 text-[#E05A47]" />
            <span>Harmonized Color Palette</span>
          </div>

          <p className="text-xs text-[#2A1625]/60">
            Click any swatch to copy the exact HEX color code for your stationers, florists, and dressmakers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {decorationAndColorPalette?.primaryColors?.map((color, idx) => (
              <div
                key={idx}
                onClick={() => copyToClipboard(color.hex)}
                className="p-3 rounded-xl border border-[#2A1625]/10 hover:border-[#E05A47]/40 bg-[#FAF7F2] cursor-pointer transition-all group flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-lg shadow-sm shrink-0 border border-black/10 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#2A1625] truncate">{color.name}</p>
                    {copiedHex === color.hex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#2A1625]/30 group-hover:text-[#2A1625]/60" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[#2A1625]/60 mt-0.5">{color.hex}</p>
                  <p className="text-[11px] text-[#2A1625]/75 line-clamp-1 mt-0.5">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#2A1625]/10 text-xs text-[#2A1625]/80">
            <span className="font-semibold text-[#2A1625]">Lighting Design: </span>
            <span>{decorationAndColorPalette?.lightingStyle}</span>
          </div>
        </div>

        {/* Decor & Florals */}
        <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
            <Flower2 className="w-4 h-4 text-[#E05A47]" />
            <span>Decor & Botanical Specifications</span>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-[#2A1625]/70 uppercase tracking-wider mb-2">
                Curated Decor Elements:
              </h4>
              <ul className="space-y-1.5 text-xs text-[#2A1625]/80 list-disc list-inside">
                {decorationAndColorPalette?.decorElements?.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#2A1625]/10">
              <h4 className="text-xs font-semibold text-[#2A1625]/70 uppercase tracking-wider mb-2">
                Recommended Florals & Botanicals:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {decorationAndColorPalette?.flowerSuggestions?.map((flower, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs bg-[#FAF7F2] text-[#2A1625] border border-[#2A1625]/10 rounded-md"
                  >
                    {flower}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Venue & Catering Architecture */}
      <div className="bg-white rounded-2xl border border-[#2A1625]/10 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2A1625]">
          <Building className="w-4 h-4 text-[#E05A47]" />
          <span>Venue & Gastronomic Blueprint</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#2A1625]">
              Space & Layout Architecture
            </h4>
            <div className="text-xs text-[#2A1625]/80 space-y-2">
              <p>
                <span className="font-semibold text-[#2A1625]">Optimal Venue Types: </span>
                {venueAndCatering?.venueTypes?.join(' · ')}
              </p>
              <p>
                <span className="font-semibold text-[#2A1625]">Seating Arrangement: </span>
                {venueAndCatering?.seatingLayout}
              </p>
              <p>
                <span className="font-semibold text-[#2A1625]">Service Format: </span>
                {venueAndCatering?.cateringStyle}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#2A1625]">
              Signature Menu & Beverage Pairings
            </h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-[#2A1625] block mb-1">Highlighted Dishes:</span>
                <ul className="space-y-1 text-[#2A1625]/80 list-disc list-inside">
                  {venueAndCatering?.signatureDishes?.map((dish, idx) => (
                    <li key={idx}>{dish}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-[#2A1625] block mb-1">Curated Beverages:</span>
                <ul className="space-y-1 text-[#2A1625]/80 list-disc list-inside">
                  {venueAndCatering?.beverageIdeas?.map((drink, idx) => (
                    <li key={idx}>{drink}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Activities & Entertainment Schedule */}
      <div className="bg-white rounded-2xl border border-[#2A1625]/10 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2A1625]">
          <Music className="w-4 h-4 text-[#E05A47]" />
          <span>Interactive Activities & Entertainment Lineup</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {activitiesAndEntertainment?.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-xl border border-[#2A1625]/10 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono font-medium text-[#E05A47] block mb-1">
                  {act.timeSlot}
                </span>
                <h4 className="font-serif text-base font-bold text-[#2A1625] mb-2">
                  {act.title}
                </h4>
                <p className="text-xs text-[#2A1625]/75 leading-relaxed">
                  {act.description}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-[#2A1625]/10 text-[11px] text-[#2A1625]/60">
                Audience: {act.targetAudience}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Money-Saving Ideas & Practical Contingencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Money Saving Ideas */}
        <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-[#E05A47]" />
            <span>Financial Optimization & Smart Savings</span>
          </div>

          <div className="space-y-3">
            {moneySavingIdeas?.map((tip, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#2A1625]/10 space-y-1.5">
                <p className="text-xs font-bold text-[#2A1625]">{tip.tip}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold font-mono">
                    Savings: {tip.estimatedSavings}
                  </span>
                </div>
                <p className="text-[11px] text-[#2A1625]/70">
                  <span className="font-semibold text-[#2A1625]">Trade-off: </span>
                  {tip.tradeOff}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Contingencies & Risks */}
        <div className="bg-white rounded-xl border border-[#2A1625]/10 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2A1625] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Risk Management & Contingency Solutions</span>
          </div>

          <div className="space-y-3">
            {risksAndPracticalTips?.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
                <p className="text-xs font-bold text-amber-950">
                  Risk: {item.risk}
                </p>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  <span className="font-semibold text-emerald-800">Festivo Mitigation: </span>
                  {item.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
