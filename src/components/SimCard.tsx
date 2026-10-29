import React, { useState } from 'react';
import { Sim, ToddlerSkills, HorseSkills } from '../types';
import { 
  db, 
  traitData, 
  deathDB, 
  aspReqs, 
  childAspirationMap, 
  childAspirationsData,
  childAspirationsByCategory,
  childAspirationCategories,
  skillsByName,
  calculateChildSkillsFromToddler
} from '../data/simData';
import { getDeathOptions, masterConflicts, getValidTrait, roll, getPossiblePairRelations } from '../utils/generator';
import { getAspirationRuleCheck } from '../data/legacyChallengeData';
import { 
  ASPIRATION_CATEGORIES, 
  isAspirationAllowedForCareer, 
  getMatchingCareerForAspiration, 
  checkAspirationRuleStatus,
  cleanCareerText
} from '../utils/aspirationCareerRules';

interface SimCardProps {
  sim: Sim;
  household?: Sim[];
  ruleOrientation?: 'standard' | 'inverted';
  onToggleRuleOrientation?: () => void;
  onSelectAdultAspiration?: (id: number, aspiration: string) => void;
  onInvertAlignCareer?: (id: number) => void;
  onAlignAspirationToCareer?: (id: number) => void;
  onToggleGhost: (id: number) => void;
  onUpdateDeath: (id: number, cause: string) => void;
  onRerollOccult: (id: number) => void;
  onOccultChange: (id: number, occult: string) => void;
  onRemoveSim: (id: number) => void;
  onAgeUp: (id: number) => void;
  onRerollSim: (id: number, age: string) => void;
  onAddTrait: (id: number, trait: string) => void;
  onRemoveTrait: (id: number, trait: string) => void;
  onInject: (id: number, field: string) => void;
  onRerollAspiration: (id: number) => void;
  onRerollHobby: (id: number) => void;
  onRerollCareer?: (id: number) => void;
  onUpdateBaseRel?: (id: number, newRel: string) => void;
  onRerollRelation?: (id: number) => void;
  onUpdatePairRelation?: (simAId: number, simBId: number, newRel: string) => void;
  onRerollPairRelation?: (simAId: number, simBId: number) => void;
  onUpdateLinkedSim?: (id: number, targetSimId: number) => void;
  onRollImaginaryFriend?: (childId: number) => void;
  onAttachImaginaryFriend?: (childId: number) => void;
  onUpdateChildSkill?: (id: number, skillName: "Creativity" | "Mental" | "Motor" | "Social", level: number) => void;
  onRerollChildSkills?: (id: number) => void;
  onMaxChildSkills?: (id: number) => void;
  onUpdateToddlerSkill?: (id: number, skillName: keyof ToddlerSkills, level: number) => void;
  onUpdateHorseSkill?: (id: number, skillName: keyof HorseSkills, level: number) => void;
  onOpenChildAspirationModal?: (sim: Sim) => void;
  onSelectChildAspiration?: (id: number, aspirationName: string) => void;
  onOpenSkillsGuide?: (sim: Sim) => void;
  onSetNextHeir?: (id: number) => void;
  onPutPetUpForAdoption?: (id: number) => void;
  onUpdateStage?: (id: number, newStage: string) => void;
  onUpdateTrait?: (id: number, traitIndex: number, newTrait: string) => void;
  onRerollSingleTraitSlot?: (id: number, traitIndex: number) => void;
  onUpdateBaseGender?: (id: number, newBaseGender: string) => void;
  onUpdateCustomGender?: (id: number, field: string, value: string) => void;
  onUpdatePairDynamic?: (simAId: number, simBId: number, newDynamic: string) => void;
  onUpdateSimDynamic?: (id: number, familyDynamic?: string, romanticDynamic?: string) => void;
  onMakeImaginaryFriendReal?: (ifId: number) => void;
  onKeepImaginaryFriendAsDoll?: (ifId: number) => void;
  onChooseRandomHeir?: () => void;
  onUpdatePartnerStatus?: (id: number, status: 'Married' | 'Engaged' | 'Dating' | 'Domestic Partner' | 'WooHoo Partner' | 'Divorced / Co-parent') => void;
  onUpdateHelperType?: (id: number, helperType: 'Roommate' | 'Brother' | 'Sister' | 'Uncle' | 'Aunt' | 'Cousin' | 'Grandparent' | 'Royal Retainer') => void;
  onMoveOutSpare?: (id: number) => void;
  isLockedByRandomFun?: boolean;
  isLegacyMode?: boolean;
}

