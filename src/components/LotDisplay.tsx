import React, { useState } from 'react';
import { Lot, DwellingType, TinyHomeTier, ResidentialRentalConfig } from '../types';
import { lotTraitDescriptions, lotChallengeDescriptions, db } from '../data/simData';
import { isApartmentApplicable, isPenthouseApplicable } from '../utils/generator';
import { UnitRulesPanel } from './UnitRulesPanel';

interface LotDisplayProps {
  lot: Lot;
  onRerollLot?: () => void;
  onRerollDwelling?: () => void;
  onUpdateDwellingType?: (type: DwellingType) => void;
  onUpdateTinyTier?: (tier: TinyHomeTier) => void;
  onUpdateSubNeighborhood?: (neighborhood: string) => void;
  onUpdateWorld?: (world: string) => void;
  onUpdateRentalConfig?: (config: ResidentialRentalConfig, notice?: string) => void;
  // Lot Traits Reroll Controls
  onRerollAllTraits?: () => void;
  onRerollSingleTrait?: (index: number) => void;
  onAddTrait?: () => void;
  onRemoveTrait?: (trait: string) => void;
  onClearTraits?: () => void;
  // Lot Challenges Reroll Controls
  onRerollAllChallenges?: () => void;
  onRerollSingleChallenge?: (index: number) => void;
  onAddChallenge?: () => void;
  onRemoveChallenge?: (challenge: string) => void;
  onClearChallenges?: () => void;
  isLockedByRandomFun?: boolean;
}

