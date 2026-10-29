import React, { useState } from 'react';
import { ResidentialRentalConfig, RentalUnitRuleKey } from '../types';
import {
  ALL_RENTAL_UNIT_RULES,
  rollUnitRules,
  generateResidentialRentalConfig,
  assignRandomHeirUnit,
  getRuleCountOddsInfo,
  RULE_COUNT_PROBABILITIES
} from '../utils/rentalRules';

interface UnitRulesPanelProps {
  rentalConfig?: ResidentialRentalConfig;
  onUpdateRentalConfig: (config: ResidentialRentalConfig, notice?: string) => void;
  isLockedByRandomFun?: boolean;
}

export const UnitRulesPanel: React.FC<UnitRulesPanelProps> = ({
  rentalConfig,
  onUpdateRentalConfig,
  isLockedByRandomFun = false,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [showOddsTable, setShowOddsTable] = useState(false);

  // Fallback if rentalConfig is not yet initialized
  const config = rentalConfig || generateResidentialRentalConfig();
  const totalUnits = Math.max(1, Math.min(10, config.totalUnits || 4));
  const heirUnitNumber = Math.max(1, Math.min(totalUnits, config.heirUnitNumber || 1));

  // The Heir's unit configuration (where the owner rules are enforced)
  const heirUnitConfig = config.units[heirUnitNumber] || {
    unitNumber: heirUnitNumber,
    activeRules: []
  };

  const activeRulesCount = heirUnitConfig.activeRules.length;
  const oddsInfo = getRuleCountOddsInfo(activeRulesCount);

  // Handle Total Units Slider change (1 to 10)
  const handleTotalUnitsChange = (newTotal: number) => {
    const clampedTotal = Math.max(1, Math.min(10, newTotal));
    // If heirUnitNumber exceeds the new total units, clamp it down
    const clampedHeir = Math.min(heirUnitNumber, clampedTotal);

    const updatedUnits: Record<number, any> = {};
    for (let u = 1; u <= clampedTotal; u++) {
      if (u === clampedHeir) {
        updatedUnits[u] = config.units[u] || heirUnitConfig;
      } else {
        updatedUnits[u] = {
          unitNumber: u,
          activeRules: []
        };
      }
    }

    const updated: ResidentialRentalConfig = {
      ...config,
      totalUnits: clampedTotal,
      heirUnitNumber: clampedHeir,
      selectedUnitNumber: clampedHeir,
      units: updatedUnits
    };

    onUpdateRentalConfig(
      updated,
      `🏢 Residential Rental capacity updated to ${clampedTotal} units (Heir in Unit #${clampedHeir}).`
    );
  };

  // Dynamically assign Heir to a random unit between 1 and totalUnits
  const handleDynamicAssignHeir = () => {
    if (isLockedByRandomFun) return;
    const updated = assignRandomHeirUnit(config);
    const heirRules = updated.units[updated.heirUnitNumber]?.activeRules || [];
    onUpdateRentalConfig(
      updated,
      `🎲 Dynamically assigned Heir to Unit #${updated.heirUnitNumber} of ${totalUnits}! Landlord enforced ${heirRules.length} rules (${heirRules.join(', ') || 'No rules'}).`
    );
  };

  // Manually select which unit the Heir lives in
  const handleSelectHeirUnit = (unitNum: number) => {
    if (unitNum === heirUnitNumber) return;
    const clamped = Math.max(1, Math.min(totalUnits, unitNum));

    // Transfer or keep existing heir rules on the new heir unit
    const updatedUnits: Record<number, any> = {};
    for (let u = 1; u <= totalUnits; u++) {
      if (u === clamped) {
        // Give new heir unit the active rules (or keep if present)
        updatedUnits[u] = config.units[clamped]?.activeRules?.length
          ? config.units[clamped]
          : heirUnitConfig;
      } else {
        updatedUnits[u] = {
          unitNumber: u,
          activeRules: []
        };
      }
    }

    const updated: ResidentialRentalConfig = {
      ...config,
      heirUnitNumber: clamped,
      selectedUnitNumber: clamped,
      units: updatedUnits
    };

    onUpdateRentalConfig(
      updated,
      `👑 Heir assigned to Unit #${clamped} of ${totalUnits}. Plot landlord rules are strictly enforced here!`
    );
  };

  // Re-roll Heir's unit rules using decreasing probability
  const handleRollHeirRules = () => {
    if (isLockedByRandomFun) return;
    const rolled = rollUnitRules(heirUnitNumber, undefined, true);
    const updated: ResidentialRentalConfig = {
      ...config,
      units: {
        ...config.units,
        [heirUnitNumber]: rolled
      }
    };
    const count = rolled.activeRules.length;
    const odds = getRuleCountOddsInfo(count);
    const summary = count > 0 ? rolled.activeRules.join(', ') : 'No rules enforced (Hands-off landlord)';
    onUpdateRentalConfig(
      updated,
      `🎲 Landlord rolled ${count}/6 Rules for Heir's Unit #${heirUnitNumber} (${odds.pct} Degressive Odds • ${odds.label}): ${summary}`
    );
  };

  // Toggle a single rule active/inactive for the Heir's residence
  const handleToggleRule = (ruleName: RentalUnitRuleKey) => {
    if (isLockedByRandomFun) return;

    const currentActive = heirUnitConfig.activeRules || [];
    const isCurrentlyActive = currentActive.includes(ruleName);
    const newActive = isCurrentlyActive
      ? currentActive.filter(r => r !== ruleName)
      : [...currentActive, ruleName];

    const updatedUnit = {
      ...heirUnitConfig,
      activeRules: newActive,
      maxOccupancyLimit: newActive.includes('Maximum Occupancy') ? 4 : undefined
    };

    const updated: ResidentialRentalConfig = {
      ...config,
      units: {
        ...config.units,
        [heirUnitNumber]: updatedUnit
      }
    };

    const verb = !isCurrentlyActive ? 'enforced' : 'deactivated';
    onUpdateRentalConfig(
      updated,
      `🏢 Unit Rule "${ruleName}" ${verb} for Heir's Unit #${heirUnitNumber} (${newActive.length}/6 Rules Active)`
    );
  };

  // Render SVG icons with red cross badge matching The Sims 4: For Rent screenshot
  const renderRuleIcon = (iconType: string) => {
    switch (iconType) {
      case 'social':
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <ellipse cx="28" cy="24" rx="12" ry="15" fill="#f87171" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="40" cy="22" rx="10" ry="13" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
              <ellipse cx="22" cy="30" rx="9" ry="11" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              <path d="M14 16 Q20 12 22 22 T30 18" stroke="#a855f7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M42 34 Q46 42 50 36" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M28 39 Q32 48 30 54" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
              <path d="M40 35 Q36 46 32 54" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );

      case 'noise':
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <polygon points="12,32 32,16 52,32" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
              <rect x="18" y="32" width="28" height="22" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
              <rect x="28" y="42" width="8" height="12" fill="#0369a1" />
              <rect x="22" y="36" width="6" height="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <path d="M34 10 L28 24 L36 24 L30 36" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );

      case 'occupancy':
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <rect x="12" y="14" width="40" height="38" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
              <circle cx="24" cy="26" r="5" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
              <path d="M16 38 C16 32 32 32 32 38" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
              <circle cx="40" cy="26" r="5" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="1" />
              <path d="M32 38 C32 32 48 32 48 38" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="1" />
              <circle cx="32" cy="22" r="5.5" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
              <path d="M22 36 C22 30 42 30 42 36" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );

      case 'trash':
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <rect x="12" y="48" width="40" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
              <ellipse cx="32" cy="38" rx="16" ry="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <path d="M28 26 Q32 24 36 26 L38 20 Q32 22 26 20 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
              <circle cx="32" cy="26" r="2.5" fill="#f87171" />
              <circle cx="20" cy="22" r="1.5" fill="#0f172a" />
              <circle cx="44" cy="24" r="1.5" fill="#0f172a" />
              <path d="M18 30 Q22 28 20 24" stroke="#64748b" strokeWidth="1" fill="none" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );

      case 'pets':
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <circle cx="42" cy="28" r="10" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <polygon points="34,20 38,12 42,20" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <polygon points="44,20 48,12 52,20" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <ellipse cx="26" cy="36" rx="12" ry="11" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
              <ellipse cx="14" cy="36" rx="4" ry="7" fill="#b45309" />
              <ellipse cx="38" cy="36" rx="4" ry="7" fill="#b45309" />
              <ellipse cx="26" cy="40" rx="5" ry="3.5" fill="#fef3c7" />
              <circle cx="26" cy="38" r="2" fill="#1e293b" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );

      case 'ghosts':
      default:
        return (
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow">
              <path
                d="M32 14 C22 14 18 24 18 34 C18 46 22 48 26 44 C30 40 34 48 38 44 C42 40 46 48 46 34 C46 24 42 14 32 14 Z"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="1.8"
                opacity="0.9"
              />
              <ellipse cx="27" cy="26" rx="2" ry="3.5" fill="#1e1b4b" />
              <ellipse cx="37" cy="26" rx="2" ry="3.5" fill="#1e1b4b" />
              <ellipse cx="32" cy="34" rx="2.5" ry="3.5" fill="#1e1b4b" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
              ✕
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden text-slate-100">
      {/* 1. Header Bar: "UNIT RULES" (Matching The Sims 4: For Rent UI) */}
      <div className="bg-gradient-to-r from-[#334e68] via-[#486581] to-[#243b53] px-4 py-2.5 flex items-center justify-between border-b border-slate-600/80 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <h4 className="font-black text-sm uppercase tracking-wider text-white">
            Unit Rules (The Sims 4: For Rent)
          </h4>
          <span className="text-[10px] bg-slate-950/60 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
            Residential Rental
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOddsTable(!showOddsTable)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-500/80 shadow-sm transition-all cursor-pointer"
            title="View Decreasing Probability Odds for Landlord Rules"
          >
            <span>📊</span>
            <span>{showOddsTable ? 'Hide Odds' : 'Rule Odds'}</span>
          </button>

          <button
            onClick={() => setShowScreenshot(!showScreenshot)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-sky-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-500/80 shadow-sm transition-all cursor-pointer"
            title="Toggle TS4 in-game Unit Rules reference screenshot"
          >
            <span>📸</span>
            <span>{showScreenshot ? 'Hide Reference' : 'In-Game Reference'}</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center border border-slate-500 shadow-sm transition-all cursor-pointer"
            title="Click to view full Unit Rules instructions and challenge enforcement"
          >
            ?
          </button>
        </div>
      </div>

      {/* Decreasing Probability Odds Modal / Drawer */}
      {showOddsTable && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs animate-fadeIn space-y-2">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <span>📉</span>
              <span>Decreasing Probability (Degressive) Rule Distribution:</span>
            </span>
            <button
              onClick={() => setShowOddsTable(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Subsequent rules added are <strong>decreasingly probable</strong>. Having 1 or 2 rules is common, while strict landlords enforcing 5 or 6 rules are exceptionally rare!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-1">
            {RULE_COUNT_PROBABILITIES.map((p) => {
              const isCurrent = p.count === activeRulesCount;
              return (
                <div
                  key={p.count}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-md font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono">{p.count} Rules</div>
                  <div className={`text-base font-black ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                    {p.pct}
                  </div>
                  <div className="text-[9px] truncate leading-tight mt-0.5 opacity-80" title={p.label}>
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reference Screenshot Drawer (Toggled by 📸 button) */}
      {showScreenshot && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-sky-300 mb-2">
            <span className="flex items-center gap-1.5">
              <span>📸</span>
              <span>The Sims 4: For Rent — Official Unit Rules Screenshot:</span>
            </span>
            <button
              onClick={() => setShowScreenshot(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900/60 p-1 flex justify-center">
            <img
              src="/assets/aistudio/image_44c13091.png"
              alt="Official Unit Rules (The Sims 4: For Rent)"
              className="max-h-52 w-auto object-contain rounded shadow"
            />
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 text-center font-mono">
            6 Official In-Game Unit Rules: No Social Events • No Loud Noises • Maximum Occupancy • No Trash Overload • No Pets • No Ghosts
          </div>
        </div>
      )}

      {/* Help / Rules Explanation (Toggled by ?) */}
      {showHelp && (
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
          <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>How Residential Rental Units & Rules Work:</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            In The Sims 4: For Rent, Residential Rentals support varying numbers of units (slider from <strong>1 to 10 units</strong>). The Heir is dynamically or manually assigned to a single unit. That unit rolls the owner/landlord's enforced rules (0 to 6 rules with decreasing probability). Other neighbor units don't need rules and are discarded for the legacy challenge.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px] text-slate-400 font-mono">
            <div>• <strong className="text-slate-200">Total Units Slider:</strong> Select how many units exist on this rental property (1–10).</div>
            <div>• <strong className="text-slate-200">Dynamic Heir Unit:</strong> Heir is dynamically assigned to a unit within the lot.</div>
            <div>• <strong className="text-slate-200">Decreasing Probability:</strong> 1 rule (~35%) is common; 6 rules (~1%) is rare.</div>
            <div>• <strong className="text-slate-200">Neighbor Units:</strong> Unrolled and kept clean for challenge focus.</div>
          </div>
        </div>
      )}

      {/* 2. Interactive Capacity & Heir Assignment Section */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3.5">
        
        {/* Total Units Slider (1 to 10 Units) */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-sky-300 flex items-center gap-1.5">
              <span>🎚️</span>
              <span>Total Units on this Residential Rental Lot:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-mono bg-sky-950 px-2.5 py-0.5 rounded border border-sky-600 font-extrabold text-xs shadow-inner">
                {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'} Total
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({totalUnits <= 6 ? 'Vanilla Capacity' : 'Expanded Lot'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 font-mono shrink-0">1 Unit</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={totalUnits}
              onChange={(e) => handleTotalUnitsChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-amber-400"
            />
            <span className="text-xs font-bold text-slate-400 font-mono shrink-0">10 Units</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Slide to match the exact number of apartment / townhouse units on your plot.</span>
            <span className="text-slate-500 font-mono">1 to 10 Units</span>
          </div>
        </div>

        {/* Dynamic Heir Assignment & Unit Picker */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">👑</span>
              <span className="text-sm font-black text-white">
                Heir Resides in: <strong className="text-amber-300">Unit #{heirUnitNumber}</strong> of {totalUnits}
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                Enforced Plot Rules
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Only Unit #{heirUnitNumber} rules are enforced for the legacy challenge. Other units ({totalUnits > 1 ? `Units ${heirUnitNumber === 1 ? '2' : '1'}–${totalUnits}` : 'None'}) don't need rules.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleDynamicAssignHeir}
              disabled={isLockedByRandomFun}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs rounded-lg shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Dynamically assign Heir to a random unit and roll plot rules"
            >
              <span>🎲</span>
              <span>Randomize Heir Unit</span>
            </button>

            <button
              onClick={handleRollHeirRules}
              disabled={isLockedByRandomFun}
              className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 disabled:opacity-40 text-sky-200 hover:text-white font-bold text-xs rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
              title="Roll 0 to 6 rules for the Heir's residence using decreasing probability"
            >
              <span>🎲</span>
              <span>Roll Heir Rules</span>
            </button>
          </div>
        </div>

        {/* Unit Selector Chips (1 to TotalUnits) */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">
            Choose Heir's Unit (1 to {totalUnits}):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: totalUnits }, (_, i) => i + 1).map((uNum) => {
              const isHeir = uNum === heirUnitNumber;
              return (
                <button
                  key={uNum}
                  onClick={() => handleSelectHeirUnit(uNum)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    isHeir
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black scale-105 border border-amber-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                  title={isHeir ? `👑 Heir resides in Unit #${uNum} (Rules Enforced)` : `Click to move Heir into Unit #${uNum}`}
                >
                  {isHeir && <span>👑</span>}
                  <span>Unit #{uNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. The 6 Unit Rules Cards (Enforced on Heir's Unit) */}
      <div className="p-4 bg-slate-950/40 space-y-3">
        {/* Heir Rules Banner & Degressive Probability Odds Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Landlord Enforced Rules for Unit #{heirUnitNumber}:
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              activeRulesCount === 0
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                : activeRulesCount <= 2
                  ? 'bg-sky-950 text-sky-300 border-sky-500/50'
                  : activeRulesCount <= 4
                    ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                    : 'bg-red-950 text-red-300 border-red-500/50'
            }`}>
              {activeRulesCount} of 6 Rules Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>Roll Odds:</span>
            <span className="text-amber-300 font-bold">{oddsInfo.pct}</span>
            <span className="text-slate-500">({oddsInfo.label})</span>
          </div>
        </div>

        {/* The 6 Rule Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {ALL_RENTAL_UNIT_RULES.map((rule) => {
            const isActive = heirUnitConfig.activeRules.includes(rule.name);

            return (
              <div
                key={rule.name}
                onClick={() => handleToggleRule(rule.name)}
                className={`group relative rounded-xl p-3 flex flex-col items-center justify-between transition-all cursor-pointer text-center select-none ${
                  isActive
                    ? 'bg-gradient-to-b from-red-950/70 via-slate-900 to-slate-950 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-[1.02]'
                    : 'bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-850'
                }`}
                title={`${rule.name}: ${rule.description} Click to toggle rule on/off!`}
              >
                {/* Active Indicator Top Dot */}
                <div className="w-full flex items-center justify-between text-[9px] font-bold mb-1.5">
                  <span className="text-slate-500 font-mono">#{ALL_RENTAL_UNIT_RULES.indexOf(rule) + 1}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>

                {/* Illustrated Art with Red Cross Badge */}
                <div className="py-2 transition-transform group-hover:scale-105">
                  {renderRuleIcon(rule.iconType)}
                </div>

                {/* Rule Title */}
                <div className="mt-2 mb-2 min-h-[34px] flex items-center justify-center">
                  <span className={`text-xs font-black leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {rule.name}
                  </span>
                </div>

                {/* Status Badge: Active Rule / Inactive Rule (Styled like the screenshot) */}
                <div className="w-full pt-2 border-t border-slate-800">
                  <div
                    className={`w-full py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-800/90 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {isActive ? 'Active Rule' : 'Inactive Rule'}
                  </div>
                </div>

                {/* Status tag */}
                <div className="mt-1 text-[9px] text-slate-400 text-center leading-tight">
                  {isActive ? (
                    <span className="text-amber-300 font-semibold">⚠️ Enforced on Heir</span>
                  ) : (
                    <span className="text-slate-500">Permitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Heir Unit Rules Enforcement Summary */}
        <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>📜</span>
              <span>Heir's Unit #{heirUnitNumber} Challenge Summary:</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {activeRulesCount === 0 ? (
                <span className="text-emerald-400 font-medium">
                  🎉 Freedom! 0 rules enforced by landlord on Unit #{heirUnitNumber}. Full tenant liberty permitted on this plot!
                </span>
              ) : (
                <span>
                  Mandatory rules: <strong className="text-white">{heirUnitConfig.activeRules.join(' • ')}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 shrink-0">
            {totalUnits > 1 ? `Units 1–${totalUnits}: Other units unrolled` : 'Single unit rental'}
          </div>
        </div>
      </div>
    </div>
  );
};
