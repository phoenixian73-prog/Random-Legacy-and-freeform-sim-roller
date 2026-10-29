import React, { useState } from 'react';
import { LegacyRollResult, SecondaryCareerSlot, getOrdinal } from '../data/legacyChallengeData';
import { formatCareerLabel, formatCareerNameOnly, getCareerDetailedExplanation } from '../utils/legacyGenerator';

interface StickyRollsBottomBarProps {
  currentRoll: LegacyRollResult;
  isHeirAdult?: boolean;
  onOpenRulebook?: () => void;
  onScrollToRolls?: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export const StickyRollsBottomBar: React.FC<StickyRollsBottomBarProps> = ({
  currentRoll,
  isHeirAdult = false,
  onOpenRulebook,
  onScrollToRolls,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const heirCareerName = formatCareerNameOnly(currentRoll.heirCareer);
  const heirCareerExpl = getCareerDetailedExplanation(currentRoll.heirCareer);
  const isHeirHopper = currentRoll.heirCareer.categoryType === 'Career Hopper';

  const secondarySlots: SecondaryCareerSlot[] = (currentRoll.secondaryCareers && currentRoll.secondaryCareers.length > 0)
    ? currentRoll.secondaryCareers
    : (currentRoll.secondaryCareer ? [{
        id: "legacy-partner",
        role: "spouse",
        label: "Spouse / Partner",
        tag: "Spouse",
        career: currentRoll.secondaryCareer
      }] : []);

  const heirOrdinal = getOrdinal(currentRoll.children.heirOrder || 1);

  if (isMinimized) {
    return (
      <aside aria-label="Legacy rolls quick summary" className="fixed bottom-3 right-4 z-40 animate-bounce-subtle">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-2xl border border-amber-300 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Click to view all 5 Legacy Rolls visible from the bottom"
        >
          <span>👑</span>
          <span>Gen {currentRoll.generation} Rolls Summary (5 Rolls)</span>
          <span className="bg-black/30 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
            ▲ Expand
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Legacy rolls quick summary" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t-2 border-amber-500/80 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.7)] transition-all text-slate-100">
      {/* Top Header Bar */}
      <div className="max-w-[1300px] mx-auto px-4 py-2 flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-black text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>👑</span>
            <span>Gen {currentRoll.generation} Quick Rolls Reference</span>
          </span>
          <span className="text-[10px] bg-slate-850 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
            All 5 Core Laws Visible
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onScrollToRolls && (
            <button
              onClick={onScrollToRolls}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Scroll directly up to the main rolls section"
            >
              <span>⬆️</span>
              <span>Scroll to Rolls</span>
            </button>
          )}

          {onOpenRulebook && (
            <button
              onClick={onOpenRulebook}
              className="text-[11px] bg-slate-900 hover:bg-sky-950 text-sky-300 hover:text-sky-200 px-2.5 py-1 rounded border border-sky-800/60 flex items-center gap-1 cursor-pointer transition-colors"
              title="Open full PieceOfPrincess rulebook"
            >
              <span>📖</span>
              <span>Rulebook</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-[11px] bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold px-2.5 py-1 rounded border border-amber-500/50 flex items-center gap-1 cursor-pointer transition-all"
            title="Toggle full text rules & constraints"
          >
            <span>{isExpanded ? '▼' : '▲'}</span>
            <span>{isExpanded ? 'Compact Bar' : 'Detailed Directives'}</span>
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white px-2 py-1 rounded text-xs font-bold hover:bg-slate-800 cursor-pointer"
            title="Minimize to floating button"
          >
            ✕ Minimize
          </button>
        </div>
      </div>

      {/* 5 Rolls Compact Grid */}
      <div className="max-w-[1300px] mx-auto px-4 py-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
        {/* 1. Marital Status */}
        <div className="bg-slate-900/90 p-2 rounded-xl border border-sky-500/30 flex flex-col justify-between hover:border-sky-400 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-sky-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>💍</span>
                <span>1. Marital Status</span>
              </span>
              <span className="font-mono text-slate-400">Roll {currentRoll.marital.diceRoll}</span>
            </div>
            <div className="font-extrabold text-white text-xs break-words whitespace-normal leading-snug" title={currentRoll.marital.entry.title}>
              {currentRoll.marital.entry.title}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 break-words whitespace-normal leading-snug">
              {currentRoll.marital.entry.partnerCount} Partner(s) • {currentRoll.marital.entry.helperCount} Helper(s)
            </div>
          </div>
          {isExpanded && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 leading-tight space-y-1">
              <p>{currentRoll.marital.entry.description}</p>
              <p className="text-[10px] text-pink-300 font-medium">
                💡 Flexible status: Married, Engaged, Dating, Domestic Partner, or WooHoo Partners. Helpers can be biological family (Uncle, Brother, Sister, Cousin)!
              </p>
            </div>
          )}
        </div>

        {/* 2. Number of Children */}
        <div className="bg-slate-900/90 p-2 rounded-xl border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>👶</span>
                <span>2. Children</span>
              </span>
              <span className="font-mono text-slate-400">Roll {currentRoll.children.diceRoll}</span>
            </div>
            <div className="font-extrabold text-white text-xs">
              {currentRoll.children.targetCount} {currentRoll.children.targetCount === 1 ? 'Child' : 'Children'}
            </div>
            <div className="text-[10px] text-amber-300 font-semibold mt-0.5 break-words whitespace-normal leading-snug">
              🌟 Heir: {heirOrdinal} Child Arrival
            </div>
          </div>
          {isExpanded && (
            <p className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 leading-tight">
              Heir Rule: The {heirOrdinal} born/adopted child of this generation becomes the official heir. Science babies count as biological.
            </p>
          )}
        </div>

        {/* 3. Careers */}
        <div className="bg-slate-900/90 p-2 rounded-xl border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>💼</span>
                <span>3. Careers</span>
              </span>
              <span className="font-mono text-slate-400">
                {secondarySlots.length > 0 ? `Heir + ${secondarySlots.length} Other${secondarySlots.length > 1 ? 's' : ''}` : 'Heir'}
              </span>
            </div>

            {/* Primary Heir Career */}
            {isHeirHopper ? (
              <div className="text-[11px] font-extrabold text-emerald-300 mb-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="shrink-0">👑</span>
                  <span>Career Hopper (5 Jobs):</span>
                </div>
                <div className="text-[10px] text-emerald-200/90 font-medium leading-snug mt-0.5 break-words">
                  {currentRoll.heirCareer.hopperCareers?.map((c, i) => `${i + 1}. ${c.name}`).join(' ➔ ')}
                </div>
              </div>
            ) : (
              <div className="font-extrabold text-emerald-300 text-xs flex items-start gap-1" title={stripHtml(heirCareerName)}>
                <span className="shrink-0 mt-0.5">👑</span>
                <span className="break-words whitespace-normal leading-snug" dangerouslySetInnerHTML={{ __html: heirCareerName }} />
              </div>
            )}

            {/* Secondary Careers: List EVERY partner & helper with name only */}
            {secondarySlots.length > 0 ? (
              <div className="mt-1 pt-1 border-t border-slate-800 space-y-1">
                {secondarySlots.map((slot, idx) => {
                  const isSlotHopper = slot.career.categoryType === 'Career Hopper';
                  const slotName = slot.tag || slot.label || `Partner ${idx + 1}`;
                  const careerNameHtml = formatCareerNameOnly(slot.career);
                  const isUnemployed = slot.career.categoryType === 'Unemployed';

                  return (
                    <div key={slot.id || idx} className="text-[10px]">
                      <div className="flex items-center gap-1 font-bold text-sky-300">
                        <span className="shrink-0">{slot.role === 'helper' ? '🤝' : '💍'}</span>
                        <span className="break-words">{slotName}:</span>
                      </div>
                      {isSlotHopper ? (
                        <div className="text-[10px] text-emerald-200/90 pl-3 leading-tight break-words">
                          {slot.career.hopperCareers?.map((c, i) => `${i + 1}. ${c.name}`).join(' ➔ ')}
                        </div>
                      ) : (
                        <div
                          className={`text-[10px] pl-3 leading-snug break-words whitespace-normal ${isUnemployed ? 'text-amber-200/90 italic' : 'text-slate-200'}`}
                          dangerouslySetInnerHTML={{ __html: careerNameHtml }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 italic mt-0.5">
                No spouse or helper (Single parent)
              </div>
            )}
          </div>

          {/* Detailed Directives: Full job explanations and rules */}
          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-tight space-y-2">
              <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span>📋</span>
                <span>Detailed Career Directives & Rules</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Rule 3: Sims may only earn income strictly from their assigned rolled career. No unapproved selling or side-hustles!
              </p>

              {/* Heir Detailed Career Directive */}
              {heirCareerExpl && (
                <div className="p-2 bg-slate-950/90 rounded border border-emerald-600/40 text-[10px] space-y-1">
                  <div className="font-extrabold text-emerald-300 flex items-center justify-between flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <span>👑</span>
                      <span>Heir: {heirCareerExpl.title}</span>
                    </span>
                    {heirCareerExpl.pack && (
                      <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/60 font-mono">
                        {heirCareerExpl.pack}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-snug">
                    <strong className="text-emerald-400/90">Rules / Directive:</strong> {heirCareerExpl.description}
                  </p>
                </div>
              )}

              {/* Heir Career Hopper Chain Details */}
              {isHeirHopper && currentRoll.heirCareer.hopperCareers && (
                <div className="p-2 bg-emerald-950/80 rounded border border-emerald-600/50 text-[10px] space-y-1">
                  <div className="font-bold text-emerald-300">👑 Heir Career Hopper Chain Sequence:</div>
                  {currentRoll.heirCareer.hopperCareers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-1 text-slate-200">
                      <span><strong className="text-emerald-400 font-mono">#{i + 1}</strong> {c.name}</span>
                      <span className="text-slate-400 text-[9px]">({c.branch || 'Standard'} • {c.pack})</span>
                    </div>
                  ))}
                  <div className="text-[9px] text-emerald-400/80 italic pt-0.5">
                    Work through in sequence: reach Level 5 (or choose branch) before quitting to join next job!
                  </div>
                </div>
              )}

              {/* Secondary Careers Detailed Directives */}
              {secondarySlots.map((slot, idx) => {
                const expl = getCareerDetailedExplanation(slot.career);
                const isSlotHopper = slot.career.categoryType === 'Career Hopper';
                const slotName = slot.tag || slot.label || `Partner ${idx + 1}`;
                if (!expl) return null;

                return (
                  <div key={slot.id || idx} className="p-2 bg-slate-950/90 rounded border border-sky-600/40 text-[10px] space-y-1">
                    <div className="font-extrabold text-sky-300 flex items-center justify-between flex-wrap gap-1">
                      <span className="flex items-center gap-1">
                        <span>{slot.role === 'helper' ? '🤝' : '💍'}</span>
                        <span>{slotName}: {expl.title}</span>
                      </span>
                      {expl.pack && (
                        <span className="text-[9px] bg-slate-900 text-sky-400 px-1.5 py-0.2 rounded border border-sky-800/60 font-mono">
                          {expl.pack}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-sky-400/90">Rules / Directive:</strong> {expl.description}
                    </p>
                    {isSlotHopper && slot.career.hopperCareers && (
                      <div className="mt-1 pl-2 border-l border-sky-800/60 space-y-0.5">
                        {slot.career.hopperCareers.map((c, i) => (
                          <div key={i} className="text-[9.5px] text-slate-300">
                            #{i + 1} {c.name} ({c.branch || 'Standard'} • {c.pack})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Generation Goal */}
        <div className="bg-slate-900/90 p-2 rounded-xl border border-amber-500/30 flex flex-col justify-between hover:border-amber-400 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>🎯</span>
                <span>4. Gen Goal</span>
              </span>
              <span className="font-mono text-slate-400">Roll {currentRoll.goal.diceRoll}</span>
            </div>
            <div className="font-extrabold text-white text-xs break-words whitespace-normal leading-snug" title={currentRoll.goal.entry.title}>
              {currentRoll.goal.entry.title}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 break-words whitespace-normal">
              {currentRoll.goal.entry.pack}
            </div>

            {/* Goal 9 Party King / Queen Progress Note */}
            {currentRoll.goal.entry.id === 9 && currentRoll.goal.partyGoals && (
              <div className="mt-1.5 p-1.5 bg-purple-950/70 border border-purple-700/60 rounded text-[9.5px] space-y-1">
                <div className="flex items-center justify-between text-purple-300 font-bold text-[9px]">
                  <span className="flex items-center gap-1">🎉 4 Gold Parties:</span>
                  <span className="font-mono text-amber-300 font-extrabold">
                    {currentRoll.goal.partyGoals.filter(p => p.isGoldAchieved).length} / 4 Gold
                  </span>
                </div>
                <div className="space-y-0.5">
                  {currentRoll.goal.partyGoals.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between text-slate-200 text-[8.5px] gap-1">
                      <span className="break-words whitespace-normal">
                        {p.isGoldAchieved ? '🏆' : '⚪'} {idx + 1}. {p.name}
                      </span>
                      <span className="text-emerald-400 shrink-0 font-mono text-[8px]">{p.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goal 12 Midlife Crisis Compact Note */}
            {currentRoll.goal.entry.id === 12 && (
              isHeirAdult && currentRoll.goal.midlifeCrisisRevealed && currentRoll.goal.midlifeCrisisAspects && currentRoll.goal.midlifeCrisisAspects.length > 0 ? (
                <div
                  className="mt-1.5 text-[9px] bg-rose-950/80 text-rose-200 border border-rose-800/80 px-1.5 py-0.5 rounded leading-tight font-semibold"
                  title={currentRoll.goal.midlifeCrisisAspects.map(a => `#${a.roll} ${a.title}`).join(' • ')}
                >
                  <div className="text-amber-300 font-bold text-[8.5px] uppercase">🔥 Midlife Crisis (Revealed):</div>
                  <div className="break-words whitespace-normal leading-tight">
                    {currentRoll.goal.midlifeCrisisAspects.map(a => `#${a.roll} ${a.title}`).join(' • ')}
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 text-[9px] bg-slate-950 text-amber-400 border border-amber-900/60 px-1.5 py-0.5 rounded leading-tight flex items-center gap-1 font-mono">
                  <span>🔒</span>
                  <span>Noted on Challenges • Aspects Sealed</span>
                </div>
              )
            )}
          </div>
          {isExpanded && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 leading-tight space-y-1.5">
              <p>{currentRoll.goal.entry.description}</p>
              {currentRoll.goal.entry.id === 12 && (
                isHeirAdult && currentRoll.goal.midlifeCrisisRevealed && currentRoll.goal.midlifeCrisisAspects && currentRoll.goal.midlifeCrisisAspects.length > 0 ? (
                  <div className="mt-1 p-1.5 bg-slate-950 rounded border border-amber-500/40 space-y-1">
                    <div className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1">
                      <span>🔥</span>
                      <span>Quick Note — Midlife Crisis Aspects (Revealed):</span>
                    </div>
                    {currentRoll.goal.midlifeCrisisAspects.map((asp, idx) => (
                      <div key={idx} className="text-[9.5px] text-slate-300 leading-snug">
                        <strong className="text-amber-200">#{asp.roll} {asp.title}</strong>{' '}
                        <span className="text-rose-400 font-semibold">[{asp.deadline}]:</span>{' '}
                        <span className="text-slate-400">{asp.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 p-1.5 bg-slate-950 rounded border border-amber-900/50 text-[10px] text-amber-300 leading-tight">
                    📌 <strong>Noted on Heir's Challenges:</strong> Midlife Crisis is active. Per rules, the 3 crisis aspects remain strictly sealed and cannot be rolled before aging as Adult.
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 5. Miscellaneous Fun */}
        <div className="bg-slate-900/90 p-2 rounded-xl border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span>🎭</span>
                <span>5. Misc Fun</span>
              </span>
              <span className="font-mono text-slate-400">Roll {currentRoll.fun.diceRoll}</span>
            </div>
            <div className="font-extrabold text-white text-xs break-words whitespace-normal leading-snug" title={currentRoll.fun.entry.title}>
              {currentRoll.fun.entry.title}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 break-words whitespace-normal">
              {currentRoll.fun.entry.pack}
            </div>
          </div>
          {isExpanded && (
            <p className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 leading-tight">
              {currentRoll.fun.entry.description}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