export const SimCard: React.FC<SimCardProps> = ({
  sim,
  household = [],
  isLegacyMode = false,
  ruleOrientation = 'standard',
  onToggleRuleOrientation,
  onSelectAdultAspiration,
  onInvertAlignCareer,
  onAlignAspirationToCareer,
  onUpdateBaseGender,
  onUpdateCustomGender,
  onUpdatePairDynamic,
  onUpdateSimDynamic,
  onToggleGhost,
  onUpdateDeath,
  onRerollOccult,
  onOccultChange,
  onRemoveSim,
  onAgeUp,
  onUpdateStage,
  onRerollSim,
  onAddTrait,
  onRemoveTrait,
  onUpdateTrait,
  onRerollSingleTraitSlot,
  onInject,
  onRerollAspiration,
  onRerollHobby,
  onRerollCareer,
  onUpdateBaseRel,
  onRerollRelation,
  onUpdatePairRelation,
  onRerollPairRelation,
  onUpdateLinkedSim,
  onRollImaginaryFriend,
  onAttachImaginaryFriend,
  onUpdateChildSkill,
  onRerollChildSkills,
  onMaxChildSkills,
  onUpdateToddlerSkill,
  onUpdateHorseSkill,
  onOpenChildAspirationModal,
  onSelectChildAspiration,
  onOpenSkillsGuide,
  onSetNextHeir,
  onPutPetUpForAdoption,
  onMakeImaginaryFriendReal,
  onKeepImaginaryFriendAsDoll,
  onChooseRandomHeir,
  onUpdatePartnerStatus,
  onUpdateHelperType,
  onMoveOutSpare,
  isLockedByRandomFun = false,
}) => {
  const isElder = sim.stage === "Elder";
  let baseSpeciesStr = "Human";
  if (sim.isPet) {
    baseSpeciesStr = sim.species;
  } else if (sim.occult === "Imaginary Friend") {
    if (sim.isMadeReal) {
      baseSpeciesStr = "Imaginary Friend (Made Real) ✨";
    } else if (sim.isDoll) {
      baseSpeciesStr = "Imaginary Friend Doll 🧸";
    } else {
      baseSpeciesStr = "Imaginary Friend 🧸";
    }
  } else if (sim.occult !== "None") {
    baseSpeciesStr = sim.occult;
  }

  const eligibleCompanionSims = (household || []).filter(
    s => s.id !== sim.id && !s.isPet && s.occult !== "Imaginary Friend" && ["Toddler", "Child", "Teen", "Young Adult"].includes(s.stage)
  );
  const toddlerAndChildSims = (household || []).filter(
    s => s.id !== sim.id && !s.isPet && s.occult !== "Imaginary Friend" && ["Toddler", "Child"].includes(s.stage)
  );
  const linkedImaginaryFriend = (household || []).find(
    s => s.occult === "Imaginary Friend" && s.linkedSimId === sim.id
  );
  const otherHouseholdSims = (household || []).filter(s => s.id !== sim.id);

  const pool = sim.isPet
    ? (sim.species === "Dog" ? db.dogTraits : (sim.species === "Cat" ? db.catTraits : db.horseTraits))
    : (sim.stage === "Infant" ? db.infantTraits : (sim.stage === "Toddler" ? db.toddlerTraits : (sim.stage === "Child" ? db.childTraits : db.adultTraits)));

  const traitOpts = pool.filter(t => !sim.traits.includes(t) && !sim.traits.some(active => masterConflicts[active] && masterConflicts[active].has(t)));
  const allHumanTraits = [...new Set([...db.adultTraits, ...db.childTraits, ...db.toddlerTraits, ...db.infantTraits])];

  const handleAddTrait = () => {
    const select = document.getElementById(`addTrait_${sim.id}`) as HTMLSelectElement;
    if (select && select.value) {
      onAddTrait(sim.id, select.value);
      select.value = "";
    }
  };

  const handleRerollSim = () => {
    const select = document.getElementById(`rerollAge_${sim.id}`) as HTMLSelectElement;
    if (select && select.value) {
      onRerollSim(sim.id, select.value);
    }
  };

  return (
    <div className="sim-card bg-gray-900 border border-gray-700 p-5 rounded-xl flex flex-col hover:-translate-y-1 hover:border-sky-400 transition-all duration-200">
      <h3 className="m-0 mb-2.5 text-sky-400 border-b border-gray-700 pb-1.5 text-lg flex justify-between items-center">
        <span className={`${sim.ghost ? 'text-purple-400 font-bold' : ''} ${sim.occult === 'Imaginary Friend' ? 'text-pink-400 font-bold' : (sim.occult !== 'None' ? 'text-green-400 font-bold' : '')} ${sim.isPet ? 'text-amber-400 font-bold' : ''}`}>
          {sim.ghost ? 'Ghost ' : ''}{baseSpeciesStr}
        </span>
        <span className="text-slate-400 text-xs bg-slate-800 px-2 py-0.5 rounded-md">SIM {sim.id}</span>
      </h3>

      {/* Legacy Role / Next Heir Badges */}
      {(sim.branchName || sim.isNextHeir) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {sim.branchName && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sim.branchBadge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {sim.branchName}
            </span>
          )}
          {sim.isNextHeir && (
            <span className="text-[11px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-300 shadow">
              🌟 Next Heir
            </span>
          )}
        </div>
      )}

      {/* Misc Fun #1 (Random) Lock Banner */}
      {isLockedByRandomFun && (
        <div className="bg-rose-950/80 border border-rose-500/80 p-2 rounded-xl text-xs mb-2.5 flex items-center gap-2 shadow-sm text-rose-200">
          <span className="text-lg">🔒</span>
          <div>
            <div className="font-extrabold text-rose-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>Misc Fun #1 (Random) Active</span>
              <span className="text-[9px] bg-rose-900 text-rose-200 px-1.5 py-0.2 rounded font-mono">Re-rolls Locked</span>
            </div>
            <div className="text-[10px] text-rose-200/90 leading-tight mt-0.5">
              Traits, aspirations, and lot traits must be accepted randomly as generated. Manual re-rolls and edits are locked by legacy rules!
            </div>
          </div>
        </div>
      )}

      {/* Partner Commitment / Relationship Flexibility Selector */}
      {!sim.isPet && (sim.familyUnitRole === "Partner" || sim.baseRel === "Spouse" || sim.partnerStatus) && (
        <div className="bg-pink-950/40 border border-pink-600/40 p-2 rounded-xl text-xs mb-2.5 flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💍</span>
            <span className="font-extrabold text-pink-300 text-[11px] uppercase tracking-wider">
              Couple Status:
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <select
              className="bg-slate-900 text-pink-200 text-xs px-2 py-1 rounded border border-pink-600 font-semibold cursor-pointer hover:border-pink-400 transition-colors"
              value={sim.partnerStatus || "Married"}
              onChange={(e) => onUpdatePartnerStatus?.(sim.id, e.target.value as any)}
              title="PieceOfPrincess rule: Couple status is not locked to marriage! Choose Dating, Engaged, Domestic Partner, or WooHoo Partner."
            >
              <option value="Married">💍 Married (Spouse)</option>
              <option value="Engaged">💎 Engaged (Fiancé / Fiancée)</option>
              <option value="Dating">❤️ Dating (Romantic Partner)</option>
              <option value="Domestic Partner">🏡 Domestic Partner (Cohabiting)</option>
              <option value="WooHoo Partner">🔥 WooHoo Partner (Friends with Benefits)</option>
              <option value="Divorced / Co-parent">💔 Divorced / Co-parents</option>
            </select>
          </div>
        </div>
      )}

      {/* Helper Archetype Selector (Option 1: Roommate/Friend, Option 2: Royal Retainer, Option 3: Extended Family Helper) */}
      {!sim.isPet && (sim.familyUnitRole === "Helper" || sim.helperType) && (
        <div className="bg-teal-950/50 border border-teal-600/50 p-2 rounded-xl text-xs mb-2.5 flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🤝</span>
            <span className="font-extrabold text-teal-300 text-[11px] uppercase tracking-wider">
              Helper Archetype:
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <select
              className="bg-slate-900 text-teal-200 text-xs px-2 py-1 rounded border border-teal-500 font-semibold cursor-pointer hover:border-teal-400 transition-colors"
              value={sim.helperType || "Roommate"}
              onChange={(e) => onUpdateHelperType?.(sim.id, e.target.value as any)}
              title="Helper can be an unrelated roommate, royal staff, or biological/extended family (Option 3: Brother, Sister, Uncle, Aunt, Cousin, Grandparent)!"
            >
              <optgroup label="Unrelated / Royal Staff">
                <option value="Roommate">🤝 Live-in Friend / Roommate</option>
                <option value="Royal Retainer">🏰 Royal Retainer / Butler / Guard</option>
              </optgroup>
              <optgroup label="Option 3: Extended Family Helper">
                <option value="Brother">👨‍👦 Brother (Royal Sibling Helper)</option>
                <option value="Sister">👩‍👧 Sister (Royal Sibling Helper)</option>
                <option value="Uncle">👨 Uncle (Regent / Family Helper)</option>
                <option value="Aunt">👩 Aunt (Regent / Family Helper)</option>
                <option value="Cousin">👥 Cousin (Noble Kin Helper)</option>
                <option value="Grandparent">👴 Grandparent (Elder Kin Helper)</option>
              </optgroup>
            </select>
          </div>
        </div>
      )}

      {/* Dedicated In-Game Dynamics Setter (Always Visible & Configurable) */}
      {!sim.isPet && (
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-xs mb-2.5 flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👨‍👩‍👧</span>
            <span className="font-extrabold text-pink-300 text-[11px] uppercase tracking-wider">
              Dynamics:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Family Dynamic: Close, Distant, Jokesters, Difficult */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-semibold">Family:</span>
              <select
                className="bg-slate-900 text-pink-200 text-xs px-2 py-0.5 rounded border border-pink-700/60 font-semibold cursor-pointer hover:border-pink-500 transition-colors"
                value={sim.familyDynamic || "None"}
                onChange={(e) => onUpdateSimDynamic?.(sim.id, e.target.value === "None" ? undefined : e.target.value, sim.romanticDynamic)}
                title="Set Family Dynamic (Growing Together in-game dynamic)"
              >
                <option value="None">None (Neutral)</option>
                <option value="Close">Close</option>
                <option value="Distant">Distant</option>
                <option value="Jokesters">Jokesters</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>

            {/* Romantic Dynamic: Wholesome, Steamy, Strained, Unpredictable */}
            {sim.isFunctional && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Romantic:</span>
                <select
                  className="bg-slate-900 text-amber-200 text-xs px-2 py-0.5 rounded border border-amber-700/60 font-semibold cursor-pointer hover:border-amber-500 transition-colors"
                  value={sim.romanticDynamic || "None"}
                  onChange={(e) => onUpdateSimDynamic?.(sim.id, sim.familyDynamic, e.target.value === "None" ? undefined : e.target.value)}
                  title="Set Romantic Dynamic (Lovestruck in-game dynamic)"
                >
                  <option value="None">None (Neutral)</option>
                  <option value="Wholesome">❤️ Wholesome</option>
                  <option value="Steamy">🔥 Steamy</option>
                  <option value="Strained">⚡ Strained</option>
                  <option value="Unpredictable">🎲 Unpredictable</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Life Stage / Age Selector */}
      <div className="text-slate-100 text-sm mb-1.5 flex items-center justify-between flex-wrap gap-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-300 text-xs uppercase flex items-center gap-1">
            <span>🌱</span>
            <span>Age / Stage:</span>
          </span>
          {sim.occult === 'Servo' ? (
            <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 font-mono">
              Immortal Machine
            </span>
          ) : (
            <select
              className="bg-slate-900 text-amber-200 text-xs font-bold px-2 py-0.5 rounded border border-amber-600/60 cursor-pointer hover:border-amber-400 transition-colors"
              value={sim.stage}
              onChange={(e) => onUpdateStage?.(sim.id, e.target.value)}
              title="Select life stage / age for this Sim"
            >
              {(sim.isPet ? db.petStages : db.stages).map(stage => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Age Up Button */}
          {((!sim.isPet && sim.stage !== 'Elder') || (sim.isPet && sim.stage !== 'Elder')) && sim.occult !== 'Servo' && (
            <button
              onClick={() => onAgeUp(sim.id)}
              className="text-[10px] bg-emerald-800/80 hover:bg-emerald-600 text-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-600 transition-all flex items-center gap-1 cursor-pointer"
              title="Natural Age Up to next life stage"
            >
              <span>🎂</span>
              <span>Age Up</span>
            </button>
          )}

          {/* Quick Succession Crown Button for Children & Surviving Heirs */}
          {!sim.isPet && (sim.familyUnitRole === "Child" || sim.familyUnitRole === "Next Heir" || sim.familyUnitRole === "Heir" || sim.baseRel === "Child") && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetNextHeir?.(sim.id)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  sim.isNextHeir || sim.familyUnitRole === "Heir"
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-sm'
                    : 'bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-slate-950 border-slate-700 hover:border-amber-400'
                }`}
                title={sim.isNextHeir || sim.familyUnitRole === "Heir" ? "Currently designated as the Heir" : "Crown this surviving child as the Heir / Successor"}
              >
                <span>👑</span>
                <span>{sim.isNextHeir || sim.familyUnitRole === "Heir" ? "Heir ✓" : "Crown as Heir"}</span>
              </button>
              {onChooseRandomHeir && (household || []).filter(s => !s.isPet && !s.ghost).length >= 2 && (
                <button
                  onClick={onChooseRandomHeir}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Constraint Mode: Randomly choose Heir in case of multiple Sims / children"
                >
                  <span>🎲</span>
                  <span>Random Heir</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consolidated Gender Identity & CAS Settings - Completely Un-tabbed & Fully Visible */}
      {!sim.isPet && (
        <div className="text-slate-100 text-sm mb-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-3 shadow-sm">
          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-1.5 pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>⚧</span>
                <span>Gender Identity & CAS Settings</span>
              </span>
            </div>
            <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono font-bold" title="Rule: Gender identity and CAS reproduction options are fully unlocked when editing a Sim normally">
              🔓 Unlocked in CAS
            </span>
          </div>

          {/* Group 1: Identity, Pronouns, Body Frame, and Clothing Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {/* Base Gender */}
            <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] font-semibold">Base Gender:</span>
              <select
                className={`text-xs px-2 py-1 rounded border font-bold cursor-pointer transition-colors ${
                  sim.baseGender === 'Female' 
                    ? 'bg-pink-950 text-pink-300 border-pink-600' 
                    : sim.baseGender === 'Non-Binary'
                    ? 'bg-purple-950 text-purple-300 border-purple-600'
                    : 'bg-blue-950 text-blue-300 border-blue-600'
                }`}
                value={sim.baseGender}
                onChange={(e) => onUpdateBaseGender?.(sim.id, e.target.value)}
                title="Select Gender Identity"
              >
                <option value="Male">♂ Male</option>
                <option value="Female">♀ Female</option>
                <option value="Non-Binary">⚧ Non-Binary</option>
                <option value="Custom">✨ Custom Identity</option>
              </select>
            </div>

            {/* Pronouns */}
            <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] font-semibold">Pronouns:</span>
              <select
                className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                value={sim.pronouns || (sim.baseGender === 'Female' ? 'She/Her' : sim.baseGender === 'Non-Binary' ? 'They/Them' : 'He/Him')}
                onChange={(e) => onUpdateCustomGender?.(sim.id, 'pronouns', e.target.value)}
                title="Select Sim Pronouns"
              >
                <option value="He/Him">He / Him</option>
                <option value="She/Her">She / Her</option>
                <option value="They/Them">They / Them</option>
                <option value="He/They">He / They</option>
                <option value="She/They">She / They</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Physical Frame */}
            {sim.occult !== 'Servo' && (
              <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold">Physical Frame:</span>
                <select
                  className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                  value={sim.gender !== 'N/A' && sim.gender ? sim.gender : (sim.baseGender === 'Female' ? 'Feminine' : 'Masculine')}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'gender', e.target.value)}
                  title="Physical Frame: Masculine or Feminine (The Sims 4 CAS option)"
                >
                  <option value="Masculine">Masculine Frame</option>
                  <option value="Feminine">Feminine Frame</option>
                </select>
              </div>
            )}

            {/* Clothing Preference */}
            {sim.occult !== 'Servo' && (
              <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold">Clothing Preference:</span>
                <select
                  className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                  value={sim.pref !== 'N/A' && sim.pref ? sim.pref : (sim.baseGender === 'Female' ? 'Feminine' : 'Masculine')}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'pref', e.target.value)}
                  title="Clothing Preference: Masculine or Feminine style clothing"
                >
                  <option value="Masculine">👕 Masculine Style</option>
                  <option value="Feminine">👗 Feminine Style</option>
                </select>
              </div>
            )}
          </div>

          {/* Group 2: Reproduction & Toilet Usage */}
          {sim.occult !== 'Servo' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-850">
              {/* Conception */}
              <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold">Conception:</span>
                <select
                  className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                  value={sim.pregnancy !== 'N/A' && sim.pregnancy ? sim.pregnancy : (sim.baseGender === 'Female' ? 'Can get pregnant' : 'Can get others pregnant')}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'pregnancy', e.target.value)}
                  title="Can this Sim become pregnant or make others pregnant?"
                >
                  <option value="Can get pregnant">Can get pregnant</option>
                  <option value="Can get others pregnant">Can get others pregnant</option>
                  <option value="Neither">Neither</option>
                </select>
              </div>

              {/* Milk Production */}
              <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold">Milk Production:</span>
                <select
                  className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                  value={sim.milk !== 'N/A' && sim.milk ? sim.milk : (sim.baseGender === 'Female' ? 'Yes' : 'No')}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'milk', e.target.value)}
                  title="Can this Sim produce milk? (The Sims 4 option for feeding)"
                >
                  <option value="Yes">🍼 Yes (Can produce)</option>
                  <option value="No">🚫 No (Cannot produce)</option>
                </select>
              </div>

              {/* Toilet Usage */}
              <div className="flex flex-col gap-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                  <span>🚽</span>
                  <span>Toilet Usage:</span>
                </span>
                <select
                  className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700 font-medium cursor-pointer"
                  value={sim.toilet !== 'N/A' && sim.toilet ? sim.toilet : (sim.baseGender === 'Female' ? 'Sitting' : 'Standing')}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'toilet', e.target.value)}
                  title="Toilet Usage (Standing or Sitting)"
                >
                  <option value="Standing">Standing</option>
                  <option value="Sitting">Sitting</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick Profile Summary Footer */}
          {!sim.isPet && sim.occult !== 'Servo' && (
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-300 pt-1.5 border-t border-slate-800/80">
              <span className="font-bold text-sky-400">CAS Summary:</span>
              <span>{sim.baseGender === 'Female' ? '♀ Female' : sim.baseGender === 'Non-Binary' ? '⚧ Non-Binary' : '♂ Male'}</span>
              <span className="text-slate-600">·</span>
              <span>{sim.pronouns || (sim.baseGender === 'Female' ? 'She/Her' : sim.baseGender === 'Non-Binary' ? 'They/Them' : 'He/Him')}</span>
              <span className="text-slate-600">·</span>
              <span>{sim.gender !== 'N/A' && sim.gender ? `${sim.gender} Frame` : (sim.baseGender === 'Female' ? 'Feminine Frame' : 'Masculine Frame')}</span>
              <span className="text-slate-600">·</span>
              <span>{sim.pref !== 'N/A' && sim.pref ? (sim.pref === 'Feminine' ? '👗 Feminine' : '👕 Masculine') : (sim.baseGender === 'Female' ? '👗 Feminine' : '👕 Masculine')}</span>
              <span className="text-slate-600">·</span>
              <span className={(sim.milk === 'Yes' || (!sim.milk && sim.baseGender === 'Female')) ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                {(sim.milk === 'Yes' || (!sim.milk && sim.baseGender === 'Female')) ? '🍼 Produces Milk' : '🚫 No Milk'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-200">
                🚽 Toilet: <strong className="text-sky-300">{sim.toilet !== 'N/A' && sim.toilet ? sim.toilet : (sim.baseGender === 'Female' ? 'Sitting' : 'Standing')}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="text-slate-100 text-sm mb-1 flex items-center flex-wrap gap-1">
        <span className="font-bold text-sky-300 text-xs uppercase">State:</span>
        {sim.ghost ? <span className="text-purple-400 font-bold">Ghost 👻</span> : 'Alive 👤'}
        <button className="inline-btn bg-transparent border-none p-0 px-1 text-lg cursor-pointer text-sky-400 hover:scale-125 transition-transform" onClick={() => onToggleGhost(sim.id)} title="Toggle Ghost State">🔄</button>
        {sim.ghost && (
          <>
            | <span className="font-bold text-sky-300 text-xs uppercase">Cause:</span>
            <select
              className="bg-slate-700 text-slate-50 text-xs p-1 rounded ml-1 border border-slate-600"
              value={sim.cause}
              onChange={(e) => onUpdateDeath(sim.id, e.target.value)}
            >
              {getDeathOptions(sim).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </>
        )}
      </div>

      {!sim.isPet && (
        <div className="text-slate-100 text-sm mb-1 flex items-center gap-1">
          <span className="font-bold text-sky-300 text-xs uppercase">Occult:</span>
          <select
            className="bg-slate-700 text-slate-50 text-xs p-1 rounded border border-slate-600"
            value={sim.occult}
            onChange={(e) => onOccultChange(sim.id, e.target.value)}
          >
            <option value="None">None</option>
            {db.occults.filter(o => !isLegacyMode || sim.familyUnitRole === "Helper" || o !== "Servo").map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <button className="inline-btn bg-transparent border-none p-0 px-1 text-lg cursor-pointer text-sky-400 hover:scale-125 transition-transform" onClick={() => onRerollOccult(sim.id)} title="Reroll Occult Type">🔄</button>
        </div>
      )}

      {sim.occult === 'Imaginary Friend' && (
        <div className="bg-pink-950/60 border border-pink-500/50 p-2.5 rounded-lg my-2 text-xs shadow-inner space-y-2">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>{sim.isMadeReal ? '🌟' : '🧸'}</span>
              <span>{sim.isMadeReal ? 'Imaginary Friend (Made Real)' : 'Bound Imaginary Friend Companion'}</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${sim.isMadeReal ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : (sim.isDoll ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-pink-900/80 text-pink-200 border-pink-700/50')}`}>
              {sim.isMadeReal ? 'Household Member ✨' : (sim.isDoll ? 'Doll Keepsake 🧸' : (sim.stage === 'Teen' ? 'Teen Decision' : 'Child / Toddler Companion'))}
            </span>
          </div>

          {/* Bound Sim Selector */}
          {eligibleCompanionSims.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Bound to:</span>
              <select
                className="bg-slate-800 text-pink-200 text-xs p-1.5 rounded border border-pink-500/50 font-semibold flex-1"
                value={sim.linkedSimId || ""}
                onChange={(e) => onUpdateLinkedSim && onUpdateLinkedSim(sim.id, Number(e.target.value))}
              >
                <option value="">-- Choose Household Companion --</option>
                {eligibleCompanionSims.map(c => (
                  <option key={c.id} value={c.id}>
                    Sim {c.id} ({c.stage})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-amber-300 text-xs font-medium">
              ⚠️ Must be linked to a Sim in the household to bind this Imaginary Friend.
            </div>
          )}

          {/* Teen Progression: Make Real (Join Household) or Stay a Doll */}
          {(sim.stage === 'Teen' || sim.stage === 'Young Adult' || sim.isMadeReal || sim.isDoll || (sim.linkedSimId && ['Teen', 'Young Adult'].includes(household.find(s => s.id === sim.linkedSimId)?.stage || ''))) && (
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-purple-500/50 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-amber-300 text-[11px] flex items-center gap-1">
                  <span>⚡</span>
                  <span>Teen Status: Potential Household Member or Stay a Doll</span>
                </span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                {sim.isMadeReal
                  ? '✨ This Imaginary Friend took the Metamorphium Potion, became REAL, and is now an active playable Teen member of the household!'
                  : '🧸 An Imaginary Friend starts as a Child companion. At the Teen stage, they can either drink the potion to become a real playable household member, or remain in doll form as a childhood keepsake.'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {!sim.isMadeReal ? (
                  <>
                    <button
                      onClick={() => onMakeImaginaryFriendReal?.(sim.id)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      title="Bring to life using the Metamorphium Potion to join the household as a real Teen member"
                    >
                      <span>✨</span>
                      <span>Turn Real (Join Household as Teen)</span>
                    </button>
                    <button
                      onClick={() => onKeepImaginaryFriendAsDoll?.(sim.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
                        sim.isDoll
                          ? 'bg-purple-950 text-purple-200 border-purple-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-700/60'
                      }`}
                      title="Keep this companion in doll form as a cherished toy/keepsake"
                    >
                      <span>🧸</span>
                      <span>{sim.isDoll ? 'Staying a Doll (Keepsake ✓)' : 'Stay a Doll (Keepsake)'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onKeepImaginaryFriendAsDoll?.(sim.id)}
                    className="bg-slate-800 hover:bg-purple-950 text-purple-300 hover:text-white border border-purple-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    title="Revert back to inert doll form"
                  >
                    <span>🧸</span>
                    <span>Revert Back to Doll Form</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!sim.isPet && sim.occult !== 'Imaginary Friend' && (sim.stage === 'Toddler' || sim.stage === 'Child' || sim.stage === 'Teen' || linkedImaginaryFriend) && (
        <div className="my-2">
          {linkedImaginaryFriend ? (
            <div className="bg-pink-950/50 border border-pink-500/60 p-2.5 rounded-lg text-xs flex items-center justify-between flex-wrap gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{linkedImaginaryFriend.isMadeReal ? '✨' : '🧸'}</span>
                <div>
                  <span className="font-bold text-pink-300 uppercase block text-[10px] tracking-wider">
                    {linkedImaginaryFriend.isMadeReal
                      ? '🌟 Imaginary Friend (Turned Real • Teen Member)'
                      : (sim.stage === 'Toddler' ? '🧸 Toddler Special Doll' : (sim.stage === 'Child' ? '🧸 Child Imaginary Friend' : '🧸 Teen Companion Doll'))}
                  </span>
                  <span className="text-slate-100 font-medium">
                    Bound Companion: <span className="text-pink-300 font-bold">Sim {linkedImaginaryFriend.id}</span> ({linkedImaginaryFriend.stage}{linkedImaginaryFriend.isMadeReal ? ' • Real Member' : ' • Doll'})
                  </span>
                </div>
              </div>

              {/* Quick actions for Teen */}
              {(sim.stage === 'Teen' || linkedImaginaryFriend.stage === 'Teen') && (
                <div className="flex items-center gap-1.5">
                  {!linkedImaginaryFriend.isMadeReal ? (
                    <>
                      <button
                        onClick={() => onMakeImaginaryFriendReal?.(linkedImaginaryFriend.id)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2 py-1 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        title="Make this Imaginary Friend real so they join the household as a Teen"
                      >
                        <span>✨</span>
                        <span>Make Real (Join Household)</span>
                      </button>
                      <button
                        onClick={() => onKeepImaginaryFriendAsDoll?.(linkedImaginaryFriend.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-700/60 px-2 py-1 rounded text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        title="Keep companion in doll form"
                      >
                        <span>🧸</span>
                        <span>Stay a Doll</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onKeepImaginaryFriendAsDoll?.(linkedImaginaryFriend.id)}
                      className="bg-slate-800 hover:bg-purple-950 text-purple-300 px-2 py-1 rounded text-[11px] font-bold border border-purple-700 cursor-pointer flex items-center gap-1"
                      title="Revert back to doll form"
                    >
                      <span>🧸</span>
                      <span>Revert to Doll</span>
                    </button>
                  )}
                </div>
              )}

              {sim.stage !== 'Teen' && !linkedImaginaryFriend.isMadeReal && (
                <span className="text-xs bg-pink-900/80 text-pink-200 border border-pink-700/60 px-2.5 py-1 rounded-md font-bold shadow-sm">
                  ✨ Special Doll Active
                </span>
              )}
            </div>
          ) : (
            (sim.stage === 'Toddler' || sim.stage === 'Child') && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between flex-wrap gap-2 ${
                sim.stage === 'Toddler' 
                  ? 'bg-purple-950/60 border border-purple-500/60 shadow-md' 
                  : 'bg-slate-800/80 border border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧸</span>
                  <div>
                    <span className="font-bold text-purple-300 uppercase block text-[10px] tracking-wider flex items-center gap-1.5">
                      <span>{sim.stage === 'Toddler' ? '👶 Toddler Imaginary Friend Doll' : '🧸 Imaginary Friend'}</span>
                      {sim.stage === 'Toddler' && (
                        <span className="bg-purple-900 text-purple-200 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          25% Roll
                        </span>
                      )}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {sim.stage === 'Toddler' 
                        ? 'Roll to receive the special Imaginary Friend doll in the mail!' 
                        : 'None attached (25% roll on age-up)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded text-xs font-bold transition-all shadow active:scale-95 cursor-pointer flex items-center gap-1"
                    onClick={() => onRollImaginaryFriend && onRollImaginaryFriend(sim.id)}
                    title="Roll 25% chance to manifest an Imaginary Friend doll for this Toddler"
                  >
                    <span>🎲</span>
                    <span>Roll (25%)</span>
                  </button>
                  <button
                    className="bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-1.5 rounded text-xs font-bold transition-all shadow active:scale-95 cursor-pointer flex items-center gap-1"
                    onClick={() => onAttachImaginaryFriend && onAttachImaginaryFriend(sim.id)}
                    title="Guaranteed: Attach an Imaginary Friend doll to this Sim"
                  >
                    <span>➕</span>
                    <span>Attach Doll</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-gray-700">
        {sim.isFunctional && (
          <div className="bg-pink-950/25 border border-pink-700/50 p-2.5 rounded-xl my-2 shadow-sm space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1 border-b border-pink-900/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">💖</span>
                <span className="font-bold text-pink-300 text-xs uppercase tracking-wider">
                  Romance & Sexual Orientation
                </span>
              </div>
              <span className="text-[10px] bg-pink-900/60 text-pink-200 border border-pink-700/60 px-2 py-0.5 rounded font-bold">
                Lovestruck & CAS
              </span>
            </div>

            {/* Sexual Orientation & Exploring Romantically Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Romantic Attraction */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Romantic Attraction:</span>
                  <span className="text-[11px] font-bold text-pink-200">
                    {sim.attracted ? `Attracted to ${sim.attracted}` : 'Both'}
                  </span>
                </div>
                <select
                  className="bg-slate-800 text-pink-100 text-[11px] font-semibold px-2 py-1 rounded border border-pink-700/60 cursor-pointer"
                  value={sim.attracted || "Both"}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'attracted', e.target.value)}
                  title="Romantically Attracted To (The Sims 4 CAS option)"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Both">Both (Men & Women)</option>
                  <option value="Neither">Neither (Aromantic)</option>
                </select>
              </div>

              {/* Exploring Romantically */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Exploring Romantically:</span>
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${sim.exploring === 'Yes' ? 'text-emerald-300' : 'text-slate-400'}`}>
                    <span>{sim.exploring === 'Yes' ? '✨ Exploring' : '🔒 Not Exploring'}</span>
                  </span>
                </div>
                <select
                  className={`text-[11px] font-semibold px-2 py-1 rounded border cursor-pointer ${
                    sim.exploring === 'Yes'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  value={sim.exploring || "Yes"}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'exploring', e.target.value)}
                  title="Exploring Romantically: Is this Sim open to exploring romance with other Sims? (The Sims 4 Lovestruck / CAS option)"
                >
                  <option value="Yes">✨ Yes (Exploring Romantically)</option>
                  <option value="No">🔒 No (Not Exploring / Settled)</option>
                </select>
              </div>

              {/* WooHoo Interests */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">WooHoo Interests:</span>
                  <span className="text-[11px] font-bold text-purple-200">
                    {sim.woohoo || "Both"}
                  </span>
                </div>
                <select
                  className="bg-slate-800 text-purple-100 text-[11px] font-semibold px-2 py-1 rounded border border-purple-700/60 cursor-pointer"
                  value={sim.woohoo || "Both"}
                  onChange={(e) => onUpdateCustomGender?.(sim.id, 'woohoo', e.target.value)}
                  title="WooHoo Interests (The Sims 4 CAS option)"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Both">Both</option>
                  <option value="None">None (Asexual)</option>
                </select>
              </div>

              {/* Lovestruck Romantic Dynamic */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Romantic Dynamic:</span>
                  <span className="text-[11px] font-bold text-amber-300">
                    {sim.romanticDynamic ? `❤️ ${sim.romanticDynamic}` : 'None (Neutral)'}
                  </span>
                </div>
                <select
                  className="bg-slate-800 text-amber-200 text-[11px] font-semibold px-2 py-1 rounded border border-amber-700/60 cursor-pointer"
                  value={sim.romanticDynamic || "None"}
                  onChange={(e) => onUpdateSimDynamic?.(sim.id, undefined, e.target.value === "None" ? undefined : e.target.value)}
                  title="Lovestruck Romantic Dynamic for this Sim"
                >
                  <option value="None">None (Neutral)</option>
                  <option value="Wholesome">❤️ Wholesome</option>
                  <option value="Steamy">🔥 Steamy</option>
                  <option value="Strained">⚡ Strained</option>
                  <option value="Unpredictable">🎲 Unpredictable</option>
                </select>
              </div>
            </div>

            {/* Romance Jealousy Mechanics - Retained & Enhanced for Romance Situations */}
            {sim.bounds && (
              <div className="bg-rose-950/40 border border-rose-900/60 p-2 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between text-rose-300 font-bold text-[11px] flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <span>💔</span>
                    <span>Romance Jealousy Situations & Boundaries:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${sim.bounds.flex === 'Yes' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                      {sim.bounds.flex === 'Yes' ? '🤝 Flexible Boundaries' : '🔒 Strict Boundaries'}
                    </span>
                    <button
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-rose-200 px-1.5 py-0.5 rounded border border-slate-700 font-semibold cursor-pointer"
                      onClick={() => {
                        const newFlex = sim.bounds?.flex === 'Yes' ? 'No' : 'Yes';
                        onUpdateCustomGender?.(sim.id, 'bounds', { ...sim.bounds, flex: newFlex } as any);
                      }}
                      title="Toggle Flexible vs Strict Boundaries"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Non-Physical (Flirting):</span>
                    <button
                      className={`text-[10px] font-bold text-left cursor-pointer hover:underline ${sim.bounds.nonphys === 'Yes' ? 'text-rose-400' : 'text-slate-400'}`}
                      onClick={() => {
                        const newVal = sim.bounds?.nonphys === 'Yes' ? 'No' : 'Yes';
                        onUpdateCustomGender?.(sim.id, 'bounds', { ...sim.bounds, nonphys: newVal } as any);
                      }}
                      title="Click to toggle jealousy trigger"
                    >
                      {sim.bounds.nonphys === 'Yes' ? '⚡ Triggers Jealousy' : '✓ Permitted (No Jealousy)'}
                    </button>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Physical (Kissing):</span>
                    <button
                      className={`text-[10px] font-bold text-left cursor-pointer hover:underline ${sim.bounds.phys === 'Yes' ? 'text-rose-400' : 'text-slate-400'}`}
                      onClick={() => {
                        const newVal = sim.bounds?.phys === 'Yes' ? 'No' : 'Yes';
                        onUpdateCustomGender?.(sim.id, 'bounds', { ...sim.bounds, phys: newVal } as any);
                      }}
                      title="Click to toggle jealousy trigger"
                    >
                      {sim.bounds.phys === 'Yes' ? '⚡ Triggers Jealousy' : '✓ Permitted (No Jealousy)'}
                    </button>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">WooHoo (Intimacy):</span>
                    <button
                      className={`text-[10px] font-bold text-left cursor-pointer hover:underline ${sim.bounds.woo === 'Yes' ? 'text-rose-400' : 'text-slate-400'}`}
                      onClick={() => {
                        const newVal = sim.bounds?.woo === 'Yes' ? 'No' : 'Yes';
                        onUpdateCustomGender?.(sim.id, 'bounds', { ...sim.bounds, woo: newVal } as any);
                      }}
                      title="Click to toggle jealousy trigger"
                    >
                      {sim.bounds.woo === 'Yes' ? '⚡ Triggers Jealousy' : '✓ Permitted (No Jealousy)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-2.5 rounded-md mt-2.5 border-l-4 border-indigo-400 text-xs">
        {/* Family Unit / Role Header Tag */}
        <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-800 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sim.branchBadge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {sim.branchName || "Household Member"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {otherHouseholdSims.length} other {otherHouseholdSims.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Unified Household Relationships List */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider block">
              Household Relationships:
            </span>
          </div>

          {otherHouseholdSims.length > 0 ? (
            <div className="space-y-1.5">
              {otherHouseholdSims.map((other) => {
                const pairData = sim.pairwiseRelations?.[other.id];
                const rawRel = pairData?.rawRel || "Not Related";
                const formatted = pairData?.formattedRel || "Not Related";
                const isBothNonPets = !sim.isPet && !other.isPet;
                const isOtherIF = other.occult === 'Imaginary Friend';
                const isThisIF = sim.occult === 'Imaginary Friend';
                const canEditRelation = isBothNonPets && !isOtherIF && !isThisIF;
                const isOtherFem = other.baseGender === "Female";
                const isOtherMale = other.baseGender === "Male";

                const directRel = sim.customRelations?.[other.id] || (["Spouse", "Engaged", "Partner", "WooHoo Partner", "Sibling", "Parent", "Child"].includes(rawRel) ? rawRel : "Not Related");

                // Determine possible direct options per Sims 4 CAS rules
                const possibleDirect = getPossiblePairRelations(sim, other, false, true);
                const availableRelations = Array.from(new Set(["Not Related", ...possibleDirect, directRel]));

                const getCasLabel = (relKey: string) => {
                  switch (relKey) {
                    case "Not Related": return "Household Member";
                    case "Sibling": return isOtherFem ? "Sister" : isOtherMale ? "Brother" : "Sibling";
                    case "Spouse": return "Spouse";
                    case "Engaged": return "Engaged";
                    case "Partner": return "Partner";
                    case "WooHoo Partner": return "WooHoo Partner 🔥";
                    case "Parent": return isOtherFem ? "Mother" : isOtherMale ? "Father" : "Parent";
                    case "Child": return isOtherFem ? "Daughter" : isOtherMale ? "Son" : "Child";
                    default: return relKey;
                  }
                };

                const casOrder = ["Not Related", "Sibling", "Spouse", "Engaged", "Partner", "WooHoo Partner", "Parent", "Child"];
                const sortedOptions = casOrder.filter(k => availableRelations.includes(k));

                return (
                  <div
                    key={other.id}
                    className="p-1.5 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2 flex-wrap text-xs"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap min-w-[120px]">
                      <span className="font-bold text-sky-200">
                        Sim {other.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({other.stage}{other.isPet ? ` 🐾 ${other.species}` : ''}):
                      </span>
                      <span
                        className="font-semibold text-slate-100"
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                      {pairData?.dynamicStr && (
                        <span dangerouslySetInnerHTML={{ __html: pairData.dynamicStr }} />
                      )}
                    </div>

                    {canEditRelation && (
                      <div className="flex items-center gap-1 ml-auto flex-wrap">
                        <select
                          className={`text-[11px] px-2 py-0.5 rounded border border-slate-700 font-semibold focus:border-sky-500 bg-slate-900 transition-colors ${
                            directRel === "Not Related" ? "text-emerald-400 font-bold" : "text-sky-200"
                          }`}
                          value={directRel}
                          onChange={(e) => onUpdatePairRelation && onUpdatePairRelation(sim.id, other.id, e.target.value)}
                          title={`Set CAS relationship between Sim ${sim.id} and Sim ${other.id}`}
                        >
                          {sortedOptions.map(opt => (
                            <option
                              key={opt}
                              value={opt}
                              className={opt === "Not Related" ? "text-emerald-400 font-bold bg-slate-900" : "text-slate-100 bg-slate-900"}
                            >
                              {getCasLabel(opt)}
                            </option>
                          ))}
                        </select>

                        {/* Editable Dynamic with this Family Member or Child */}
                        {directRel !== "Not Related" && onUpdatePairDynamic && (() => {
                          const isRomanceRel = ["Spouse", "Partner", "Engaged", "WooHoo Partner"].includes(directRel);
                          const dynOptions = isRomanceRel
                            ? ["None", "Wholesome", "Steamy", "Strained", "Unpredictable"]
                            : ["None", "Close", "Distant", "Jokesters", "Difficult"];
                          
                          const activeDynamic = sim.customDynamics?.[other.id] || other.customDynamics?.[sim.id] || pairData?.dynamic || "None";

                          return (
                            <select
                              className="text-[10px] px-1.5 py-0.5 rounded border border-pink-700/60 bg-pink-950/80 text-pink-200 font-semibold cursor-pointer"
                              value={activeDynamic}
                              onChange={(e) => onUpdatePairDynamic(sim.id, other.id, e.target.value)}
                              title={`Set Family/Romance dynamic between Sim ${sim.id} and Sim ${other.id}`}
                            >
                              <option value="None">Dynamic: None</option>
                              {dynOptions.filter(d => d !== "None").map(d => (
                                <option key={d} value={d}>
                                  {isRomanceRel ? `❤️ ${d}` : `👨‍👩‍👧 ${d}`}
                                </option>
                              ))}
                            </select>
                          );
                        })()}

                        {onRerollPairRelation && (
                          <button
                            className="inline-btn bg-transparent border-none p-0 px-1 text-sm cursor-pointer text-amber-400 hover:scale-125 transition-transform"
                            onClick={() => onRerollPairRelation(sim.id, other.id)}
                            title={`Reroll relation between Sim ${sim.id} and Sim ${other.id}`}
                          >
                            🔄
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-1 text-sm border-b border-slate-800 pb-1 flex items-center gap-1 text-slate-400 italic">
              Living Alone (No other Sims in household)
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
          <span className="font-bold text-sky-300 text-xs uppercase flex items-center gap-1">
            <span>🎭</span>
            <span>Traits ({sim.traits.length}):</span>
          </span>
          <span className="text-[10px] text-slate-400">
            Selectable & Re-rollable for mishap recovery
          </span>
        </div>

        {/* Selectable Trait Slots */}
        {sim.traits.length > 0 ? (
          <div className="space-y-1.5 my-2">
            {sim.traits.map((t, idx) => {
              const otherTraits = sim.traits.filter((_, i) => i !== idx);
              const validOptions = pool.filter(opt => opt !== t && !otherTraits.includes(opt) && !otherTraits.some(ot => masterConflicts[ot]?.has(opt)));
              
              return (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-1.5 rounded-lg text-xs">
                  <span className="text-[10px] font-bold text-sky-400 font-mono min-w-[20px] bg-slate-900 px-1 py-0.5 rounded text-center">
                    #{idx + 1}
                  </span>

                  {/* Direct Dropdown to Select / Swap Trait */}
                  <select
                    className={`text-xs p-1 rounded border flex-1 font-semibold focus:outline-none cursor-pointer ${
                      isLockedByRandomFun
                        ? 'bg-slate-900/60 text-slate-400 border-slate-800 cursor-not-allowed opacity-80'
                        : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-sky-400'
                    }`}
                    value={t}
                    disabled={isLockedByRandomFun}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      if (chosen && chosen !== t) {
                        if (onUpdateTrait) {
                          onUpdateTrait(sim.id, idx, chosen);
                        } else {
                          onRemoveTrait(sim.id, t);
                          onAddTrait(sim.id, chosen);
                        }
                      }
                    }}
                    title={isLockedByRandomFun ? "Trait selection locked by Misc Fun #1 (Random)" : "Select or change this trait (mishap recovery)"}
                  >
                    <option value={t}>{t} (Current)</option>
                    {!isLockedByRandomFun && (
                      <>
                        <optgroup label={`Valid for ${sim.stage} (${validOptions.length} traits)`}>
                          {validOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!sim.isPet && (
                          <optgroup label="All Personality Traits (Override / Mishap Fix)">
                            {allHumanTraits
                              .filter(opt => opt !== t && !otherTraits.includes(opt))
                              .map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                          </optgroup>
                        )}
                      </>
                    )}
                  </select>

                  {/* Re-roll single trait slot button */}
                  {!isLockedByRandomFun && onRerollSingleTraitSlot && (
                    <button
                      className="bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-300 p-1 px-1.5 rounded text-xs transition-all font-bold border border-slate-700 shadow-sm"
                      onClick={() => onRerollSingleTraitSlot(sim.id, idx)}
                      title={`Re-roll trait #${idx + 1}`}
                    >
                      🎲
                    </button>
                  )}

                  {/* Delete trait slot */}
                  {!isLockedByRandomFun && (
                    <button
                      className="bg-slate-800 hover:bg-red-700 text-red-400 hover:text-white p-1 px-1.5 rounded text-xs transition-all font-bold border border-slate-700"
                      onClick={() => onRemoveTrait(sim.id, t)}
                      title="Remove this trait"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-1">
            No traits assigned yet.
          </div>
        )}

        {sim.isPet && sim.supplementaryTraits && sim.supplementaryTraits.length > 0 && (
          <div className="mt-2">
             <span className="font-bold text-sky-300 text-xs uppercase block mb-1">Supplementary Options:</span>
             <div className="flex flex-wrap gap-1">
               {sim.supplementaryTraits.map(t => (
                 <span key={t} className="inline-flex items-center bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-xs border border-slate-600 border-dashed">
                   {t}
                 </span>
               ))}
             </div>
          </div>
        )}

        {sim.occult === 'Servo' && (
          <>
            <span className="font-bold text-sky-300 text-xs uppercase block mt-2">Behavior Modules:</span>
            <div className="my-1.5 flex flex-wrap gap-1">
              {sim.modules.map(m => (
                <span key={m} className="inline-flex items-center bg-teal-900 text-teal-100 px-2 py-1 rounded-md text-xs border border-teal-500">⚙️ {m}</span>
              ))}
            </div>
          </>
        )}

        {/* Add Trait Selector Row */}
        {isLockedByRandomFun ? (
          <div className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-800/80 p-2 rounded-lg font-semibold flex items-center gap-1.5 mt-2 shadow-inner">
            <span>🔒</span>
            <span>Trait customization locked by Misc Fun #1 (Random): Traits must be kept randomly as generated!</span>
          </div>
        ) : (
          <div className="flex gap-1.5 items-center mt-2 flex-wrap">
            <select 
              id={`addTrait_${sim.id}`} 
              className="bg-slate-800 text-slate-100 text-xs p-1.5 rounded flex-1 min-w-[140px] border border-slate-700 font-medium cursor-pointer"
              defaultValue=""
            >
              <option value="">+ Add / Select Valid Trait...</option>
              <optgroup label={`Standard ${sim.stage} Pool (${traitOpts.length})`}>
                {traitOpts.map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              {!sim.isPet && (
                <optgroup label="All Other Traits (Override)">
                  {allHumanTraits
                    .filter(t => !sim.traits.includes(t))
                    .map(t => <option key={t} value={t}>{t}</option>)}
                </optgroup>
              )}
            </select>
            <button 
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-2.5 py-1.5 rounded font-bold transition-all shadow flex items-center gap-1" 
              onClick={handleAddTrait} 
              title="Add Selected Trait"
            >
              <span>➕</span>
              <span>Add</span>
            </button>
            <button
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs px-2.5 py-1.5 rounded font-bold transition-all shadow flex items-center gap-1"
              onClick={() => {
                if (traitOpts.length > 0) {
                  onAddTrait(sim.id, roll(traitOpts));
                }
              }}
              title="Roll and add a random valid trait"
            >
              <span>🎲</span>
              <span>Roll Valid</span>
            </button>
          </div>
        )}

        {sim.hobby !== "N/A" && (() => {
          const skillInfo = skillsByName[sim.hobby];
          return (
            <div className="bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 my-2 shadow-sm">
              <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>{skillInfo?.icon || '⚡'}</span>
                  <span>Primary Skill / Hobby</span>
                </span>
                <div className="flex items-center gap-1">
                  {onOpenSkillsGuide && (
                    <button
                      className="bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-500/40 transition-all flex items-center gap-1"
                      onClick={() => onOpenSkillsGuide(sim)}
                      title="Open full skills database and guide"
                    >
                      📖 Guide
                    </button>
                  )}
                  <button className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-sky-400 hover:scale-125 transition-transform" onClick={() => onInject(sim.id, 'hobby')} title="Inject Last Rolled Skill">📥</button>
                  {!isLockedByRandomFun ? (
                    <button className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-amber-400 hover:scale-125 transition-transform" onClick={() => onRerollHobby(sim.id)} title="Reroll Hobby">🔄</button>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-bold px-1" title="Skill/Hobby locked by Misc Fun #1 (Random)">🔒</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>{sim.hobby}</span>
                  {skillInfo && (
                    <span className="text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                      Max Lvl {skillInfo.maxLevel}
                    </span>
                  )}
                </div>
                {skillInfo && (
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {skillInfo.pack}
                  </span>
                )}
              </div>

              {skillInfo?.mentorFrom && (
                <div className="mt-1.5 text-[10px] text-amber-300/80 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-600/20">
                  <span className="font-semibold text-amber-200">Mentoring: </span>
                  {skillInfo.mentorLevel ? `Level ${skillInfo.mentorLevel} from ${skillInfo.mentorFrom}` : `From ${skillInfo.mentorFrom}`}
                </div>
              )}
            </div>
          );
        })()}

        {/* Child Fundamentals Widget */}
        {sim.stage === "Child" && (
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 my-2 shadow-sm">
            <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-800">
              <span className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🧒</span>
                <span>Child Fundamentals (1–10)</span>
              </span>
              <div className="flex items-center gap-1">
                {onRerollChildSkills && (
                  <button
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-semibold"
                    onClick={() => onRerollChildSkills(sim.id)}
                    title="Re-roll Child Fundamental Skills"
                  >
                    🎲 Roll
                  </button>
                )}
                {onMaxChildSkills && (
                  <button
                    className="text-[10px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded transition-all"
                    onClick={() => onMaxChildSkills(sim.id)}
                    title="Max all child skills to Level 10 (Mastery)"
                  >
                    ⭐ Max All
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(["Creativity", "Mental", "Motor", "Social"] as const).map(skillName => {
                const lvl = sim.childSkills?.[skillName] || 1;
                const icons: Record<string, string> = { Creativity: "🎨", Mental: "🧠", Motor: "🏃", Social: "🗣️" };
                return (
                  <div key={skillName} className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                      <span>{icons[skillName]}</span>
                      <span>{skillName}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {onUpdateChildSkill && (
                        <button
                          className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                          onClick={() => onUpdateChildSkill(sim.id, skillName, Math.max(1, lvl - 1))}
                        >
                          -
                        </button>
                      )}
                      <span className={`text-[11px] font-mono font-bold px-1 ${lvl >= 10 ? 'text-amber-300' : 'text-sky-300'}`}>
                        {lvl}
                      </span>
                      {onUpdateChildSkill && (
                        <button
                          className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                          onClick={() => onUpdateChildSkill(sim.id, skillName, Math.min(10, lvl + 1))}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {sim.unlockedAdultSkills && sim.unlockedAdultSkills.length > 0 && (
              <div className="mt-2 text-[10px] bg-emerald-950/40 text-emerald-200 border border-emerald-500/30 p-1.5 rounded">
                <span className="font-bold">⭐ Unlocked Adult Skills: </span>
                <span>{sim.unlockedAdultSkills.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Toddler Fundamentals Widget */}
        {sim.stage === "Toddler" && (() => {
          const tSkills = sim.toddlerSkills || { Communication: 2, Imagination: 2, Movement: 2, Potty: 1, Thinking: 2 };
          const conversion = calculateChildSkillsFromToddler(tSkills);
          return (
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 my-2 shadow-sm">
              <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-800">
                <span className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>👶</span>
                  <span>Toddler Fundamentals (1–5)</span>
                </span>
                {onOpenSkillsGuide && (
                  <button
                    className="bg-amber-600/30 hover:bg-amber-600/60 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/40 transition-all flex items-center gap-1"
                    onClick={() => onOpenSkillsGuide(sim)}
                    title="View Toddler Aging Conversion Calculator"
                  >
                    ⚡ Aging Preview
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {(["Communication", "Imagination", "Movement", "Thinking", "Potty"] as (keyof ToddlerSkills)[]).map(skillName => {
                  const lvl = tSkills[skillName] || 1;
                  const maxLvl = skillName === "Potty" ? 3 : 5;
                  const icons: Record<string, string> = { Communication: "🗣️", Imagination: "🦄", Movement: "🏃‍♂️", Thinking: "💡", Potty: "🚽" };
                  return (
                    <div key={skillName} className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between">
                      <span className="text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                        <span>{icons[skillName]}</span>
                        <span>{skillName}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {onUpdateToddlerSkill && (
                          <button
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                            onClick={() => onUpdateToddlerSkill(sim.id, skillName, Math.max(1, lvl - 1))}
                          >
                            -
                          </button>
                        )}
                        <span className={`text-[11px] font-mono font-bold px-1 ${lvl >= maxLvl ? 'text-amber-300' : 'text-sky-300'}`}>
                          {lvl}/{maxLvl}
                        </span>
                        {onUpdateToddlerSkill && (
                          <button
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                            onClick={() => onUpdateToddlerSkill(sim.id, skillName, Math.min(maxLvl, lvl + 1))}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {conversion.awardedBonusTrait && (
                <div className="mt-2 text-[10px] bg-amber-950/50 text-amber-200 border border-amber-500/40 p-1.5 rounded font-bold flex items-center justify-between">
                  <span>🏆 Aging Bonus Qualified: {conversion.awardedBonusTrait}</span>
                  <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                    {conversion.isTopNotch ? '+25% skill & career' : '+10% all skill'}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Horse Skills Widget */}
        {sim.isPet && sim.species === "Horse" && (
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 my-2 shadow-sm">
            <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-800">
              <span className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🐎</span>
                <span>Horse Skills (1–10)</span>
              </span>
              <span className="text-[10px] text-slate-400">Horse Ranch</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(["Agility", "Endurance", "Jumping", "Temperament"] as (keyof HorseSkills)[]).map(skillName => {
                const lvl = sim.horseSkills?.[skillName] || 3;
                const icons: Record<string, string> = { Agility: "🐎", Endurance: "🏃‍♂️", Jumping: "🚧", Temperament: "❤️" };
                return (
                  <div key={skillName} className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                      <span>{icons[skillName]}</span>
                      <span>{skillName}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {onUpdateHorseSkill && (
                        <button
                          className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                          onClick={() => onUpdateHorseSkill(sim.id, skillName, Math.max(1, lvl - 1))}
                        >
                          -
                        </button>
                      )}
                      <span className={`text-[11px] font-mono font-bold px-1 ${lvl >= 10 ? 'text-amber-300' : 'text-sky-300'}`}>
                        {lvl}
                      </span>
                      {onUpdateHorseSkill && (
                        <button
                          className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-700"
                          onClick={() => onUpdateHorseSkill(sim.id, skillName, Math.min(10, lvl + 1))}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {sim.asp !== "N/A" && (
          <div className="text-slate-100 text-sm mb-2">
            {sim.stage === "Child" ? (
              <div className="bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 my-1.5 shadow-sm">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1">
                    🎯 Child Aspiration
                  </span>
                  <div className="flex items-center gap-1">
                    {onOpenChildAspirationModal && (
                      <button
                        className="bg-sky-600/30 hover:bg-sky-600/60 text-sky-200 text-[11px] font-semibold px-2 py-0.5 rounded border border-sky-500/40 transition-all flex items-center gap-1"
                        onClick={() => onOpenChildAspirationModal(sim)}
                        title="Open Milestones & Requirements Tracker"
                      >
                        📋 Milestones
                      </button>
                    )}
                    <button
                      className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-amber-400 hover:scale-125 transition-transform"
                      onClick={() => onRerollAspiration(sim.id)}
                      title="Reroll Child Aspiration"
                    >
                      🔄
                    </button>
                    <button
                      className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-sky-400 hover:scale-125 transition-transform"
                      onClick={() => onInject(sim.id, 'asp')}
                      title="Inject Last Rolled Aspiration"
                    >
                      📥
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <select
                    className="bg-slate-800 text-slate-100 text-xs p-1.5 rounded border border-slate-700 font-semibold flex-1 min-w-[170px]"
                    value={sim.asp}
                    onChange={(e) => onSelectChildAspiration ? onSelectChildAspiration(sim.id, e.target.value) : undefined}
                  >
                    {childAspirationCategories.map(cat => (
                      <optgroup key={cat} label={`${cat} Aspirations`}>
                        {childAspirationsByCategory[cat].map(asp => (
                          <option key={asp.name} value={asp.name}>
                            {asp.name} ({asp.packBadge})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Badges for active child aspiration */}
                {(() => {
                  const aspInfo = childAspirationMap[sim.asp];
                  if (!aspInfo) return null;
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${aspInfo.categoryColor.pill}`}>
                          {aspInfo.category}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {aspInfo.packBadge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-300/90 bg-amber-950/30 px-2 py-1 rounded border border-amber-600/30">
                        <span className="text-xs">🏆</span>
                        <span className="font-semibold text-amber-200">Reward:</span>
                        <span className="text-amber-100 font-bold">{aspInfo.rewardTrait.name}</span>
                        {sim.traits.includes(aspInfo.rewardTrait.name) && (
                          <span className="ml-auto text-[9px] bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                            ✓ Owned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (() => {
              const ruleStatus = checkAspirationRuleStatus(sim.asp, sim.career, sim, household);
              const isInverted = ruleOrientation === 'inverted';

              return (
                <div className="bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 my-1.5 shadow-sm">
                  <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-1">
                        🎯 Aspiration:
                      </span>
                      {onToggleRuleOrientation && (
                        <button
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border transition-all ${
                            isInverted
                              ? 'bg-purple-900/80 text-purple-200 border-purple-500 hover:bg-purple-800'
                              : 'bg-sky-950 text-sky-300 border-sky-700 hover:bg-sky-900'
                          }`}
                          onClick={onToggleRuleOrientation}
                          title={isInverted ? "Inverted Mode: Aspiration dictates Career. Click to switch to Standard Mode." : "Standard Mode: Career dictates Aspiration. Click to switch to Inverted Mode."}
                        >
                          {isInverted ? '🔄 Inverted' : '⚖️ Standard'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-sky-400 hover:scale-125 transition-transform" 
                        onClick={() => onInject(sim.id, 'asp')} 
                        title="Inject Last Rolled Aspiration"
                      >
                        📥
                      </button>
                      {!isLockedByRandomFun ? (
                        <button 
                          className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-amber-400 hover:scale-125 transition-transform" 
                          onClick={() => onRerollAspiration(sim.id)} 
                          title={isInverted ? "Reroll Aspiration & Auto-assign matching Career" : "Reroll compatible Aspiration (filtered by career)"}
                        >
                          🔄
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-bold px-1" title="Aspiration re-roll locked by Misc Fun #1 (Random)">🔒</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Aspiration Selector with Rule Enforcement */}
                  <div className="mb-2">
                    <select
                      disabled={isLockedByRandomFun}
                      className={`w-full text-xs p-1.5 rounded border font-semibold cursor-pointer ${
                        isLockedByRandomFun
                          ? 'bg-slate-900/60 text-slate-400 border-slate-800 cursor-not-allowed opacity-80'
                          : ruleStatus.hasCareerConflict 
                            ? 'bg-rose-950/90 text-rose-100 border-rose-500' 
                            : 'bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                      value={sim.asp}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (onSelectAdultAspiration) {
                          onSelectAdultAspiration(sim.id, val);
                        }
                      }}
                      title={isLockedByRandomFun ? "Aspiration locked by Misc Fun #1 (Random)" : undefined}
                    >
                      {sim.stage === "Teen" && (
                        <optgroup label="🎒 Teen Aspirations">
                          {db.aspirationsTeen.map(tAsp => (
                            <option key={tAsp} value={tAsp}>{tAsp}</option>
                          ))}
                        </optgroup>
                      )}
                      {ASPIRATION_CATEGORIES.map(group => (
                        <optgroup key={group.category} label={`${group.icon} ${group.category}`}>
                          {group.aspirations.map(aspObj => {
                            const isAllowed = isAspirationAllowedForCareer(aspObj.name, sim.career);
                            const disabledInStandard = !isInverted && !isAllowed;
                            
                            return (
                              <option 
                                key={aspObj.name} 
                                value={aspObj.name} 
                                disabled={disabledInStandard}
                                className={disabledInStandard ? "text-slate-500 bg-slate-900" : ""}
                              >
                                {disabledInStandard
                                  ? `🔒 ${aspObj.name} (Requires: ${aspObj.requiresCareer})`
                                  : (isInverted && aspObj.requiresCareer
                                      ? `🔄 ${aspObj.name} (Sets: ${aspObj.requiresCareer})`
                                      : (aspObj.requiresCareer 
                                          ? `✓ ${aspObj.name} (💼 Career Match)`
                                          : aspObj.name)
                                    )
                                }
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Conflict Alert Box with 1-Click Fixes */}
                  {ruleStatus.hasCareerConflict && (
                    <div className="mt-1.5 bg-rose-950/70 border border-rose-600/70 p-2 rounded-lg text-xs shadow-sm">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1 text-[11px]">
                        <span>⚠️</span>
                        <span>PieceOfPrincess Career Rule Conflict!</span>
                      </div>
                      <p className="text-rose-200/90 text-[11px] leading-snug mb-1.5">
                        <strong>"{sim.asp}"</strong> requires: {ruleStatus.requiredCareerSummary}.
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {onInvertAlignCareer && (
                          <button
                            className="bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow transition-all flex items-center gap-1"
                            onClick={() => onInvertAlignCareer(sim.id)}
                            title="Invert: Auto-set Sim's career to match this aspiration"
                          >
                            <span>⚡ Invert: Set Career</span>
                          </button>
                        )}
                        {onAlignAspirationToCareer && (
                          <button
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow transition-all flex items-center gap-1"
                            onClick={() => onAlignAspirationToCareer(sim.id)}
                            title="Roll an aspiration that is compatible with current career"
                          >
                            <span>🎲 Roll Valid Aspiration</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Satisfied Career Rule Badge */}
                  {!ruleStatus.hasCareerConflict && ruleStatus.requiredCareerSummary && (
                    <div className="mt-1 text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 p-1.5 rounded flex items-center gap-1 font-medium">
                      <span>💼</span>
                      <span><strong>Legacy Rule Verified:</strong> {ruleStatus.requiredCareerSummary}</span>
                    </div>
                  )}

                  {/* Special Non-Career Restrictions Badge */}
                  {ruleStatus.specialRestrictionText && (
                    <div className="mt-1 text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/60 p-1.5 rounded flex items-center gap-1">
                      <span>🔒</span>
                      <span><strong>Rule Requirement:</strong> {ruleStatus.specialRestrictionText}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {sim.career !== "N/A" && (() => {
        const matchingCareer = getMatchingCareerForAspiration(sim.asp);
        const isInverted = ruleOrientation === 'inverted';
        return (
          <div className="bg-slate-800 p-3 rounded-md my-2.5 border border-dashed border-sky-400 text-slate-300 text-xs relative">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-sky-300 text-xs uppercase">Career:</span>
                {matchingCareer && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isInverted 
                      ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700'
                  }`}>
                    {isInverted ? '🔄 Synced to Aspiration' : `🔒 Linked to "${sim.asp}"`}
                  </span>
                )}
              </div>
              <div className="mt-1.5 leading-snug text-slate-100" dangerouslySetInnerHTML={{ __html: sim.career }} />
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {onRerollCareer && (
                <button className="inline-btn bg-transparent border-none p-0 px-1 text-base cursor-pointer text-amber-400 hover:scale-125 transition-transform" onClick={() => onRerollCareer(sim.id)} title={isInverted ? "Reroll career (constrained by aspiration in inverted mode)" : "Reroll Career"}>🔄</button>
              )}
              <button className="inline-btn bg-transparent border-none p-0 px-1 text-lg cursor-pointer text-sky-400 hover:scale-125 transition-transform" onClick={() => onInject(sim.id, 'career')} title="Inject Last Rolled Job">📥</button>
            </div>
          </div>
        );
      })()}

      <div className="flex gap-2 mt-4 flex-wrap items-center border-t border-gray-700 pt-2.5">
        {!isElder && sim.occult !== 'Servo' && (
          <button className="bg-emerald-500 text-emerald-900 px-3 py-1.5 text-xs rounded font-bold hover:bg-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all" onClick={() => onAgeUp(sim.id)}>⬆️ Age Up</button>
        )}

        {/* Set as Next Heir Button (For Infant, Toddler, Child, Teen) */}
        {!sim.isPet && !sim.isNextHeir && ["Infant", "Toddler", "Child", "Teen"].includes(sim.stage) && onSetNextHeir && (
          <button
            className="bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40 px-2.5 py-1.5 text-xs rounded font-bold transition-all flex items-center gap-1 shadow-sm"
            onClick={() => onSetNextHeir(sim.id)}
            title="Designate this child as the Next Heir for the upcoming generation"
          >
            <span>🌟</span>
            <span>Choose as Next Heir</span>
          </button>
        )}

        {/* Pet Adoption Button (To free up space for children/spouses) */}
        {sim.isPet && onPutPetUpForAdoption && (
          <button
            className="bg-amber-600/20 text-amber-300 border border-amber-600/50 hover:bg-amber-600/40 px-2.5 py-1.5 text-xs rounded font-bold transition-all flex items-center gap-1 shadow-sm"
            onClick={() => onPutPetUpForAdoption(sim.id)}
            title="Put this pet up for adoption to a loving home, freeing up space in the household"
          >
            <span>🏡</span>
            <span>Put Up for Adoption (Free Space)</span>
          </button>
        )}

        {/* Move Out Spare (Manage Households) */}
        {!sim.isPet && !sim.isNextHeir && sim.familyUnitRole !== "Heir" && ["Teen", "Young Adult", "Adult", "Elder"].includes(sim.stage) && onMoveOutSpare && (
          <button
            className="bg-indigo-950/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-600/60 hover:border-indigo-400 px-2.5 py-1.5 text-xs rounded font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            onClick={() => onMoveOutSpare(sim.id)}
            title="Move this Spare (non-heir sibling, cousin, uncle, aunt, or elder) to 'Other Households' via Sims 4 Manage Households to free household space for the next generation"
          >
            <span>📦</span>
            <span>Move Out Spare (Manage Households)</span>
          </button>
        )}

        <button className="bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 text-xs rounded font-bold hover:bg-red-700 hover:text-white transition-all ml-auto" onClick={() => onRemoveSim(sim.id)}>❌ Remove</button>
      </div>
    </div>
  );
};