export const LotDisplay: React.FC<LotDisplayProps> = ({
  lot,
  onRerollLot,
  onRerollDwelling,
  onUpdateDwellingType,
  onUpdateTinyTier,
  onUpdateSubNeighborhood,
  onUpdateWorld,
  onUpdateRentalConfig,
  onRerollAllTraits,
  onRerollSingleTrait,
  onAddTrait,
  onRemoveTrait,
  onClearTraits,
  onRerollAllChallenges,
  onRerollSingleChallenge,
  onAddChallenge,
  onRemoveChallenge,
  onClearChallenges,
  isLockedByRandomFun = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  if (!lot.world) return null;

  const hasTraits = lot.lotTraits && lot.lotTraits.length > 0;
  const hasChallenges = lot.lotChallenges && lot.lotChallenges.length > 0;
  const aptApplicable = isApartmentApplicable(lot.world, lot.neighborhood);
  const penthouseApplicable = isPenthouseApplicable(lot.world, lot.neighborhood);

  // Available sub-neighborhoods in current world
  const availableSubHoods = (db.worlds as any)[lot.world] 
    ? Object.keys((db.worlds as any)[lot.world])
    : [];

  // Dwelling type visual styling
  const getDwellingStyle = (type: DwellingType) => {
    switch (type) {
      case 'Tiny Home':
        return {
          icon: '📐',
          title: 'Tiny Home Residential',
          badgeBg: 'bg-amber-950/80 border-amber-500/60 text-amber-300',
          accent: 'text-amber-400',
          border: 'border-amber-500/40',
          pack: 'Tiny Living'
        };
      case 'Haunted Home':
        return {
          icon: '👻',
          title: 'Haunted House Residential',
          badgeBg: 'bg-purple-950/80 border-purple-500/60 text-purple-300',
          accent: 'text-purple-400',
          border: 'border-purple-500/40',
          pack: 'Paranormal'
        };
      case 'Residential Rental':
        return {
          icon: '🏢',
          title: 'Residential Rental',
          badgeBg: 'bg-teal-950/80 border-teal-500/60 text-teal-300',
          accent: 'text-teal-400',
          border: 'border-teal-500/40',
          pack: 'For Rent'
        };
      case 'Apartment':
        return {
          icon: '🏙️',
          title: 'Apartment Unit',
          badgeBg: 'bg-sky-950/80 border-sky-500/60 text-sky-300',
          accent: 'text-sky-400',
          border: 'border-sky-500/40',
          pack: 'City Living'
        };
      case 'Penthouse':
        return {
          icon: '🌆',
          title: 'Luxury Penthouse',
          badgeBg: 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300',
          accent: 'text-yellow-400',
          border: 'border-yellow-500/40',
          pack: 'City Living'
        };
      case 'Standard Residential':
      default:
        return {
          icon: '🏡',
          title: 'Standard Residential',
          badgeBg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/40',
          pack: 'Base Game'
        };
    }
  };

  const style = getDwellingStyle(lot.dwellingType);

  return (
    <div className="bg-slate-900 p-5 rounded-2xl mb-6 border-l-4 border-sky-400 shadow-xl">
      {/* Top Header: World, Sub-Neighborhood (NO parcel), & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-2xl font-black text-sky-400 uppercase tracking-wide">📍 {lot.world}</span>
            <span className="text-slate-500 text-lg">/</span>
            <span className="text-xl font-extrabold text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <span>🏙️</span>
              <span>{lot.neighborhood}</span>
            </span>
            <span className="bg-sky-950/80 border border-sky-600/50 text-sky-300 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Sub-Neighbourhood
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>✨ No fixed parcel selected — build or move anywhere in the <strong>{lot.neighborhood}</strong> district!</span>
            {aptApplicable ? (
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                <span>✓</span> High-Rise Apartments Available
              </span>
            ) : (
              <span className="text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                <span>🏡</span> Traditional Lots District
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {onRerollDwelling && (
            <button
              onClick={onRerollDwelling}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Roll another dwelling type (Residential, Tiny, Haunted, Rental, Apartment)"
            >
              <span>🏠</span>
              <span>Reroll Dwelling</span>
            </button>
          )}

          {onRerollLot && (
            <button
              onClick={onRerollLot}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
              title="Reroll entire location, sub-neighborhood, traits, and dwelling"
            >
              <span>🎲</span>
              <span>Reroll District & Lot</span>
            </button>
          )}

          <button
            onClick={() => setShowEditor(!showEditor)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            title="Edit world, sub-neighborhood, or dwelling type"
          >
            <span>⚙️ {showEditor ? 'Close Setup' : 'Edit Lot'}</span>
          </button>

          {(hasTraits || hasChallenges) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-sky-500 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Toggle comprehensive descriptions for all assigned Lot Traits and Lot Challenges"
            >
              <span>{showDetails ? '📖 Hide Traits' : '📖 Lot Traits Guide'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Editor Drawer (If open) */}
      {showEditor && (
        <div className="mb-4 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs animate-fadeIn space-y-3">
          <div className="font-bold text-sky-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-700">
            ⚙️ Customize Location & Residence Type
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* World Switcher */}
            {onUpdateWorld && (
              <div>
                <label className="text-slate-400 block font-semibold mb-1">World:</label>
                <select
                  className="bg-slate-900 text-slate-100 font-bold p-2 rounded-lg border border-slate-600 w-full"
                  value={lot.world}
                  onChange={(e) => onUpdateWorld(e.target.value)}
                >
                  {Object.keys(db.worlds).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub-Neighborhood Switcher */}
            {onUpdateSubNeighborhood && (
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Sub-Neighbourhood (District):</label>
                <select
                  className="bg-slate-900 text-slate-100 font-bold p-2 rounded-lg border border-slate-600 w-full"
                  value={lot.neighborhood}
                  onChange={(e) => onUpdateSubNeighborhood(e.target.value)}
                >
                  {availableSubHoods.map(nh => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dwelling Type Switcher */}
            {onUpdateDwellingType && (
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Dwelling Type:</label>
                <select
                  className="bg-slate-900 text-slate-100 font-bold p-2 rounded-lg border border-slate-600 w-full"
                  value={lot.dwellingType}
                  onChange={(e) => onUpdateDwellingType(e.target.value as DwellingType)}
                >
                  <option value="Standard Residential">🏡 Standard Residential</option>
                  <option value="Tiny Home">📐 Tiny Home Residential</option>
                  <option value="Haunted Home">👻 Haunted House (Paranormal)</option>
                  <option value="Residential Rental">🏢 Residential Rental (Multi-Family / Spares in Units)</option>
                  {aptApplicable && <option value="Apartment">🏙️ Apartment Unit (City Living)</option>}
                  {penthouseApplicable && <option value="Penthouse">🌆 Penthouse Suite (City Living)</option>}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dwelling Presentation Card */}
      <div className={`p-4 rounded-xl bg-slate-800/70 border ${style.border} mb-4 shadow-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-2xl">{style.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-base font-extrabold uppercase tracking-wide ${style.accent}`}>
                  {lot.dwellingType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                  {style.pack}
                </span>
                {lot.dwellingType === 'Residential Rental' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950/90 text-teal-300 border border-teal-500/60 font-mono">
                    Multi-Family Spares
                  </span>
                )}
                {lot.tinyHomeTier && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-300 border border-orange-500/50">
                    {lot.tinyHomeTier}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {lot.dwellingDescription || "Specialized living space in the sub-neighborhood."}
              </div>
            </div>
          </div>

          {/* Tiny Home Tier Switcher (If Tiny Home) */}
          {lot.dwellingType === 'Tiny Home' && onUpdateTinyTier && (
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              <span className="text-xs text-slate-400 font-semibold">Tier:</span>
              <select
                className="bg-slate-900 text-amber-300 font-bold text-xs p-1 rounded border border-slate-700 focus:border-amber-400"
                value={lot.tinyHomeTier || 'Tier 2: Tiny Home (Max 64 tiles)'}
                onChange={(e) => onUpdateTinyTier(e.target.value as TinyHomeTier)}
              >
                <option value="Tier 1: Micro Home (Max 32 tiles)">Tier 1: Micro (32 tiles)</option>
                <option value="Tier 2: Tiny Home (Max 64 tiles)">Tier 2: Tiny (64 tiles)</option>
                <option value="Tier 3: Small Home (Max 100 tiles)">Tier 3: Small (100 tiles)</option>
              </select>
            </div>
          )}
        </div>

        {/* Dwelling Gameplay Perks / Mechanics */}
        {lot.dwellingPerks && lot.dwellingPerks.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              🎮 Active Living Mechanics & Perks:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {lot.dwellingPerks.map((perk, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 text-xs text-slate-200 flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold shrink-0 mt-0.5">▸</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Move-in Status indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span>{lot.redesignResidential ? '🛠️' : '✨'}</span>
            <span>
              {lot.redesignResidential 
                ? 'Renovation Challenge: Overhaul or remodel the interior before settling in!' 
                : 'Turnkey Move-In: Residence is furnished and move-in ready.'}
            </span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            Sub-Neighborhood: {lot.neighborhood}
          </div>
        </div>

        {/* 🏢 Residential Rental: TS4 For Rent Unit Rules Panel */}
        {lot.dwellingType === 'Residential Rental' && (
          <UnitRulesPanel
            rentalConfig={lot.rentalConfig}
            onUpdateRentalConfig={onUpdateRentalConfig || (() => {})}
            isLockedByRandomFun={isLockedByRandomFun}
          />
        )}
      </div>

      {/* Lot Traits Section (With Reroll, Add, Clear Controls) */}
      <div className="mt-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sky-300 font-bold text-xs uppercase flex items-center gap-1.5">
              <span>✨ Lot Traits ({lot.lotTraits.length}/3)</span>
            </span>
            <span className="text-[10px] text-slate-400 normal-case font-normal hidden sm:inline">
              (Hover for description, or click 🔄 to re-roll)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {isLockedByRandomFun ? (
              <span className="bg-rose-950/90 text-rose-300 border border-rose-700/70 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <span>🔒</span>
                <span>Lot Traits Locked by Misc Fun #1 (Random)</span>
              </span>
            ) : (
              <>
                {onRerollAllTraits && (
                  <button
                    onClick={onRerollAllTraits}
                    className="bg-sky-950/80 hover:bg-sky-900 text-sky-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-bold border border-sky-700/60 transition-all flex items-center gap-1 shadow-sm hover:scale-105"
                    title="Reroll all lot traits"
                  >
                    <span>🎲</span>
                    <span>Reroll All Traits</span>
                  </button>
                )}

                {onAddTrait && lot.lotTraits.length < 3 && (
                  <button
                    onClick={onAddTrait}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2 py-0.5 rounded text-[11px] font-bold border border-slate-600 transition-colors flex items-center gap-1"
                    title="Add another lot trait (max 3 allowed in The Sims 4)"
                  >
                    <span>➕</span>
                    <span>Add Trait</span>
                  </button>
                )}

                {onClearTraits && lot.lotTraits.length > 0 && (
                  <button
                    onClick={onClearTraits}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 transition-colors"
                    title="Clear all lot traits"
                  >
                    Clear
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasTraits ? (
            lot.lotTraits.map((t, idx) => {
              const desc = lotTraitDescriptions[t] || "In-game lot trait with specialized environmental bonuses.";
              return (
                <div
                  key={`${t}-${idx}`}
                  className="group bg-slate-800 hover:bg-slate-750 text-sky-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium border border-sky-800/60 hover:border-sky-400 transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                  <span title={`${t}: ${desc}`} className="cursor-help font-semibold">
                    {t}
                  </span>
                  
                  {/* Per-item Reroll button */}
                  {!isLockedByRandomFun && onRerollSingleTrait && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRerollSingleTrait(idx);
                      }}
                      className="text-slate-400 hover:text-sky-300 hover:bg-slate-700 p-0.5 rounded transition-colors text-[11px]"
                      title={`Reroll "${t}" into a different trait`}
                    >
                      🔄
                    </button>
                  )}

                  {/* Per-item Remove button */}
                  {!isLockedByRandomFun && onRemoveTrait && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrait(t);
                      }}
                      className="text-slate-500 hover:text-rose-400 hover:bg-slate-700 p-0.5 rounded transition-colors text-[10px] font-bold"
                      title={`Remove "${t}"`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic py-0.5">
              <span>No lot traits active.</span>
              {onAddTrait && (
                <button
                  onClick={onAddTrait}
                  className="text-sky-400 hover:underline not-italic font-bold"
                >
                  + Add one
                </button>
              )}
              <span>or</span>
              {onRerollAllTraits && (
                <button
                  onClick={onRerollAllTraits}
                  className="text-sky-400 hover:underline not-italic font-bold"
                >
                  🎲 Roll traits
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lot Challenges Section (With Reroll, Add, Clear Controls) */}
      <div className="mt-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <span>⚠️ Lot Challenges ({lot.lotChallenges.length})</span>
            </span>
            <span className="text-[10px] text-slate-400 normal-case font-normal hidden sm:inline">
              (Hover for description, or click 🔄 to re-roll)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onRerollAllChallenges && (
              <button
                onClick={onRerollAllChallenges}
                className="bg-red-950/80 hover:bg-red-900 text-rose-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-bold border border-rose-800/60 transition-all flex items-center gap-1 shadow-sm hover:scale-105"
                title="Reroll all lot challenges"
              >
                <span>🎲</span>
                <span>Reroll All Challenges</span>
              </button>
            )}

            {onAddChallenge && (
              <button
                onClick={onAddChallenge}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2 py-0.5 rounded text-[11px] font-bold border border-slate-600 transition-colors flex items-center gap-1"
                title="Add another lot challenge to this lot"
              >
                <span>➕</span>
                <span>Add Challenge</span>
              </button>
            )}

            {onClearChallenges && lot.lotChallenges.length > 0 && (
              <button
                onClick={onClearChallenges}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 transition-colors"
                title="Clear all lot challenges"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasChallenges ? (
            lot.lotChallenges.map((c, idx) => {
              const desc = lotChallengeDescriptions[c] || "Lot challenge introducing environmental hazards and gameplay restrictions.";
              return (
                <div
                  key={`${c}-${idx}`}
                  className="group bg-red-950/40 hover:bg-red-900/60 text-rose-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-800/60 hover:border-rose-400 transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="text-[11px] shrink-0">⚠️</span>
                  <span title={`${c}: ${desc}`} className="cursor-help font-semibold">
                    {c}
                  </span>

                  {/* Per-item Reroll button */}
                  {onRerollSingleChallenge && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRerollSingleChallenge(idx);
                      }}
                      className="text-rose-400 hover:text-white hover:bg-red-900/80 p-0.5 rounded transition-colors text-[11px]"
                      title={`Reroll "${c}" into a different challenge`}
                    >
                      🔄
                    </button>
                  )}

                  {/* Per-item Remove button */}
                  {onRemoveChallenge && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveChallenge(c);
                      }}
                      className="text-rose-500 hover:text-rose-200 hover:bg-red-900/80 p-0.5 rounded transition-colors text-[10px] font-bold"
                      title={`Remove "${c}"`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic py-0.5">
              <span>No lot challenges active.</span>
              {onAddChallenge && (
                <button
                  onClick={onAddChallenge}
                  className="text-rose-400 hover:underline not-italic font-bold"
                >
                  + Add one
                </button>
              )}
              <span>or</span>
              {onRerollAllChallenges && (
                <button
                  onClick={onRerollAllChallenges}
                  className="text-rose-400 hover:underline not-italic font-bold"
                >
                  🎲 Roll challenges
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Trait & Challenge Descriptions Guide (With individual reroll buttons) */}
      {showDetails && (
        <div className="mt-5 pt-4 border-t border-slate-800 animate-fadeIn space-y-4">
          {hasTraits && (
            <div>
              <div className="text-sky-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>✨ Active Lot Traits Details</span>
                {onRerollAllTraits && (
                  <button
                    onClick={onRerollAllTraits}
                    className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>🎲 Reroll All</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {lot.lotTraits.map((t, idx) => (
                  <div key={t} className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 hover:border-sky-500/50 transition-colors">
                    <div className="font-bold text-sky-200 text-xs flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        <span className="font-extrabold">{t}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {onRerollSingleTrait && (
                          <button
                            onClick={() => onRerollSingleTrait(idx)}
                            className="text-slate-400 hover:text-sky-300 bg-slate-900/60 hover:bg-sky-950 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700"
                            title={`Reroll "${t}"`}
                          >
                            🔄 Reroll
                          </button>
                        )}
                        {onRemoveTrait && (
                          <button
                            onClick={() => onRemoveTrait(t)}
                            className="text-slate-500 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-950 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-700"
                            title={`Remove "${t}"`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {lotTraitDescriptions[t] || "In-game lot trait with specialized environmental bonuses."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasChallenges && (
            <div>
              <div className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>⚠️ Active Lot Challenges Details</span>
                {onRerollAllChallenges && (
                  <button
                    onClick={onRerollAllChallenges}
                    className="text-[11px] text-rose-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>🎲 Reroll All</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {lot.lotChallenges.map((c, idx) => (
                  <div key={c} className="p-3 bg-red-950/20 rounded-xl border border-rose-900/40 hover:border-rose-500/50 transition-colors">
                    <div className="font-bold text-rose-300 text-xs flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-rose-900/50">
                      <div className="flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span className="font-extrabold">{c}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {onRerollSingleChallenge && (
                          <button
                            onClick={() => onRerollSingleChallenge(idx)}
                            className="text-rose-300 hover:text-white bg-slate-900/60 hover:bg-red-950 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-900/60"
                            title={`Reroll "${c}"`}
                          >
                            🔄 Reroll
                          </button>
                        )}
                        {onRemoveChallenge && (
                          <button
                            onClick={() => onRemoveChallenge(c)}
                            className="text-rose-400 hover:text-rose-200 bg-slate-900/60 hover:bg-rose-950 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-900/60"
                            title={`Remove "${c}"`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {lotChallengeDescriptions[c] || "Lot challenge introducing environmental hazards and gameplay restrictions."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
