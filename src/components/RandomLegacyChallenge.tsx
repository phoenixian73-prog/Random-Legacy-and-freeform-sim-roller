import React, { useState, useEffect, useRef } from 'react';
import {
  packsList,
  maritalStatuses,
  custodySchedules,
  midlifeCrisisAspects,
  rainbowColors,
  moodsList,
  troubledTeenTypes,
  familyDynamicsList,
  romanticDynamicsList,
  LegacyRollResult,
  SecondaryCareerSlot,
  PIECE_OF_PRINCESS_FOUNDER_HOME_RULES,
  PIECE_OF_PRINCESS_GENERAL_RULES,
  PIECE_OF_PRINCESS_DLC_RULES,
  ASPIRATION_CAREER_RULES,
  ASPIRATION_SPECIAL_RESTRICTIONS,
  LegacyRuleEntry,
  LegacyAspirationCareerRule,
  LegacyAspirationRestriction,
  getAspirationRuleCheck,
  getOrdinal,
  getHeirOrderDescription,
  PartyEventGoal,
  TS4_GOALS_AND_REWARDS_PARTIES,
} from '../data/legacyChallengeData';
import {
  rollCompleteLegacyGeneration,
  rollMaritalStatus,
  rollChildren,
  rollHeirCareer,
  rollSecondaryCareer,
  rollAllSecondaryCareers,
  rollGenerationGoal,
  rollMiscFun,
  rollMidlifeCrisisAspects,
  formatCareerLabel,
  populateHouseholdFromLegacy,
  createLegacyChildSim,
  chooseHeirRandomlyAmongSims,
  allPackCodes,
} from '../utils/legacyGenerator';
import { roll, getValidTrait, rollDeathCause, getDeathOptions } from '../utils/generator';
import { db } from '../data/simData';
import { Lot, Sim } from '../types';

interface RandomLegacyChallengeProps {
  currentLot: Lot;
  currentHousehold?: Sim[];
  ruleOrientation?: 'standard' | 'inverted';
  onToggleRuleOrientation?: () => void;
  onApplyToHousehold: (household: Sim[], lot: Lot, notice: string) => void;
  onTriggerNotice: (msg: string) => void;
  onRestoreHouseholdAndLot?: (household: Sim[], lot?: Lot) => void;
  onMemorizeGeneration?: (household: Sim[], lot: Lot, genNumber: number) => void;
  onRollChange?: (roll: LegacyRollResult) => void;
  onChooseRandomHeir?: () => void;
  onRollCompleteNewSim?: (role: 'partner' | 'helper' | 'general') => void;
}

export const RandomLegacyChallenge: React.FC<RandomLegacyChallengeProps> = ({
  currentLot,
  currentHousehold,
  ruleOrientation = 'standard',
  onToggleRuleOrientation,
  onApplyToHousehold,
  onTriggerNotice,
  onRestoreHouseholdAndLot,
  onMemorizeGeneration,
  onRollChange,
  onChooseRandomHeir,
  onRollCompleteNewSim,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enabled packs (default all or restored from localStorage)
  const [enabledPacks, setEnabledPacks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_enabled_packs');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
      }
    } catch (e) {}
    return new Set(allPackCodes);
  });
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  // Active Generation state (restored from localStorage if present)
  const [generationNumber, setGenerationNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_generation_number');
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 1) return num;
      }
    } catch (e) {}
    return 1;
  });

  const [currentRoll, setCurrentRoll] = useState<LegacyRollResult | null>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_current_roll');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.generation === 'number') {
          // Validate schema integrity against outdated or corrupted localStorage formats
          if (!parsed.marital?.entry || !parsed.children || !parsed.heirCareer || !parsed.goal?.entry || !parsed.fun?.entry) {
            return rollCompleteLegacyGeneration(parsed.generation || 1, allPackCodes);
          }
          // Backfill heirOrder and description if not present, preserving the existing generation completely!
          if (!parsed.children?.heirOrder) {
            const count = parsed.children?.targetCount || 1;
            const heirOrder = count > 1 ? Math.floor(Math.random() * count) + 1 : 1;
            parsed.children = {
              ...parsed.children,
              heirOrder,
              heirOrderDescription: getHeirOrderDescription(heirOrder, count)
            };
          }
          return parsed;
        }
      }
    } catch (e) {}
    return rollCompleteLegacyGeneration(1, allPackCodes);
  });

  // History of generations (restored from localStorage)
  const [legacyHistory, setLegacyHistory] = useState<LegacyRollResult[]>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [jokerRerollsAvailable, setJokerRerollsAvailable] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_joker_rerolls');
      if (saved !== null) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 0) return num;
      }
    } catch (e) {}
    return 1; // Default to 1 Starting Joker at challenge start
  });

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showRulesCheatsheet, setShowRulesCheatsheet] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [activeRulesTab, setActiveRulesTab] = useState<'founder' | 'general' | 'dlc' | 'aspirations'>('general');
  const [rulesSearchQuery, setRulesSearchQuery] = useState<string>('');
  const [dlcFilterCategory, setDlcFilterCategory] = useState<string>('all');
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupPasteText, setBackupPasteText] = useState<string>('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [randomHeirConstraintMode, setRandomHeirConstraintMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sims4_legacy_random_heir_constraint') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Minimization toggles for Objectives / Goals and Misc Fun (remembered in localStorage)
  const [isGoalMinimized, setIsGoalMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sims4_legacy_goal_minimized') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isFunMinimized, setIsFunMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sims4_legacy_fun_minimized') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Auto-sync legacy challenge state to localStorage so reload NEVER loses progress
  useEffect(() => {
    try {
      if (currentRoll) {
        localStorage.setItem('sims4_legacy_current_roll', JSON.stringify(currentRoll));
      }
      localStorage.setItem('sims4_legacy_generation_number', String(generationNumber));
      localStorage.setItem('sims4_legacy_history', JSON.stringify(legacyHistory));
      localStorage.setItem('sims4_legacy_joker_rerolls', String(jokerRerollsAvailable));
      localStorage.setItem('sims4_legacy_enabled_packs', JSON.stringify(Array.from(enabledPacks)));
      localStorage.setItem('sims4_legacy_random_heir_constraint', String(randomHeirConstraintMode));
      localStorage.setItem('sims4_legacy_goal_minimized', String(isGoalMinimized));
      localStorage.setItem('sims4_legacy_fun_minimized', String(isFunMinimized));
    } catch (e) {
      console.warn("Failed to auto-save legacy challenge to localStorage:", e);
    }
  }, [currentRoll, generationNumber, legacyHistory, jokerRerollsAvailable, enabledPacks, randomHeirConstraintMode, isGoalMinimized, isFunMinimized]);

  // Keep parent in sync whenever currentRoll updates
  useEffect(() => {
    if (currentRoll) {
      onRollChange?.(currentRoll);
    }
  }, [currentRoll]);

  // Active Heir Sim & Stage check (Adulthood determines Goal 12 Midlife Crisis reveal)
  const activeHeirSim = currentHousehold?.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.isDeceased)) || currentHousehold?.find(s => !s.isPet);
  const isHeirAdult = activeHeirSim ? ["Adult", "Elder"].includes(activeHeirSim.stage) : false;

  // Goal 12 (Midlife Crisis): Sealed until Heir reaches Adult stage.
  // When Heir reaches Adult, automatically roll and reveal the 3 crisis aspects and auto-reroll C1 if Aspect 3 is rolled.
  useEffect(() => {
    if (
      currentRoll?.goal?.entry?.id === 12 &&
      isHeirAdult &&
      (!currentRoll.goal.midlifeCrisisAspects || currentRoll.goal.midlifeCrisisAspects.length === 0)
    ) {
      const aspects = rollMidlifeCrisisAspects();
      const hasAspect3 = aspects.some(a => a.roll === 3);
      const newCareer = hasAspect3 ? rollHeirCareer(enabledPacks) : null;
      const titles = aspects.map(a => '#' + a.roll + ' ' + a.title).join(' • ');

      setCurrentRoll(prev => {
        if (!prev) return null;
        const updated: LegacyRollResult = {
          ...prev,
          heirCareer: newCareer ? newCareer : prev.heirCareer,
          goal: {
            ...prev.goal,
            midlifeCrisisAspects: aspects,
            midlifeCrisisRevealed: true,
          },
          notes: prev.notes ? `${prev.notes} | Midlife Crisis: ${titles}` : `Midlife Crisis: ${titles}`,
        };
        onRollChange?.(updated);
        return updated;
      });

      if (hasAspect3 && activeHeirSim) {
        const formatted = formatCareerLabel(newCareer!);
        const updatedHousehold = (currentHousehold || []).map(sim => {
          if (sim.id === activeHeirSim.id) {
            return { ...sim, career: formatted };
          }
          return sim;
        });
        onApplyToHousehold(
          updatedHousehold,
          currentLot,
          `🔥 Midlife Crisis (Goal 12) Revealed: Heir reached Adulthood! Aspects: ${titles} • Aspect #3 Triggered: C1 Career re-rolled to ${newCareer!.categoryType}!`
        );
      } else {
        onTriggerNotice(`🔥 Midlife Crisis (Goal 12) Revealed: Heir reached Adulthood! Aspects: ${titles}`);
      }
    }
  }, [currentRoll?.goal?.entry?.id, isHeirAdult, currentRoll?.goal?.midlifeCrisisAspects]);

  // Strict rule: If Goal 12 (Midlife Crisis) and Heir is NOT Adult,
  // ensure aspects are never present/unhidden in state (e.g. from previous sessions in localStorage)
  useEffect(() => {
    if (
      currentRoll?.goal?.entry?.id === 12 &&
      !isHeirAdult &&
      (currentRoll.goal.midlifeCrisisAspects || currentRoll.goal.midlifeCrisisRevealed)
    ) {
      setCurrentRoll(prev => {
        if (!prev) return null;
        const updated: LegacyRollResult = {
          ...prev,
          goal: {
            ...prev.goal,
            midlifeCrisisAspects: undefined,
            midlifeCrisisRevealed: false,
          }
        };
        onRollChange?.(updated);
        return updated;
      });
    }
  }, [currentRoll?.goal?.entry?.id, isHeirAdult, currentRoll?.goal?.midlifeCrisisAspects, currentRoll?.goal?.midlifeCrisisRevealed]);

  // Goal 9 (Party King / Party Queen): Ensure 4 party events are initialized with Goals and Rewards
  useEffect(() => {
    if (
      currentRoll?.goal?.entry?.id === 9 &&
      (!currentRoll.goal.partyGoals || currentRoll.goal.partyGoals.length === 0)
    ) {
      const shuffled = [...TS4_GOALS_AND_REWARDS_PARTIES].sort(() => 0.5 - Math.random());
      const selected: PartyEventGoal[] = shuffled.slice(0, 4).map(p => ({
        ...p,
        isGoldAchieved: false
      }));
      setCurrentRoll(prev => {
        if (!prev) return null;
        const updated: LegacyRollResult = {
          ...prev,
          goal: {
            ...prev.goal,
            partyGoals: selected,
            partyTypes: selected.map(p => `${p.name} (${p.cost})`)
          }
        };
        onRollChange?.(updated);
        return updated;
      });
    }
  }, [currentRoll?.goal?.entry?.id, currentRoll?.goal?.partyGoals]);

  // Initial mount: roll family/location directly if household is empty
  useEffect(() => {
    if ((!currentHousehold || currentHousehold.length === 0) && currentRoll) {
      const { newHousehold, updatedLot } = populateHouseholdFromLegacy(currentRoll, currentLot);
      onApplyToHousehold(
        newHousehold,
        updatedLot,
        `👑 Fork Initialized: Generation ${currentRoll.generation} Family & Location Rolled Directly!`
      );
    }
  }, []);

  // Handle Full Generation Roll: Memorizes previous generation and directly rolls family and location
  const handleRollAll = (genNum: number = generationNumber) => {
    // 1. Memorize previous generation if current household exists
    if (genNum === 1) {
      // Caveat: Rerolling Generation 1 as a whole creates a brand new random challenge!
      setLegacyHistory([]);
      setJokerRerollsAvailable(1);
    } else {
      if (currentHousehold && currentHousehold.length > 0 && onMemorizeGeneration) {
        onMemorizeGeneration(currentHousehold, currentLot, generationNumber);
      }
      if (currentRoll) {
        setLegacyHistory(prev => {
          const existingIdx = prev.findIndex(g => g.generation === currentRoll.generation);
          if (existingIdx >= 0) {
            const copy = [...prev];
            copy[existingIdx] = currentRoll;
            return copy;
          }
          return [...prev, currentRoll];
        });
      }
    }

    // 2. Identify designated next heir if transitioning generations
    const designatedHeir = (genNum > generationNumber && currentHousehold)
      ? currentHousehold.find(s => s.isNextHeir) || null
      : null;

    // 3. Roll generation constraints
    const rolled = rollCompleteLegacyGeneration(genNum, enabledPacks);
    setCurrentRoll(rolled);
    onRollChange?.(rolled);

    // 4. If fun is Joker, award 1 joker re-roll
    if (rolled.fun.entry.id === 11) {
      setJokerRerollsAvailable(prev => prev + 1);
      onTriggerNotice(`🃏 JOKER Rolled for Generation ${genNum}! You earned 1 Free Re-roll!`);
    }

    // 5. Directly roll the family and location!
    let { newHousehold, updatedLot } = populateHouseholdFromLegacy(rolled, currentLot, designatedHeir);
    if (randomHeirConstraintMode && newHousehold.length >= 2) {
      const randomHeirRes = chooseHeirRandomlyAmongSims(newHousehold, genNum);
      if (randomHeirRes) {
        newHousehold = randomHeirRes.updatedHousehold;
      }
    }
    const heirName = newHousehold.find(s => s.familyUnitRole === "Heir")?.stage || "Young Adult";
    const notice = genNum === 1
      ? `👑 BRAND NEW CHALLENGE STARTED (Gen 1): Fresh Founder family & location rolled! History reset & 1 Starting Joker granted to re-roll 1 category.`
      : `👑 Generation ${genNum} Rolled Directly! Location (${updatedLot.world}) & Family (${newHousehold.length} Sims: ${heirName} Heir, ${rolled.marital.entry.title}, ${rolled.children.targetCount} Kids). Previous generation memorized!`;
    onApplyToHousehold(newHousehold, updatedLot, notice);
  };

  // Re-roll individual categories
  const handleRerollMarital = () => {
    if (!currentRoll) return;
    const marital = rollMaritalStatus(enabledPacks);
    // Re-verify children constraint if applicable
    let children = currentRoll.children;
    if (marital.entry.minChildren && children.targetCount < marital.entry.minChildren) {
      children = rollChildren(marital.entry);
    }

    // Roll individual C2 career for each spouse and helper
    const secondaryCareers = rollAllSecondaryCareers(marital.entry, children.targetCount, enabledPacks);
    const secondaryCareer = secondaryCareers.length > 0 ? secondaryCareers[0].career : null;

    setCurrentRoll(prev => prev ? { ...prev, marital, children, secondaryCareer, secondaryCareers } : null);
    onTriggerNotice(`🎲 Re-rolled Marital Status: "${marital.entry.title}" [Dice: ${marital.diceRoll}/54]`);
  };

  const handleRerollChildren = () => {
    if (!currentRoll) return;
    const children = rollChildren(currentRoll.marital.entry);
    let secondaryCareers = currentRoll.secondaryCareers;
    if (currentRoll.marital.entry.title.includes("Second Chance (Again...)")) {
      secondaryCareers = rollAllSecondaryCareers(currentRoll.marital.entry, children.targetCount, enabledPacks);
    }
    const secondaryCareer = secondaryCareers && secondaryCareers.length > 0 ? secondaryCareers[0].career : currentRoll.secondaryCareer;
    setCurrentRoll(prev => prev ? { ...prev, children, secondaryCareers, secondaryCareer } : null);
    onTriggerNotice(`🎲 Re-rolled Children: ${children.targetCount} Kids [Dice: ${children.diceRoll}/10]`);
  };

  const handleRerollHeirCareer = () => {
    if (!currentRoll) return;
    const heirCareer = rollHeirCareer(enabledPacks);
    setCurrentRoll(prev => prev ? { ...prev, heirCareer } : null);
    onTriggerNotice(`💼 Re-rolled Heir Career: ${heirCareer.categoryType}`);
  };

  const handleRerollSpecificSecondaryCareer = (slotId: string) => {
    if (!currentRoll) return;
    const newCareer = rollSecondaryCareer(enabledPacks);
    const existingSlots = currentRoll.secondaryCareers && currentRoll.secondaryCareers.length > 0
      ? currentRoll.secondaryCareers
      : rollAllSecondaryCareers(currentRoll.marital.entry, currentRoll.children.targetCount, enabledPacks);

    const updatedSecondaryCareers = existingSlots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, career: newCareer };
      }
      return slot;
    });

    const primaryCareer = updatedSecondaryCareers[0]?.career || currentRoll.secondaryCareer;
    setCurrentRoll(prev => prev ? {
      ...prev,
      secondaryCareer: primaryCareer,
      secondaryCareers: updatedSecondaryCareers
    } : null);

    const slotObj = updatedSecondaryCareers.find(s => s.id === slotId);
    onTriggerNotice(`💼 Re-rolled C2 Career for ${slotObj?.label || slotId}: ${newCareer.categoryType}`);
  };

  const handleRerollAllSecondaryCareers = (force: boolean = false) => {
    if (!currentRoll) return;
    const hasSpouseOrHelper = (currentRoll.marital.entry.partnerCount > 0 || currentRoll.marital.entry.helperCount > 0);
    if (!hasSpouseOrHelper && !force) {
      onTriggerNotice(`⚠️ Current Marital Status is "${currentRoll.marital.entry.title}" (Single Parent). Secondary career is only rolled when there is a spouse or helper!`);
      return;
    }
    const secondaryCareers = rollAllSecondaryCareers(currentRoll.marital.entry, currentRoll.children.targetCount, enabledPacks);
    const secondaryCareer = secondaryCareers.length > 0 ? secondaryCareers[0].career : null;
    setCurrentRoll(prev => prev ? { ...prev, secondaryCareer, secondaryCareers } : null);
    onTriggerNotice(`💼 Re-rolled C2 Careers for all ${secondaryCareers.length} household secondary members!`);
  };

  // Re-rolls ALL careers across the household simultaneously (Heir C1 + all C2 secondary roles)
  const handleRerollAllCareers = (usedJoker: boolean = false) => {
    if (!currentRoll) return;
    const newHeirCareer = rollHeirCareer(enabledPacks);
    const hasSpouseOrHelper = (currentRoll.marital.entry.partnerCount > 0 || currentRoll.marital.entry.helperCount > 0);
    const secondaryCareers = hasSpouseOrHelper
      ? rollAllSecondaryCareers(currentRoll.marital.entry, currentRoll.children.targetCount, enabledPacks)
      : [];
    const secondaryCareer = secondaryCareers.length > 0 ? secondaryCareers[0].career : null;

    const updatedRoll: LegacyRollResult = {
      ...currentRoll,
      heirCareer: newHeirCareer,
      secondaryCareer,
      secondaryCareers
    };

    setCurrentRoll(updatedRoll);
    onRollChange?.(updatedRoll);

    if (currentHousehold && currentHousehold.length > 0) {
      const formattedHeir = formatCareerLabel(newHeirCareer);
      const updatedHousehold = currentHousehold.map(sim => {
        if (sim.familyUnitRole === "Heir" || sim.familyUnitRole === "Founder" || (sim.isNextHeir && !sim.isDeceased)) {
          return { ...sim, career: formattedHeir };
        }
        if (sim.familyUnitRole === "Partner" && secondaryCareers.length > 0) {
          const slot = secondaryCareers.find(s => s.role === 'spouse') || secondaryCareers[0];
          return { ...sim, career: formatCareerLabel(slot.career) };
        }
        if (sim.familyUnitRole === "Helper" && secondaryCareers.length > 0) {
          const slot = secondaryCareers.find(s => s.role === 'helper') || secondaryCareers[secondaryCareers.length - 1];
          return { ...sim, career: formatCareerLabel(slot.career) };
        }
        return sim;
      });
      onApplyToHousehold(
        updatedHousehold,
        currentLot,
        usedJoker
          ? `🃏 Spent 1 Joker to re-roll ALL careers in the generation (Heir & all secondary roles)!`
          : `💼 Re-rolled ALL careers across the generation!`
      );
      return;
    }

    onTriggerNotice(
      usedJoker
        ? `🃏 Spent 1 Joker to re-roll ALL careers in the generation (Heir & all secondary roles)!`
        : `💼 Re-rolled ALL careers across the generation!`
    );
  };

  const handleAddOptionalSecondaryCareer = () => {
    if (!currentRoll) return;
    const newCareer = rollSecondaryCareer(enabledPacks);
    const currentList = currentRoll.secondaryCareers || [];
    const newSlot: SecondaryCareerSlot = {
      id: `manual-partner-${Date.now()}`,
      role: 'spouse',
      label: `Extra Partner / Helper ${currentList.length + 1}`,
      tag: `Extra Partner`,
      career: newCareer
    };
    const updated = [...currentList, newSlot];
    setCurrentRoll(prev => prev ? {
      ...prev,
      secondaryCareer: updated[0].career,
      secondaryCareers: updated
    } : null);
    onTriggerNotice(`💼 Added and rolled C2 Career for Extra Household Member: ${newCareer.categoryType}`);
  };

  const handleRerollSingleSecondaryCareer = (slotId: string) => {
    if (!currentRoll) return;
    const newCareer = rollSecondaryCareer(enabledPacks);
    const currentList = currentRoll.secondaryCareers && currentRoll.secondaryCareers.length > 0
      ? currentRoll.secondaryCareers
      : (currentRoll.secondaryCareer ? [{
          id: "legacy-partner",
          role: "spouse" as const,
          label: "Spouse / Live-in Partner",
          tag: "Spouse",
          career: currentRoll.secondaryCareer
        }] : []);

    let slotLabel = "Secondary Career";
    const updated = currentList.map(slot => {
      if (slot.id === slotId) {
        slotLabel = slot.label;
        return { ...slot, career: newCareer };
      }
      return slot;
    });

    const newLegacyRoll: LegacyRollResult = {
      ...currentRoll,
      secondaryCareer: updated[0]?.career || newCareer,
      secondaryCareers: updated
    };

    setCurrentRoll(newLegacyRoll);
    onRollChange?.(newLegacyRoll);
    onTriggerNotice(`🎲 Re-rolled ${slotLabel} (C2 Job): ${newCareer.categoryType} [Divorce / Death / Remarriage / Breakup replacement]`);
  };

  const handleRerollGoal = () => {
    if (!currentRoll) return;
    const goal = rollGenerationGoal(generationNumber, enabledPacks);
    setCurrentRoll(prev => prev ? { ...prev, goal } : null);
    onTriggerNotice(`🎯 Re-rolled Generation Goal: "${goal.entry.title}" [Dice: ${goal.diceRoll}/80]`);
  };

  const handleTogglePartyGoldMedal = (partyId: string) => {
    if (!currentRoll || currentRoll.goal.entry.id !== 9) return;
    const currentPartyGoals = currentRoll.goal.partyGoals || [];
    const updatedPartyGoals = currentPartyGoals.map(p =>
      p.id === partyId ? { ...p, isGoldAchieved: !p.isGoldAchieved } : p
    );
    setCurrentRoll(prev => {
      if (!prev) return null;
      const updated: LegacyRollResult = {
        ...prev,
        goal: {
          ...prev.goal,
          partyGoals: updatedPartyGoals,
        }
      };
      onRollChange?.(updated);
      return updated;
    });

    const toggled = updatedPartyGoals.find(p => p.id === partyId);
    if (toggled) {
      onTriggerNotice(
        toggled.isGoldAchieved
          ? `🏆 Gold Medal Conquered for "${toggled.name}"!`
          : `⚪ Gold Medal unchecked for "${toggled.name}".`
      );
    }
  };

  const handleRerollFun = () => {
    if (!currentRoll) return;
    const fun = rollMiscFun(currentRoll.children.targetCount, generationNumber, enabledPacks);
    if (fun.entry.id === 11) {
      setJokerRerollsAvailable(prev => prev + 1);
    }
    setCurrentRoll(prev => prev ? { ...prev, fun } : null);
    onTriggerNotice(`🎪 Re-rolled Misc Fun: "${fun.entry.title}" [Dice: ${fun.diceRoll}/78]`);
  };

  // Sub-roll re-rolls
  const handleRerollCustody = () => {
    if (!currentRoll || !currentRoll.marital.entry.hasCustodySubroll) return;
    const custRoll = Math.floor(Math.random() * 7) + 1;
    const sched = custodySchedules.find(c => c.roll === custRoll) || custodySchedules[0];
    setCurrentRoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        marital: {
          ...prev.marital,
          custodySchedule: sched
        }
      };
    });
    onTriggerNotice(`⚖️ Re-rolled Custody Schedule: ${sched.label}`);
  };

  const handleRerollDynamics = () => {
    if (!currentRoll) return;
    const hasPartner = currentRoll.marital.entry.partnerCount > 0;
    const hasHelper = currentRoll.marital.entry.helperCount > 0;
    const famDyn = (hasPartner || hasHelper) ? roll(familyDynamicsList).name : undefined;
    const romDyn = hasPartner ? roll(romanticDynamicsList).name : undefined;
    setCurrentRoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        marital: {
          ...prev.marital,
          familyDynamic: famDyn,
          romanticDynamic: romDyn,
        }
      };
    });
    onTriggerNotice(`💞 Re-rolled Dynamics: Family [${famDyn || 'N/A'}] • Romantic [${romDyn || 'N/A'}]`);
  };

  const handleRerollMood = () => {
    if (!currentRoll || currentRoll.fun.entry.id !== 4) return;
    const mood = moodsList[Math.floor(Math.random() * moodsList.length)];
    setCurrentRoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fun: {
          ...prev.fun,
          rolledMood: mood
        }
      };
    });
    onTriggerNotice(`🎭 Re-rolled Required Mood: "${mood}"`);
  };

  const handleRerollColor = () => {
    if (!currentRoll || currentRoll.fun.entry.id !== 25) return;
    const col = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    setCurrentRoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fun: {
          ...prev.fun,
          rolledColor: col
        }
      };
    });
    onTriggerNotice(`🌈 Re-rolled Signature Color: "${col}"`);
  };

  // Automatic / Manual C1 Career Re-roll for Midlife Crisis (Goal 12, Aspect 3)
  const handleTriggerMidlifeCrisisCareerReroll = () => {
    if (!currentRoll) return;
    const newCareer = rollHeirCareer(enabledPacks);
    const updatedRoll = {
      ...currentRoll,
      heirCareer: newCareer
    };
    setCurrentRoll(updatedRoll);
    onRollChange?.(updatedRoll);

    // Update Heir's job in household if present
    if (currentHousehold && currentHousehold.length > 0) {
      const heir = currentHousehold.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.isDeceased)) || currentHousehold[0];
      if (heir) {
        const formatted = formatCareerLabel(newCareer);
        const updatedHousehold = currentHousehold.map(sim => {
          if (sim.id === heir.id) {
            return {
              ...sim,
              career: formatted
            };
          }
          return sim;
        });
        onApplyToHousehold(
          updatedHousehold,
          currentLot,
          `🔥 Midlife Crisis (Goal 12, Aspect 3): Heir Sim ${heir.id} reached Adulthood, quit current job, and automatically re-rolled C1 Career: ${newCareer.categoryType}!`
        );
        return;
      }
    }
    onTriggerNotice(`🔥 Midlife Crisis (Goal 12, Aspect 3): Adult C1 Career automatically re-rolled to: ${newCareer.categoryType}!`);
  };

  // Manual Child Addition (Birth or Adoption in arrival order)
  const handleAddLegacyChild = (isAdopted: boolean) => {
    if (!currentRoll) return;
    if (currentHousehold && currentHousehold.length >= 8) {
      onTriggerNotice("⚠️ Household is full (maximum 8 Sims)! Free up space or age Sims up to move out.");
      return;
    }
    const { updatedHousehold, notice } = createLegacyChildSim(
      currentHousehold || [],
      currentRoll,
      { isAdopted }
    );
    onApplyToHousehold(updatedHousehold, currentLot, notice);
  };

  // Succession: Crown a surviving child as the active Heir if current Heir died
  const handleDesignateSuccessor = (childId: number) => {
    if (!currentHousehold || currentHousehold.length === 0) return;
    const targetChild = currentHousehold.find(s => s.id === childId);
    if (!targetChild) return;

    const updated = currentHousehold.map(sim => {
      if (sim.id === childId) {
        return {
          ...sim,
          familyUnitRole: "Heir",
          isNextHeir: true,
          isDeceased: false,
          branchName: `👑 Successor Heir (${sim.stage} • Succeeded Deceased Heir)`,
          branchBadge: "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm"
        };
      }
      if (sim.isNextHeir && sim.id !== childId) {
        return {
          ...sim,
          isNextHeir: false,
          familyUnitRole: "Child",
          branchName: sim.isAdopted ? `🧒 Sibling (Adopted)` : `👶 Sibling`,
          branchBadge: sim.isAdopted ? "bg-violet-500/20 text-violet-300 border-violet-500/40" : "bg-sky-500/20 text-sky-300 border-sky-500/40"
        };
      }
      return { ...sim };
    });

    onApplyToHousehold(
      updated,
      currentLot,
      `👑 HEIR SUCCESSION: Sim ${childId} (${targetChild.stage}) crowned as the official Successor Heir for Generation ${generationNumber} and can now be rolled!`
    );
  };

  // Roll random successor among surviving living children
  const handleRollRandomSuccessor = () => {
    if (!currentHousehold || currentHousehold.length === 0) return;
    const heirSim = currentHousehold.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.ghost)) || currentHousehold[0];
    const pool: Sim[] = currentHousehold.filter(s =>
      s.id !== heirSim?.id &&
      !s.isPet &&
      !s.ghost &&
      (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
    );
    if (pool.length === 0) return;
    const chosen = roll<Sim>(pool);
    handleDesignateSuccessor(chosen.id);
  };

  // Constraint Mode: Choose First Heir Randomly in case of multiple Sims / children
  const handleChooseRandomHeir = () => {
    if (onChooseRandomHeir) {
      onChooseRandomHeir();
      return;
    }
    if (!currentHousehold || currentHousehold.length < 2) {
      onTriggerNotice("⚠️ Need at least 2 Sims in the household to choose an Heir randomly.");
      return;
    }
    const res = chooseHeirRandomlyAmongSims(currentHousehold, generationNumber);
    if (!res) {
      onTriggerNotice("⚠️ Could not find eligible Sims to choose an Heir randomly.");
      return;
    }
    onApplyToHousehold(res.updatedHousehold, currentLot, res.notice);
  };

  // Player-initiated Heir death in case the Sim actually dies during gameplay
  const handleMarkHeirDeceased = (customCause?: string) => {
    if (!currentHousehold || currentHousehold.length === 0) return;
    const heirSim = currentHousehold.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.isDeceased)) || currentHousehold[0];
    if (!heirSim) return;

    const deathCause = customCause || (heirSim.cause && heirSim.cause !== "N/A" ? heirSim.cause : rollDeathCause(heirSim.stage, heirSim.occult, heirSim.isPet));
    const updated = currentHousehold.map(s => {
      if (s.id === heirSim.id) {
        return {
          ...s,
          isDeceased: true,
          ghost: true,
          cause: deathCause,
          branchName: `⚰️ Deceased Heir (Sim ${s.id} • ${deathCause})`,
          branchBadge: "bg-rose-950/80 text-rose-300 border-rose-700/80 font-bold"
        };
      }
      return s;
    });

    const survivingChildren = updated.filter(s =>
      s.id !== heirSim.id &&
      !s.isPet &&
      !s.isDeceased &&
      (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
    );

    if (survivingChildren.length === 0) {
      onApplyToHousehold(
        updated,
        currentLot,
        `☠️ GAME OVER: Heir Sim ${heirSim.id} died with NO offspring! Under PieceOfPrincess legacy rules, the lineage has fallen and the challenge is lost.`
      );
    } else {
      onApplyToHousehold(
        updated,
        currentLot,
        `👑 Heir Sim ${heirSim.id} died (${deathCause}). Emergency succession triggered for ${survivingChildren.length} surviving child(ren)!`
      );
    }
  };

  // Undo death or revive the Heir
  const handleReviveHeir = () => {
    if (!currentHousehold || currentHousehold.length === 0) return;
    const heirSim = currentHousehold.find(s => s.isDeceased || s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || s.isNextHeir) || currentHousehold[0];
    if (!heirSim) return;

    const updated = currentHousehold.map(s => {
      if (s.id === heirSim.id) {
        return {
          ...s,
          isDeceased: false,
          branchName: `👑 Heir (Gen ${generationNumber})`,
          branchBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        };
      }
      return s;
    });

    onApplyToHousehold(
      updated,
      currentLot,
      `💖 Heir Sim ${heirSim.id} has been revived and marked Alive! Game Over / Succession cleared.`
    );
  };

  // Directly select / change the Heir's life stage
  const handleUpdateHeirStage = (newStage: string) => {
    if (!currentHousehold || currentHousehold.length === 0) return;
    const heir = currentHousehold.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.ghost)) || currentHousehold[0];
    if (!heir) return;

    const updated = currentHousehold.map(sim => {
      if (sim.id !== heir.id) return { ...sim };
      const updatedSim = { ...sim, stage: newStage };
      if (newStage === "Infant") {
        updatedSim.isFunctional = false;
        updatedSim.traits = [roll(db.infantTraits)];
        updatedSim.hobby = "N/A";
        updatedSim.asp = "N/A";
        updatedSim.career = "N/A";
      } else if (newStage === "Toddler") {
        updatedSim.isFunctional = false;
        updatedSim.traits = [roll(db.toddlerTraits)];
        updatedSim.hobby = roll(db.toddlerSkills);
        updatedSim.asp = "N/A";
        updatedSim.career = "N/A";
      } else if (newStage === "Child") {
        updatedSim.isFunctional = false;
        updatedSim.traits = [roll(db.childTraits)];
        updatedSim.asp = roll(db.aspirationsChild);
        updatedSim.hobby = roll(db.childSkills);
      } else if (newStage === "Teen") {
        updatedSim.isFunctional = true;
        while (updatedSim.traits.length < 2) {
          const t = getValidTrait(db.adultTraits, updatedSim.traits);
          if (t) updatedSim.traits.push(t);
          else break;
        }
        if (updatedSim.traits.length > 2) updatedSim.traits = updatedSim.traits.slice(0, 2);
        updatedSim.asp = roll(db.aspirationsAdult);
        updatedSim.hobby = roll(db.adultSkills);
      } else {
        updatedSim.isFunctional = true;
        while (updatedSim.traits.length < 3) {
          const t = getValidTrait(db.adultTraits, updatedSim.traits);
          if (t) updatedSim.traits.push(t);
          else break;
        }
        if (updatedSim.traits.length > 3) updatedSim.traits = updatedSim.traits.slice(0, 3);
        if (updatedSim.asp === "N/A" || db.aspirationsChild.includes(updatedSim.asp)) {
          updatedSim.asp = roll(db.aspirationsAdult);
        }
        if (currentRoll) {
          if (newStage === "Adult" && currentRoll.goal?.entry?.id === 12) {
            const aspects = (currentRoll.goal.midlifeCrisisAspects && currentRoll.goal.midlifeCrisisAspects.length > 0)
              ? currentRoll.goal.midlifeCrisisAspects
              : rollMidlifeCrisisAspects();
            const hasAspect3 = aspects.some(a => a.roll === 3);
            const newCareer = hasAspect3 ? rollHeirCareer(enabledPacks) : currentRoll.heirCareer;
            const titles = aspects.map(a => '#' + a.roll + ' ' + a.title).join(' • ');
            const updatedRoll = {
              ...currentRoll,
              heirCareer: newCareer,
              goal: {
                ...currentRoll.goal,
                midlifeCrisisAspects: aspects,
                midlifeCrisisRevealed: true,
              },
              notes: currentRoll.notes ? `${currentRoll.notes} | Midlife Crisis: ${titles}` : `Midlife Crisis: ${titles}`
            };
            setCurrentRoll(updatedRoll);
            onRollChange?.(updatedRoll);
            updatedSim.career = formatCareerLabel(newCareer);
          } else {
            updatedSim.career = formatCareerLabel(currentRoll.heirCareer);
          }
        }
      }
      return updatedSim;
    });

    const isCrisisReveal = newStage === "Adult" && currentRoll?.goal?.entry?.id === 12;
    const currentAspects = currentRoll?.goal?.midlifeCrisisAspects;
    const aspectTitles = currentAspects?.map(a => '#' + a.roll + ' ' + a.title).join(' • ') || '';
    const hasAspect3 = currentAspects?.some(a => a.roll === 3);
    const notice = isCrisisReveal
      ? `🔥 Midlife Crisis (Goal 12) Revealed on Adulthood: ${aspectTitles}${hasAspect3 ? ` • Aspect #3 Triggered: C1 Career re-rolled to ${updated.find(s => s.id === heir.id)?.career}!` : ''}`
      : `🌱 Heir Sim ${heir.id} life stage updated to ${newStage}!`;

    onApplyToHousehold(
      updated,
      currentLot,
      notice
    );
  };

  // Simulate into Live Household
  const handleSimulateHousehold = () => {
    if (!currentRoll) return;
    let { newHousehold, updatedLot } = populateHouseholdFromLegacy(currentRoll, currentLot, null, false);
    
    // Retain any existing children the player already added to their household
    const existingChildren = (currentHousehold || []).filter(s =>
      !s.isPet && (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
    );
    if (existingChildren.length > 0) {
      existingChildren.forEach(child => {
        if (newHousehold.length < 8 && !newHousehold.some(s => s.id === child.id)) {
          newHousehold.push(child);
        }
      });
    }

    if (randomHeirConstraintMode && newHousehold.length >= 2) {
      const randomHeirRes = chooseHeirRandomlyAmongSims(newHousehold, currentRoll.generation);
      if (randomHeirRes) {
        newHousehold = randomHeirRes.updatedHousehold;
      }
    }

    // Auto-save generation to history if not saved yet
    setLegacyHistory(prev => {
      const existingIdx = prev.findIndex(g => g.generation === currentRoll.generation);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = currentRoll;
        return copy;
      }
      return [...prev, currentRoll];
    });

    const ord = getOrdinal(currentRoll.children.heirOrder || 1);
    const notice = `👑 Generation ${currentRoll.generation} Household Synced! (Heir, ${currentRoll.marital.entry.title} • Target: ${currentRoll.children.targetCount} Children). Add children manually via birth or adoption; the ${ord} arrival will be the Next Heir!`;
    onApplyToHousehold(newHousehold, updatedLot, notice);
  };

  // Step between generations
  const handlePrevGen = () => {
    if (generationNumber <= 1) return;
    const prevGen = generationNumber - 1;
    setGenerationNumber(prevGen);
    // Look up saved roll in history
    const saved = legacyHistory.find(g => g.generation === prevGen);
    if (saved) {
      setCurrentRoll(saved);
      onRollChange?.(saved);
      const { newHousehold, updatedLot } = populateHouseholdFromLegacy(saved, currentLot);
      onApplyToHousehold(newHousehold, updatedLot, `👑 Loaded Generation ${prevGen} Family & Location from Ledger!`);
    } else {
      handleRollAll(prevGen);
    }
  };

  const handleNextGen = () => {
    const nextGen = generationNumber + 1;
    setGenerationNumber(nextGen);
    // Directly roll next generation, carrying forward designated heir and memorizing previous generation
    handleRollAll(nextGen);
  };

  const handleSaveToHistory = () => {
    if (!currentRoll) return;
    setLegacyHistory(prev => {
      const existingIdx = prev.findIndex(g => g.generation === currentRoll.generation);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = currentRoll;
        return copy;
      }
      return [...prev, currentRoll];
    });
    onTriggerNotice(`💾 Saved Generation ${currentRoll.generation} rolls to Legacy History ledger!`);
  };

  const handleUseJokerOnCategory = (category: 'marital' | 'children' | 'careers' | 'heirCareer' | 'secondaryCareers' | 'goal' | 'fun') => {
    if (jokerRerollsAvailable <= 0) {
      onTriggerNotice(`⚠️ No Joker available! You receive 1 Joker at challenge start (and additional Jokers when rolling Misc Fun #11).`);
      return;
    }

    const nextJokers = Math.max(0, jokerRerollsAvailable - 1);
    setJokerRerollsAvailable(nextJokers);

    if (category === 'marital') {
      handleRerollMarital();
      onTriggerNotice(`🃏 Spent 1 Joker to re-roll Marital Status! (${nextJokers} Jokers remaining)`);
    } else if (category === 'children') {
      handleRerollChildren();
      onTriggerNotice(`🃏 Spent 1 Joker to re-roll Number of Children! (${nextJokers} Jokers remaining)`);
    } else if (category === 'careers' || category === 'heirCareer' || category === 'secondaryCareers') {
      // User Directive: The roll for careers joker rerolls ALL careers, no single ones!
      handleRerollAllCareers(true);
      onTriggerNotice(`🃏 Spent 1 Joker to re-roll ALL careers in the generation (Heir and all spouses/helpers)! (${nextJokers} Jokers remaining)`);
    } else if (category === 'goal') {
      handleRerollGoal();
      onTriggerNotice(`🃏 Spent 1 Joker to re-roll Generation Goal! (${nextJokers} Jokers remaining)`);
    } else if (category === 'fun') {
      handleRerollFun();
      onTriggerNotice(`🃏 Spent 1 Joker to re-roll Misc Fun! (${nextJokers} Jokers remaining)`);
    }
  };

  const handleUseJokerReroll = () => {
    if (jokerRerollsAvailable <= 0) {
      onTriggerNotice(`⚠️ No Joker available. You receive 1 Joker at challenge start (or by rolling Misc Fun #11).`);
      return;
    }
    onTriggerNotice(`🃏 You have ${jokerRerollsAvailable} Joker available! Click the "🃏 Use Joker" button on any of the 5 roll categories below to re-roll that specific category.`);
  };

  // --- External Backup & Storage Handlers ---

  // 1. Export & Download JSON Backup File (External file save outside program)
  const handleExportBackupFile = () => {
    const backupData = {
      version: 1,
      appName: "Sims 4 Random Legacy Challenge",
      exportTimestamp: new Date().toISOString(),
      exportDateFormatted: new Date().toLocaleString(),
      generationNumber,
      currentRoll,
      legacyHistory,
      jokerRerollsAvailable,
      enabledPacks: Array.from(enabledPacks),
      household: currentHousehold || [],
      lot: currentLot,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `sims4-legacy-gen${generationNumber}-backup-${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onTriggerNotice(`📥 Downloaded external backup: "sims4-legacy-gen${generationNumber}-backup-${dateTag}.json"! Saved outside the program.`);
  };

  // 2. Copy JSON Backup to Clipboard
  const handleCopyBackupToClipboard = () => {
    const backupData = {
      version: 1,
      appName: "Sims 4 Random Legacy Challenge",
      exportTimestamp: new Date().toISOString(),
      exportDateFormatted: new Date().toLocaleString(),
      generationNumber,
      currentRoll,
      legacyHistory,
      jokerRerollsAvailable,
      enabledPacks: Array.from(enabledPacks),
      household: currentHousehold || [],
      lot: currentLot,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr)
        .then(() => {
          onTriggerNotice("📋 Legacy Challenge backup JSON copied to clipboard! Paste it into a text file or notes.");
        })
        .catch(() => {
          setBackupPasteText(jsonStr);
          setShowBackupModal(true);
          onTriggerNotice("📋 Backup JSON placed in text box in Backup Manager for copying.");
        });
    } else {
      setBackupPasteText(jsonStr);
      setShowBackupModal(true);
      onTriggerNotice("📋 Backup JSON placed in text box in Backup Manager for copying.");
    }
  };

  // 3. Apply Restored Backup
  const applyBackupData = (data: any) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid backup format: root must be an object.");
      }
      if (typeof data.generationNumber === 'number') {
        setGenerationNumber(data.generationNumber);
        localStorage.setItem('sims4_legacy_generation_number', String(data.generationNumber));
      }
      if (data.currentRoll && typeof data.currentRoll === 'object') {
        setCurrentRoll(data.currentRoll);
        localStorage.setItem('sims4_legacy_current_roll', JSON.stringify(data.currentRoll));
      }
      if (Array.isArray(data.legacyHistory)) {
        setLegacyHistory(data.legacyHistory);
        localStorage.setItem('sims4_legacy_history', JSON.stringify(data.legacyHistory));
      }
      if (typeof data.jokerRerollsAvailable === 'number') {
        setJokerRerollsAvailable(data.jokerRerollsAvailable);
        localStorage.setItem('sims4_legacy_joker_rerolls', String(data.jokerRerollsAvailable));
      }
      if (Array.isArray(data.enabledPacks)) {
        setEnabledPacks(new Set(data.enabledPacks));
        localStorage.setItem('sims4_legacy_enabled_packs', JSON.stringify(data.enabledPacks));
      }
      if (Array.isArray(data.household) && onRestoreHouseholdAndLot) {
        onRestoreHouseholdAndLot(data.household, data.lot);
      }
      setShowBackupModal(false);
      setBackupPasteText('');
      setPasteError(null);
      onTriggerNotice(`✅ Successfully restored backup! Loaded Gen ${data.generationNumber || 1} with ${Array.isArray(data.legacyHistory) ? data.legacyHistory.length : 0} saved ledger generations.`);
    } catch (err: any) {
      setPasteError(err.message || "Failed to parse backup data.");
      onTriggerNotice(`❌ Restore failed: ${err.message || 'Invalid backup format'}`);
    }
  };

  // 4. File input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        applyBackupData(parsed);
      } catch (err) {
        onTriggerNotice("❌ Error reading file: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 5. Restore from pasted text
  const handlePasteRestore = () => {
    if (!backupPasteText.trim()) {
      setPasteError("Please paste your backup JSON code into the box first.");
      return;
    }
    try {
      const parsed = JSON.parse(backupPasteText);
      applyBackupData(parsed);
    } catch (e: any) {
      setPasteError("Invalid JSON: Please check the pasted text.");
    }
  };

  // 6. Reset all data
  const handleResetAllData = () => {
    if (window.confirm("⚠️ Are you sure you want to reset all Legacy Challenge data? This will clear your saved history and start back at Generation 1. (Download a backup first if you want to keep your progress!)")) {
      try {
        localStorage.removeItem('sims4_legacy_current_roll');
        localStorage.removeItem('sims4_legacy_generation_number');
        localStorage.removeItem('sims4_legacy_history');
        localStorage.removeItem('sims4_legacy_joker_rerolls');
      } catch (e) {}
      setGenerationNumber(1);
      setLegacyHistory([]);
      setJokerRerollsAvailable(1);
      const fresh = rollCompleteLegacyGeneration(1, enabledPacks);
      setCurrentRoll(fresh);
      setShowBackupModal(false);
      onTriggerNotice("🗑️ Reset Legacy Challenge to Generation 1. New challenge started with 1 Starting Joker!");
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 mb-8 shadow-2xl relative overflow-hidden">
      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Decorative top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500"></div>

      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">🎲</span>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-amber-400 tracking-wide uppercase flex items-center gap-2">
                Random Legacy Challenge Simulator
              </h2>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Official 5-Rolls Ruleset
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate 10+ generations easily: Marital Status (1–54) • Children (1–10) • Careers • Goals (1–80) • Misc Fun (1–78)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* External Backup & Storage Manager Button */}
          <button
            onClick={() => setShowBackupModal(true)}
            className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            title="Download backup file to your computer or restore saved challenge data"
          >
            <span>💾</span>
            <span>Backup & Storage</span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono border border-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-Saved
            </span>
          </button>

          {/* Quick Export Button */}
          <button
            onClick={handleExportBackupFile}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            title="Download backup JSON file to your computer (saved outside program)"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Export File</span>
          </button>

          {/* Quick Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            title="Upload and restore a previously saved backup JSON file"
          >
            <span>📂</span>
            <span className="hidden sm:inline">Import File</span>
          </button>

          {/* Joker re-roll status */}
          <button
            onClick={handleUseJokerReroll}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
              jokerRerollsAvailable > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
            title="Earned from Misc Fun #11 (Joker). Gives you one free re-roll in any category."
          >
            <span>🃏</span>
            <span>Joker:</span>
            <span className="font-mono bg-black/40 px-1.5 py-0.2 rounded font-bold text-amber-300">
              {jokerRerollsAvailable}
            </span>
          </button>

          {/* Pack Filter Button */}
          <button
            onClick={() => setIsPackModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            title="Filter which Sims 4 DLC packs you own for rolls"
          >
            <span>📦</span>
            <span>Packs</span>
            <span className="bg-sky-950 text-sky-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-sky-800">
              {enabledPacks.size}
            </span>
          </button>

          {/* Official Rules Modal Button */}
          <button
            onClick={() => {
              setActiveRulesTab('general');
              setShowRulesModal(true);
            }}
            className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 text-amber-300 border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            title="Open complete PieceOfPrincess Official Rules (Dec 26, 2020), Pack Restrictions & Aspiration Matrix"
          >
            <span>📖</span>
            <span>Official Rules</span>
            <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono border border-amber-700">
              Dec 2020
            </span>
          </button>

          {/* Quick Cheatsheet Toggle */}
          <button
            onClick={() => setShowRulesCheatsheet(!showRulesCheatsheet)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            title="Toggle quick 5-roll categories summary"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Cheatsheet</span>
          </button>

          {/* Rule Orientation Mode Toggle: Standard vs Inverted */}
          {onToggleRuleOrientation && (
            <button
              onClick={onToggleRuleOrientation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow ${
                ruleOrientation === 'inverted'
                  ? 'bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 border-purple-500/70'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700'
              }`}
              title={
                ruleOrientation === 'inverted'
                  ? "Inverted Mode Active: Aspirations dictate required Careers (auto-assigns matching career). Click to switch to Standard Mode."
                  : "Standard Mode Active: Careers dictate allowed Aspirations (incompatible aspirations are disabled). Click to switch to Inverted Mode."
              }
            >
              <span>{ruleOrientation === 'inverted' ? '🔄' : '⚖️'}</span>
              <span>{ruleOrientation === 'inverted' ? 'Inverted Rules' : 'Standard Rules'}</span>
            </button>
          )}

          {/* Constraint Mode: Random Heir in case of multiple Sims */}
          <button
            onClick={() => {
              const nextVal = !randomHeirConstraintMode;
              setRandomHeirConstraintMode(nextVal);
              onTriggerNotice(
                nextVal
                  ? "🎲 CONSTRAINT MODE ENABLED: First Heir will be chosen strictly at random in case of multiple Sims / children!"
                  : "🎲 Constraint Mode disabled: Default order of arrival and founder rules apply."
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow ${
              randomHeirConstraintMode
                ? 'bg-amber-500/25 text-amber-300 border-amber-400 hover:bg-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Constraint Mode: In case of multiple Sims (Founders, Partners, Helpers, or Children), automatically/randomly select the Heir among them."
          >
            <span>🎲</span>
            <span>Constraint: Random Heir</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              randomHeirConstraintMode ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
            }`}>
              {randomHeirConstraintMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Legacy History Ledger */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>History ({legacyHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Rules Cheatsheet Accordion */}
      {showRulesCheatsheet && (
        <div className="my-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-amber-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚡</span>
              <span>PieceOfPrincess Random Legacy Challenge — Quick Summary:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowRulesModal(true);
                  setShowRulesCheatsheet(false);
                }}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold"
              >
                View Full Rulebook ↗
              </button>
              <button onClick={() => setShowRulesCheatsheet(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-[11px]">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">A) Marital (1–54):</span>
              <p className="mt-1 text-slate-400">
                Single, Couple, Mixed Bio/Adopted, Second Chance, Roommate Helpers, Full Occult House, Full Pet House, Black Widow, Shared Custody (1–7 days).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">B) Children (1–10):</span>
              <p className="mt-1 text-slate-400">
                1-2: 1 Kid • 3-6: 2 Kids • 7-8: 3 Kids • 9: 4 Kids • 10: 5 Kids. (Mixed requires min 2 kids; Second Chance Again requires min 3 kids).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">C) Careers (1–10):</span>
              <p className="mt-1 text-slate-400">
                Heir: Conventional (1-5), Unconventional (6-8), Career Hopper (9: 5 jobs), Double Part-timer (10). Secondary: Conv (1-4), Unconv (5-7), Part-time (8), Hopper (9), Unemployed (10).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">D) Goals (1–80):</span>
              <p className="mt-1 text-slate-400">
                80 unique generation goals (Perfect Careers, Midlife Crisis 1-12, Saving Space Tiny Home, Domestic Dilemma negative challenge, etc.).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">E) Misc Fun (1–78):</span>
              <p className="mt-1 text-slate-400">
                78 quirky restrictions (Moody, Rainbow Brite swatch, Foster Pets, Troubled Teens, Simple Living, Surrounded by Idiots).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-sky-400">⚧ Gender Identity:</span>
              <p className="mt-1 text-slate-400">
                Fully Unlocked in CAS. Customize pronouns, body frame, clothing, pregnancy, milk, toilet usage (sitting/standing), and orientation freely when editing a Sim normally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Bar & Roll Buttons */}
      <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevGen}
            disabled={generationNumber <= 1}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="Go to previous generation"
          >
            ◀ Gen {generationNumber > 1 ? generationNumber - 1 : 1}
          </button>

          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg text-slate-950 font-black text-sm uppercase tracking-wider shadow-inner flex items-center gap-1.5">
            <span>👑</span>
            <span>Generation {generationNumber}</span>
            <span className="text-xs bg-amber-950/40 text-amber-200 px-1.5 py-0.5 rounded font-mono">
              {generationNumber === 1 ? 'Founder' : `Heir ${generationNumber}`}
            </span>
          </div>

          <button
            onClick={handleNextGen}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="Advance to next generation"
          >
            Gen {generationNumber + 1} ▶
          </button>
        </div>

        {/* Master Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          <button
            onClick={() => handleRollAll(generationNumber)}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            title={generationNumber === 1 ? "Caveat: Re-rolling Generation 1 creates a brand new random challenge, resetting history and granting 1 fresh starting Joker!" : `Re-rolls all 5 categories for Generation ${generationNumber}`}
          >
            <span>🎲</span>
            <span>{generationNumber === 1 ? 'Roll Brand New Challenge (Full Gen 1 Roll)' : `Roll All 5 Rolls (Gen ${generationNumber})`}</span>
          </button>

          <button
            onClick={handleSimulateHousehold}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 active:scale-95 border border-emerald-400/30 cursor-pointer"
            title="Generates or populates the live Sims household and synchronizes Lot according to these exact rolled constraints!"
          >
            <span>⚡</span>
            <span>Generate Household from Rolls</span>
          </button>

          <button
            onClick={handleSaveToHistory}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Save this roll to history"
          >
            <span>💾</span>
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Joker Re-roll Active Directive Banner */}
      {jokerRerollsAvailable > 0 && (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border border-amber-500/60 rounded-xl flex items-center justify-between gap-3 flex-wrap text-xs shadow-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">🃏</span>
            <div>
              <span className="text-amber-300 font-extrabold text-sm block">
                {jokerRerollsAvailable} Starting Joker Available:
              </span>
              <span className="text-slate-300 text-xs">
                You can spend your Joker to re-roll <strong>any single one of the 5 categories</strong> below using the golden <strong>"🃏 Use Joker"</strong> button on that card. (Caveat: Re-rolling Generation 1 as a whole starts a brand new random challenge).
              </span>
            </div>
          </div>
          <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-mono font-black shadow-sm">
            1-Roll Wildcard Active
          </span>
        </div>
      )}

      {/* Heir Management & Succession Controller */}
      {(() => {
        const heirSim = currentHousehold?.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.isDeceased)) || currentHousehold?.[0];
        const isHeirDead = Boolean(heirSim?.isDeceased);
        const survivingChildren = (currentHousehold || []).filter(s =>
          s.id !== heirSim?.id &&
          !s.isPet &&
          !s.isDeceased &&
          (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
        );
        const isGameOver = isHeirDead && survivingChildren.length === 0;

        if (!heirSim) return null;

        return (
          <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 shadow-md space-y-3">
            {/* ☠️ GAME OVER: Heir Deceased with No Offspring */}
            {isGameOver && (
              <div className="p-4 bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-2 border-red-600 rounded-xl shadow-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-pulse">☠️</span>
                    <div>
                      <div className="text-red-400 font-black text-base uppercase tracking-wider flex items-center gap-2">
                        <span>GAME OVER — The Royal Lineage Has Fallen</span>
                        <span className="text-[10px] bg-red-600 text-white font-mono font-black px-2 py-0.5 rounded uppercase">
                          No Offspring
                        </span>
                      </div>
                      <p className="text-red-200/90 text-xs mt-1 max-w-2xl leading-relaxed">
                        Heir <strong>Sim #{heirSim.id}</strong> has died with <strong>no surviving offspring</strong> in the household to inherit the throne. Under PieceOfPrincess legacy rules, the bloodline has perished and the challenge ends in defeat!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleRollAll(1)}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase px-3.5 py-2 rounded-lg shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Restart challenge from Generation 1 with a fresh founder and starting funds"
                    >
                      <span>🔄</span>
                      <span>Restart Challenge (Gen 1)</span>
                    </button>
                    <button
                      onClick={handleReviveHeir}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/60 font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      title="If the Heir was revived in-game (Ambrosia, pleaded with Grim Reaper, Dethrone Death) or marked dead by mistake"
                    >
                      <span>💖</span>
                      <span>Undo / Revive Heir</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-red-900/60 flex items-center justify-between flex-wrap gap-2 text-[11px] text-red-300/80">
                  <span className="flex items-center gap-1.5">
                    <span>📜</span>
                    <span>Royal Law: The crown cannot pass to an empty cradle. A legacy without offspring cannot continue.</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    Defeated at Generation {generationNumber}
                  </span>
                </div>
              </div>
            )}

            {/* If Heir died WITH surviving offspring: Emergency Succession Banner */}
            {isHeirDead && !isGameOver && (
              <div className="p-3 bg-gradient-to-r from-rose-950/80 via-red-950/60 to-slate-900 border-2 border-rose-500 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl animate-bounce">⚠️</span>
                    <div>
                      <div className="text-rose-300 font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
                        <span>👑 Heir Deceased — Succession Triggered</span>
                        <span className="text-[10px] bg-rose-500 text-slate-950 px-2 py-0.5 rounded font-black">
                          {heirSim.cause && heirSim.cause !== "N/A" ? heirSim.cause : "Deceased Sim"}
                        </span>
                      </div>
                      <p className="text-rose-200/90 text-xs mt-0.5">
                        Heir <strong>Sim #{heirSim.id}</strong> has died. As per PieceOfPrincess legacy rules, crown one of the surviving children to inherit the Heir title and continue the generation!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleReviveHeir}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Undo death and mark Heir as alive"
                    >
                      <span>💖</span>
                      <span>Revive Heir (Mark Alive)</span>
                    </button>
                    {survivingChildren.length > 0 && (
                      <button
                        onClick={handleRollRandomSuccessor}
                        className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-3.5 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Randomly select one of the surviving children to become the new Heir"
                      >
                        <span>🎲</span>
                        <span>Roll Random Successor ({survivingChildren.length} alive)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Available surviving children list */}
                <div className="pt-2 border-t border-rose-900/60 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-rose-300 font-bold text-[11px]">Crown Surviving Child as Heir:</span>
                  {survivingChildren.map(kid => (
                    <button
                      key={kid.id}
                      onClick={() => handleDesignateSuccessor(kid.id)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-amber-600 hover:text-slate-950 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>👑</span>
                      <span>Sim #{kid.id} ({kid.stage}{kid.isAdopted ? ' • Adopted' : ''})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Heir Stage & Selection Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <span className="text-xs font-bold text-amber-300">Active Heir: </span>
                    <span className="text-xs font-extrabold text-white">Sim #{heirSim.id}</span>
                    <span className="ml-1.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">
                      {heirSim.familyUnitRole || "Heir"}
                    </span>
                    {heirSim.ghost && !isHeirDead && (
                      <span className="ml-1 text-[10px] bg-purple-900/60 text-purple-200 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold" title="Ghost Sim (Playable Ghost: Can conceive via ghost pregnancy mod or Science Babies)">
                        👻 Ghost Sim (Playable)
                      </span>
                    )}
                    {isHeirDead && (
                      <span className="ml-1 text-[10px] bg-rose-900 text-rose-200 border border-rose-500/80 px-1.5 py-0.5 rounded font-bold">
                        ⚰️ Deceased
                      </span>
                    )}
                  </div>
                </div>

                {/* Heir Life Stage Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold">Life Stage:</span>
                  <select
                    value={heirSim.stage}
                    onChange={(e) => handleUpdateHeirStage(e.target.value)}
                    className="bg-slate-800 text-amber-300 font-bold text-xs px-2 py-0.5 rounded border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {["Infant", "Toddler", "Child", "Teen", "Young Adult", "Adult", "Elder"].map((stg) => (
                      <option key={stg} value={stg} className="bg-slate-900 text-white">
                        {stg === "Toddler" ? "🧸 Toddler (IF 25% Roll)" : stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Choose Heir Randomly among multiple Sims or children, plus explicit Death/Revive Option */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isHeirDead ? (
                  <button
                    onClick={() => handleMarkHeirDeceased()}
                    className="text-[11px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 hover:border-rose-500 px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="If your Heir dies during gameplay, click here to trigger succession to a surviving child per legacy rules"
                  >
                    <span>💀</span>
                    <span>Heir Died in Game (Succession)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReviveHeir}
                    className="text-[11px] bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/60 hover:border-emerald-400 px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="Restore Heir Sim to alive status"
                  >
                    <span>💖</span>
                    <span>Revive Heir (Mark Alive)</span>
                  </button>
                )}

                {(currentHousehold || []).filter(s => !s.isPet && !s.ghost).length >= 2 && (
                  <button
                    onClick={handleChooseRandomHeir}
                    className="text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Constraint Mode: Randomly select the Heir among multiple Sims (Founders, Partners, Helpers, or Children)"
                  >
                    <span>🎲</span>
                    <span>Choose Heir Randomly (Multiple Sims)</span>
                  </button>
                )}
                {survivingChildren.length > 0 && !isHeirDead && (
                  <button
                    onClick={handleRollRandomSuccessor}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500 px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Randomly pick another living child in the household as the Heir"
                  >
                    <span>🎲</span>
                    <span>Roll Random Child as Heir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Active Generation Rule Directives & Highlights Bar */}
      {currentRoll && (
        <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                Active PieceOfPrincess Rules & Directives (Gen {generationNumber}):
              </span>
            </div>
            <button
              onClick={() => {
                setActiveRulesTab('general');
                setShowRulesModal(true);
              }}
              className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Complete Official Rulebook</span>
              <span>↗</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2 text-[11px]">
            {/* Heir Order Arrival Directive */}
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/80 shadow-sm">
              <div className="flex items-center justify-between text-amber-300 font-extrabold mb-0.5">
                <span className="flex items-center gap-1">
                  <span>👑</span>
                  <span>Next Heir Order</span>
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                  {getOrdinal(currentRoll.children.heirOrder || 1)} Arrival
                </span>
              </div>
              <p className="text-amber-100 text-[10px] leading-relaxed font-bold">
                The {getOrdinal(currentRoll.children.heirOrder || 1)} child born or adopted will be the Next Heir!
              </p>
            </div>

            {/* Universal Rule 3 */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-amber-300 font-bold mb-0.5">
                <span>💰 Rule 3: Income Restricted</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Only earn money from the rolled career source. No unapproved Plopsy crafting, painting, or yard selling.
              </p>
            </div>

            {/* Universal Rules 4 & 5 */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-amber-300 font-bold mb-0.5">
                <span>🎂 Rules 4 & 5: Age & Potions</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Sims age up only on natural birthdays. Aspiration reward points cannot be used on potions.
              </p>
            </div>

            {/* Single Sim vs Partner/Helper Context */}
            {currentRoll.marital.entry.partnerCount === 0 && currentRoll.marital.entry.helperCount === 0 ? (
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60">
                <div className="flex items-center justify-between text-rose-300 font-bold mb-0.5">
                  <span>🚪 Rule 6: Single Sim Rule</span>
                </div>
                <p className="text-rose-200/90 text-[10px] leading-relaxed">
                  Baby's other parent cannot move in as roommate. Stayovers allowed with NO chore help; kick out immediately if pregnant.
                </p>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/60">
                <div className="flex items-center justify-between text-sky-300 font-bold mb-0.5">
                  <span>💍 Partner / Helper Rule</span>
                </div>
                <p className="text-sky-200/90 text-[10px] leading-relaxed">
                  When partner/helper dies, refill spot and re-roll C2 job. Poly partners cannot be bio parent of heir unless Half-Siblings.
                </p>
              </div>
            )}

            {/* Home Lot Lock or Change of Scenery */}
            {currentRoll.goal.entry.id === 8 ? (
              <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-700/80">
                <div className="flex items-center justify-between text-purple-300 font-bold mb-0.5">
                  <span>📍 Change of Scenery</span>
                </div>
                <p className="text-purple-200 text-[10px] leading-relaxed">
                  Home lot lock lifted: this generation is officially required to move houses or rebuild on a different lot!
                </p>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-300 font-bold mb-0.5">
                  <span>📍 Home Lot Lock</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Must remain on this generation's lot the entire time unless Goal #8 (Change of Scenery) is rolled.
                </p>
              </div>
            )}

            {/* Aspiration Lock Directive Card */}
            <div className={`p-2 rounded-lg border ${
              ruleOrientation === 'inverted'
                ? 'bg-purple-950/40 border-purple-800/60'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center justify-between font-bold mb-0.5">
                <span className={ruleOrientation === 'inverted' ? 'text-purple-300' : 'text-sky-300'}>
                  {ruleOrientation === 'inverted' ? '🔄 Inverted Rules' : '🎯 Aspiration Lock Matrix'}
                </span>
                {onToggleRuleOrientation && (
                  <button
                    onClick={onToggleRuleOrientation}
                    className="text-[9px] text-amber-300 hover:underline font-bold"
                    title="Toggle between Standard and Inverted modes"
                  >
                    Switch ⇄
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                {ruleOrientation === 'inverted'
                  ? 'Aspiration dictates Career: choosing an aspiration auto-assigns matching required careers.'
                  : '15 aspirations (Author, Painter, Chef, etc.) require matching careers; incompatible choices are locked.'}
              </p>
            </div>

            {/* Gender Identity & CAS Customization Rule */}
            <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/60">
              <div className="flex items-center justify-between text-sky-300 font-bold mb-0.5">
                <span>⚧ Gender Identity</span>
                <span className="text-[9px] bg-sky-900 text-sky-200 px-1 py-0.2 rounded font-mono">Unlocked</span>
              </div>
              <p className="text-sky-200/90 text-[10px] leading-relaxed">
                Gender, pronouns, clothing style, body frame, reproduction, and toilet usage (sitting/standing) are fully unlocked when editing a Sim normally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The 5 Main Rolls Cards */}
      {currentRoll && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Roll A: Marital Status */}
          <div className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">💍</span>
                  <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                    A) Marital Status
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    Dice: {currentRoll.marital.diceRoll}/54
                  </span>
                  {jokerRerollsAvailable > 0 ? (
                    <button
                      onClick={() => handleUseJokerOnCategory('marital')}
                      className="text-xs bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-2.5 py-0.5 rounded transition-all font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                      title="Use your 1 Starting Joker to re-roll Marital Status!"
                    >
                      <span>🃏</span>
                      <span>Use Joker</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono flex items-center gap-1" title="In Random Legacy Challenge, re-rolls are unauthorized without an available Joker.">
                      <span>🔒</span>
                      <span>Requires Joker</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                <span>{currentRoll.marital.entry.title}</span>
                {currentRoll.marital.entry.pack && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    {currentRoll.marital.entry.pack}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentRoll.marital.entry.description}
              </p>

              {/* Requirement Tags */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Partners: <strong>{currentRoll.marital.entry.partnerCount}</strong>
                </span>
                {currentRoll.marital.entry.helperCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    Helpers: <strong>{currentRoll.marital.entry.helperCount}</strong>
                  </span>
                )}
                {currentRoll.marital.entry.petCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Pets: <strong>{currentRoll.marital.entry.petCount}</strong>
                  </span>
                )}
                {currentRoll.marital.entry.minChildren && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Min Children: <strong>{currentRoll.marital.entry.minChildren}</strong>
                  </span>
                )}
              </div>

              {/* Couple & Helper Flexibility Directive */}
              <div className="mt-2.5 p-2 bg-pink-950/30 rounded-lg border border-pink-700/40 text-[11px] text-pink-200/90 leading-snug space-y-1">
                <div className="flex items-center gap-1 font-bold text-pink-300">
                  <span>💡</span>
                  <span>Couple & Helper Rule Flexibility:</span>
                </div>
                <p>
                  • <strong>Couples are NOT locked to marriage:</strong> You may choose Married, Engaged, Dating, Domestic Partners, Unmarried Co-parents, or WooHoo Partners (Friends with Benefits).
                </p>
                <p>
                  • <strong>Option 3 (Family Helpers):</strong> Helpers can be biological or extended family (e.g. an Uncle, Aunt, Brother, Sister, Cousin, or Grandparent) living in the manor to raise the children, or live-in friends/royal staff.
                </p>
              </div>

              {/* Residential Rental Unit Rules Notice */}
              {(currentRoll.marital.entry.rentalRental || currentLot.dwellingType === 'Residential Rental') && (
                <div className="mt-3 p-2.5 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-950 rounded-lg border border-sky-500/40 text-xs">
                  <div className="flex items-center justify-between text-sky-300 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span>🏢</span>
                      <span>Residential Rental Unit Rules:</span>
                    </span>
                    <span className="text-[10px] bg-sky-950 text-sky-200 border border-sky-500/40 px-1.5 py-0.5 rounded font-mono">
                      Unit #{currentLot.rentalConfig?.heirUnitNumber || 1} of {currentLot.rentalConfig?.totalUnits || 4} Enforced
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {currentLot.rentalConfig?.units[currentLot.rentalConfig.heirUnitNumber]?.activeRules.length ? (
                      <span>
                        Heir Laws: <strong className="text-amber-300">{currentLot.rentalConfig.units[currentLot.rentalConfig.heirUnitNumber].activeRules.join(' • ')}</strong> (Neighbor units discarded).
                      </span>
                    ) : (
                      <span>0 rules enforced for Heir. Inspect or customize in the <strong>Residence tab</strong>!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Shared Custody Sub-roll */}
              {currentRoll.marital.entry.hasCustodySubroll && currentRoll.marital.custodySchedule && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                    <span>⚖️ Custody & Child Support (Roll 1–7):</span>
                    <button
                      onClick={handleRerollCustody}
                      className="text-[10px] bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-bold transition-all"
                    >
                      🎲 Re-roll Custody
                    </button>
                  </div>
                  <div className="font-semibold text-slate-100">
                    {currentRoll.marital.custodySchedule.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentRoll.marital.custodySchedule.description}
                  </div>
                </div>
              )}

              {/* Family & Romantic Dynamics when Married/Partnered */}
              {(currentRoll.marital.entry.partnerCount > 0 || currentRoll.marital.entry.helperCount > 0) && (
                <div className="mt-3 p-2.5 bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 rounded-lg border border-rose-500/30 text-xs shadow">
                  <div className="flex items-center justify-between text-rose-300 font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>💞</span>
                      <span>Marital & Family Mechanics:</span>
                    </span>
                    <button
                      onClick={handleRerollDynamics}
                      className="text-[10px] bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-300 px-1.5 py-0.5 rounded font-bold transition-all border border-rose-500/40"
                      title="Re-roll Family Dynamic & Romantic Dynamic"
                    >
                      🎲 Re-roll Dynamics
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {currentRoll.marital.familyDynamic && (
                      <div className="flex items-center justify-between gap-1 text-slate-200">
                        <span className="text-amber-400 font-semibold text-[11px]">Family Dynamic:</span>
                        <span className="bg-amber-950/70 text-amber-200 border border-amber-600/40 px-2 py-0.5 rounded font-bold text-[11px]">
                          {currentRoll.marital.familyDynamic}
                        </span>
                      </div>
                    )}
                    {currentRoll.marital.romanticDynamic && (
                      <div className="flex items-center justify-between gap-1 text-slate-200">
                        <span className="text-rose-400 font-semibold text-[11px]">Romantic Dynamic:</span>
                        <span className="bg-rose-950/70 text-rose-200 border border-rose-600/40 px-2 py-0.5 rounded font-bold text-[11px]">
                          {currentRoll.marital.romanticDynamic}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Roll New Partner in case of divorce or moving away */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] text-slate-400">
                  Divorced, remarried, or need a replacement partner?
                </div>
                <button
                  onClick={() => onRollCompleteNewSim?.('partner')}
                  className="text-[10.5px] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                  title="Completely roll and add a new spouse/partner to the household (with newly rolled C2 career and romantic dynamic) for post-divorce or move-out replacement"
                >
                  <span>💍</span>
                  <span>Roll & Add New Partner</span>
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Roll Range: [{currentRoll.marital.entry.diceRange}]
            </div>
          </div>

          {/* Roll B: Number of Children */}
          <div className="bg-slate-950/90 border border-slate-800 hover:border-purple-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">👶</span>
                  <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                    B) Number of Children
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    Dice: {currentRoll.children.diceRoll}/10
                  </span>
                  {jokerRerollsAvailable > 0 ? (
                    <button
                      onClick={() => handleUseJokerOnCategory('children')}
                      className="text-xs bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-2.5 py-0.5 rounded transition-all font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                      title="Use your 1 Starting Joker to re-roll Number of Children!"
                    >
                      <span>🃏</span>
                      <span>Use Joker</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono flex items-center gap-1" title="In Random Legacy Challenge, re-rolls are unauthorized without an available Joker.">
                      <span>🔒</span>
                      <span>Requires Joker</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="font-black text-2xl text-purple-300 flex items-center gap-2">
                <span>{currentRoll.children.targetCount} {currentRoll.children.targetCount === 1 ? 'Child' : 'Children'}</span>
              </div>

              <p className="text-xs text-slate-300 mt-1">
                Target offspring for this generation: <strong>{currentRoll.children.entry.label}</strong>.
              </p>

              {/* Heir Arrival Order Rule Directive */}
              <div className="mt-2.5 p-2.5 bg-amber-950/60 rounded-xl border border-amber-500/80 text-xs text-amber-200 shadow-md">
                <div className="font-extrabold flex items-center justify-between text-amber-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">👑</span>
                    <span>Next Heir Arrival Rule:</span>
                  </span>
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] uppercase">
                    {getOrdinal(currentRoll.children.heirOrder || 1)} Arrival = Next Heir
                  </span>
                </div>
                <div className="text-amber-100 font-bold leading-snug">
                  {currentRoll.children.heirOrderDescription || getHeirOrderDescription(currentRoll.children.heirOrder || 1, currentRoll.children.targetCount)}
                </div>
                <div className="text-amber-300/80 text-[10px] mt-1 italic">
                  Children are not auto-rolled upfront — add them manually via birth or adoption as they happen in your gameplay. The {getOrdinal(currentRoll.children.heirOrder || 1)} child added will automatically be designated as the official Next Heir!
                </div>
              </div>

              {/* Live Children Tracker & Manual Addition Buttons */}
              {(() => {
                const currentKids = (currentHousehold || []).filter(s => 
                  !s.isPet && (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
                );
                const target = currentRoll.children.targetCount;
                const nextArrivalIndex = currentKids.length + 1;
                const isNextArrivalHeir = (nextArrivalIndex === (currentRoll.children.heirOrder || 1));

                return (
                  <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-purple-300 flex items-center gap-1.5">
                        <span>👶</span>
                        <span>Children Added to Household:</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-extrabold ${
                        currentKids.length >= target ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' : 'bg-slate-800 text-amber-300 border border-slate-700'
                      }`}>
                        {currentKids.length} / {target} Planned
                      </span>
                    </div>

                    {/* Arrival Slots visual indicators */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {Array.from({ length: target }).map((_, idx) => {
                        const slotNum = idx + 1;
                        const child = currentKids[idx];
                        const isHeirSlot = (slotNum === (currentRoll.children.heirOrder || 1));
                        return (
                          <div
                            key={slotNum}
                            className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1.5 transition-all ${
                              child
                                ? (child.isNextHeir 
                                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-black shadow-sm'
                                    : 'bg-slate-800 border-slate-700 text-slate-200')
                                : (isHeirSlot
                                    ? 'bg-amber-950/40 border-dashed border-amber-500/70 text-amber-300 animate-pulse'
                                    : 'bg-slate-950/60 border-dashed border-slate-700 text-slate-500')
                            }`}
                          >
                            <span>{child ? (child.isNextHeir ? '👑' : (child.isAdopted ? '🧒' : '👶')) : (isHeirSlot ? '⭐' : '⏳')}</span>
                            <span>Child #{slotNum}</span>
                            {isHeirSlot && <span className="text-[9px] text-amber-400 font-extrabold">(Next Heir)</span>}
                            {child && <span className="text-emerald-400 font-black">✓</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Manual Add Child Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleAddLegacyChild(false)}
                        className="flex-1 min-w-[130px] px-2.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="Add biological child (Infant) born to this generation"
                      >
                        <span>🍼➕</span>
                        <span>Add Birth {isNextArrivalHeir ? '👑 (Next Heir!)' : `(#${nextArrivalIndex})`}</span>
                      </button>

                      <button
                        onClick={() => handleAddLegacyChild(true)}
                        className="flex-1 min-w-[130px] px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="Add adopted child (Infant)"
                      >
                        <span>📜➕</span>
                        <span>Add Adoption {isNextArrivalHeir ? '👑 (Next Heir!)' : `(#${nextArrivalIndex})`}</span>
                      </button>
                    </div>

                    {/* Constraint Mode: Random Heir among Multiple Children / Sims */}
                    {(currentKids.length >= 2 || (currentHousehold || []).filter(s => !s.isPet && !s.ghost).length >= 2) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] text-amber-300/80 font-medium">
                          Multiple Sims / children present:
                        </span>
                        <button
                          onClick={handleChooseRandomHeir}
                          className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ml-auto"
                          title="Constraint Mode: Choose Heir strictly at random among all eligible Sims / children"
                        >
                          <span>🎲</span>
                          <span>Choose Heir Randomly ({currentKids.length >= 2 ? `${currentKids.length} Children` : 'Multiple Sims'})</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Mixed / Biological breakdown notice */}
              {currentRoll.marital.entry.title.includes("Mixed") && (
                <div className="mt-2.5 p-2 bg-purple-950/60 rounded-lg border border-purple-800/80 text-[11px] text-purple-200">
                  <div className="font-extrabold flex items-center gap-1.5 text-purple-300">
                    <span>🧬</span>
                    <span>Mixed Generation Active (Bio + Adopted):</span>
                  </div>
                  <div className="text-slate-200 mt-0.5 leading-snug">
                    Must have both biological and adopted children (e.g. 1 Bio + 1 Adopted)!
                  </div>
                  <div className="mt-1.5 p-1.5 rounded bg-sky-950/90 border border-sky-600/50 text-[10px] text-sky-200 leading-snug">
                    <span>🧪</span> <strong>Science Baby Co-Parenthood:</strong> Male and female Sims (and homosexual couples: male+male, female+female) can have biological children together using the phone/computer <em>"Have Science Baby with..."</em> interaction. Both partners are registered as full biological parents on the family tree!
                  </div>
                  <div className="mt-1 p-1.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
                    <span>👻</span>
                    <span><strong>Ghost Pregnancy Mod Enabled:</strong> Ghost Heirs & spouses can freely conceive biological children, WooHoo, and have Science Babies!</span>
                  </div>
                </div>
              )}

              {currentRoll.marital.entry.title.includes("Second Chance") && (
                <div className="mt-2.5 p-2 bg-indigo-950/50 rounded border border-indigo-800/60 text-[11px] text-indigo-200">
                  <span className="font-bold">Second Chance Rule:</span> Children should be born from subsequent distinct partners.
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Roll Range: [{currentRoll.children.entry.diceRange}] • Capped at max 5
            </div>
          </div>

          {/* Roll C: Careers (Heir & Secondary) */}
          <div className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-lg">
            {(() => {
              const secondarySlots: SecondaryCareerSlot[] = currentRoll.secondaryCareers && currentRoll.secondaryCareers.length > 0
                ? currentRoll.secondaryCareers
                : (currentRoll.secondaryCareer ? [{
                    id: "legacy-partner",
                    role: "spouse",
                    label: "Spouse / Live-in Partner",
                    tag: "Spouse",
                    career: currentRoll.secondaryCareer
                  }] : []);

              return (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-lg">💼</span>
                      <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                        C) Careers (Heir & Others)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        C1: {currentRoll.heirCareer.categoryRoll}/10 • C2: {secondarySlots.length > 0 ? `${secondarySlots.length} Sims` : 'N/A (Single)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {jokerRerollsAvailable > 0 ? (
                        <button
                          onClick={() => handleUseJokerOnCategory('careers')}
                          className="text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-2.5 py-1 rounded-lg transition-all font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                          title="Use 1 Joker to re-roll ALL careers in the generation (Heir and all spouses/helpers together)!"
                        >
                          <span>🃏</span>
                          <span>Use Joker (Reroll All Careers)</span>
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono flex items-center gap-1" title="In Random Legacy Challenge, re-rolls are unauthorized without an available Joker.">
                          <span>🔒</span>
                          <span>Requires Joker</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* C1 Primary Heir */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 mb-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1 flex-wrap gap-1">
                      <span>C1 Primary — Heir:</span>
                    </div>
                    <div 
                      className="text-xs text-slate-200 leading-snug"
                      dangerouslySetInnerHTML={{ __html: formatCareerLabel(currentRoll.heirCareer) }}
                    />
                  </div>

                  {/* C2 Secondary Others - Rolled for each spouse and helper */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span>C2 Secondary Careers:</span>
                        {secondarySlots.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                            {secondarySlots.length} {secondarySlots.length === 1 ? 'Slot' : 'Slots'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleAddOptionalSecondaryCareer}
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        title="Roll an additional C2 job for a new partner, remarriage, or extra helper"
                      >
                        <span>➕</span>
                        <span>Add New C2 Job</span>
                      </button>
                    </div>

                    {secondarySlots.length > 0 ? (
                      <div className="space-y-2">
                        {secondarySlots.map((slot) => {
                          const isSpouse = slot.role === 'spouse';
                          const badgeBg = isSpouse
                            ? 'bg-pink-950/70 text-pink-300 border-pink-700/50'
                            : slot.tag.includes('Occult')
                              ? 'bg-purple-950/70 text-purple-300 border-purple-700/50'
                              : 'bg-teal-950/70 text-teal-300 border-teal-700/50';

                          return (
                            <div
                              key={slot.id}
                              className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-xs transition-all"
                            >
                              <div className="flex items-center justify-between gap-1.5 pb-1 mb-1.5 border-b border-slate-850 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}>
                                    {slot.label}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Roll: #{slot.career.categoryRoll}/10 ({slot.career.categoryType})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRerollSingleSecondaryCareer(slot.id)}
                                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:border-sky-500 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                                  title="Re-roll this specific C2 job independently in case of divorce, death, breakup, or remarriage"
                                >
                                  <span>🎲</span>
                                  <span>Re-roll C2 Job</span>
                                </button>
                              </div>
                              <div
                                className="text-slate-200 leading-snug pl-0.5 text-xs"
                                dangerouslySetInnerHTML={{ __html: formatCareerLabel(slot.career) }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                          <span>ℹ️</span>
                          <span>No Secondary Career Needed</span>
                        </div>
                        <div className="text-slate-300 leading-tight">
                          Marital Status is <strong>{currentRoll.marital.entry.title}</strong> (Single Parent). Secondary careers are rolled when there are live-in spouses, subsequent partners, or helpers.
                        </div>
                        <button
                          onClick={handleAddOptionalSecondaryCareer}
                          className="mt-2 text-[10px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <span>➕</span>
                          <span>Roll C2 Career for Optional Partner/Helper</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Categories: Conventional (1–65) • Unconventional (1–82) • Part-Time (1–11)
            </div>
          </div>

          {/* Roll D: Generation Goal */}
          <div className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-lg md:col-span-1 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🎯</span>
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    D) Generation Goal (1–80)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setIsGoalMinimized(prev => !prev)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-sm font-semibold"
                    title={isGoalMinimized ? "Expand full objectives & rules directives" : "Minimize to compact summary"}
                  >
                    <span>{isGoalMinimized ? '➕' : '➖'}</span>
                    <span>{isGoalMinimized ? 'Expand Details' : 'Minimize Details'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    Dice: #{currentRoll.goal.diceRoll}/80
                  </span>
                  {jokerRerollsAvailable > 0 ? (
                    <button
                      onClick={() => handleUseJokerOnCategory('goal')}
                      className="text-xs bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-2.5 py-0.5 rounded transition-all font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                      title="Use your 1 Starting Joker to re-roll Generation Goal!"
                    >
                      <span>🃏</span>
                      <span>Use Joker</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono flex items-center gap-1" title="In Random Legacy Challenge, re-rolls are unauthorized without an available Joker.">
                      <span>🔒</span>
                      <span>Requires Joker</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base text-amber-300">
                    #{currentRoll.goal.entry.id}: {currentRoll.goal.entry.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {currentRoll.goal.entry.pack}
                  </span>
                </div>
                {isGoalMinimized && (
                  <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    Compact View Active
                  </span>
                )}
              </div>

              {isGoalMinimized ? (
                <div className="mt-2.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
                  <p className="line-clamp-2 leading-relaxed text-slate-300 text-xs">
                    {currentRoll.goal.entry.description}
                  </p>
                  <button
                    onClick={() => setIsGoalMinimized(false)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold shrink-0 underline cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-amber-900/60"
                  >
                    Read Full Rules ➔
                  </button>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto pr-1.5 mt-2 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">

              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                {currentRoll.goal.entry.description}
              </p>

              {currentRoll.goal.entry.notes && (
                <div className="mt-2 text-[11px] text-amber-400/90 italic bg-amber-950/30 p-2 rounded border border-amber-900/50">
                  ⚠️ Note: {currentRoll.goal.entry.notes}
                </div>
              )}

              {/* Sub-roll for Midlife Crisis (Goal 12) */}
              {currentRoll.goal.entry.id === 12 && !isHeirAdult && (
                <div className="mt-3 p-3.5 bg-slate-900 rounded-xl border border-amber-500/50 text-xs shadow-inner space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <span className="text-base">📌</span>
                      <span className="uppercase tracking-wider">Goal 12 Noted on Heir's Challenges: Midlife Crisis</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded font-bold">
                      🔒 Aspects Sealed Until Adult
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Midlife Crisis is noted as the official generation goal on the Heir's challenges. However, per PieceOfPrincess Random Legacy rules, <strong className="text-amber-200">crisis aspects cannot be rolled or revealed before the Heir ages up to Adult</strong>. They remain strictly sealed and hidden to prevent manipulating careers, marriages, or household plans in advance!
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                    <span>Heir Status (Sim #{activeHeirSim?.id || 1}):</span>
                    <span className="text-amber-300 font-bold px-1.5 py-0.5 bg-slate-950 rounded border border-slate-700">
                      {activeHeirSim?.stage || 'Young Adult'} (Not Adult Yet)
                    </span>
                    <span className="text-slate-400">→ Aspects will automatically roll and reveal when the Heir ages up to Adult!</span>
                  </div>
                </div>
              )}

              {currentRoll.goal.entry.id === 12 && isHeirAdult && currentRoll.goal.midlifeCrisisAspects && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2 flex-wrap gap-1">
                    <span className="flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>3 Midlife Crisis Aspects (Revealed at Adulthood):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1" title="Rules forbid altering or re-rolling midlife crisis aspects!">
                      <span>🔒</span>
                      <span>Locked (Altering Forbidden)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentRoll.goal.midlifeCrisisAspects.map((asp, idx) => (
                      <div key={idx} className={`p-2 rounded border text-[11px] ${asp.roll === 3 ? 'bg-amber-950/60 border-amber-500 shadow' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="font-bold text-amber-300 flex items-center justify-between">
                          <span>#{asp.roll} {asp.title}</span>
                          {asp.roll === 3 && <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">Auto C1 Reroll</span>}
                        </div>
                        <div className="text-[10px] text-rose-400 font-semibold">{asp.deadline}</div>
                        <div className="text-slate-400 mt-1">{asp.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Midlife Crisis Aspect 3 Active Indicator & Trigger */}
                  {currentRoll.goal.midlifeCrisisAspects.some(a => a.roll === 3) && (
                    <div className="mt-2.5 p-2 bg-gradient-to-r from-amber-950/80 to-rose-950/80 rounded-lg border border-amber-500/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <span className="text-base">🔥</span>
                        <div>
                          <div className="font-extrabold text-amber-300">
                            Aspect #3 Active: Auto Re-roll Career on Adulthood
                          </div>
                          <div className="text-[10px] text-slate-300">
                            Quit current job & re-roll C1 career. Automatically triggers when Heir reaches Adult stage!
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleTriggerMidlifeCrisisCareerReroll}
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-[11px] rounded shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        title="Trigger Midlife Crisis Aspect 3: Quit current job and re-roll Adult C1 Career now"
                      >
                        <span>⚡</span>
                        <span>Re-roll Adult C1 Career Now</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Note Summary Box */}
                  <div className="mt-2.5 p-2.5 bg-slate-950 rounded-lg border border-amber-500/50 text-xs">
                    <div className="text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5 mb-1.5">
                      <span>📝</span>
                      <span>Quick Note — Midlife Crisis Directives:</span>
                    </div>
                    <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                      {currentRoll.goal.midlifeCrisisAspects.map((asp, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-amber-400">•</span>
                          <span>
                            <strong className="text-amber-200">#{asp.roll} {asp.title}</strong>{' '}
                            <span className="text-rose-400 font-semibold">[{asp.deadline}]:</span>{' '}
                            <span className="text-slate-300 font-sans">{asp.description}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-roll for Party King/Queen (Goal 9) */}
              {currentRoll.goal.entry.id === 9 && (
                <div className="mt-3 p-3.5 bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/70 rounded-xl border-2 border-purple-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-purple-200 flex items-center gap-2">
                          <span>Party King / Party Queen — 4 Mandatory Social Events</span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                            Goal 9
                          </span>
                        </h4>
                        <p className="text-[11px] text-purple-300/80">
                          Host all 4 randomly chosen celebratory group parties and achieve a <strong className="text-amber-300 font-extrabold">Gold Medal</strong> on each before the Heir passes away!
                        </p>
                      </div>
                    </div>
                    {/* Gold Medals Counter Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 border border-amber-500/60 text-xs font-mono font-bold text-amber-300 shadow">
                      <span>🏆</span>
                      <span>
                        {(currentRoll.goal.partyGoals || []).filter(p => p.isGoldAchieved).length} of 4 Gold Medals Conquered
                      </span>
                    </div>
                  </div>

                  {/* 4 Rolled Event Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(currentRoll.goal.partyGoals || []).map((party, idx) => {
                      const isGold = !!party.isGoldAchieved;
                      return (
                        <div
                          key={party.id || idx}
                          onClick={() => handleTogglePartyGoldMedal(party.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex flex-col justify-between ${
                            isGold
                              ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
                              : 'bg-slate-950/80 border-slate-800 hover:border-purple-400/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-bold text-sm text-white break-words">
                                <span className="font-mono text-xs text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/60">
                                  #{idx + 1}
                                </span>
                                <span className={isGold ? 'text-amber-200 font-extrabold line-through decoration-amber-400/80 decoration-2' : 'text-slate-100'}>
                                  {party.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[10px] bg-slate-900 text-emerald-300 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-800/60">
                                  Cost: {party.cost}
                                </span>
                                <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800/60 font-semibold flex items-center gap-1">
                                  <span>☑️</span>
                                  <span>Goals & Rewards</span>
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 text-2xl">
                              {isGold ? '🏆' : '⚪'}
                            </div>
                          </div>

                          {/* Interactive Gold Medal Checkbox Button */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isGold}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleTogglePartyGoldMedal(party.id);
                                }}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                              />
                              <span className={isGold ? 'text-amber-300 font-extrabold' : 'text-slate-300'}>
                                {isGold ? '🏆 Gold Medal Conquered!' : 'Mark Gold Medal Complete'}
                              </span>
                            </label>
                            {isGold && (
                              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
                                Completed!
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unauthorized Reroll Decree Banner */}
                  <div className="p-2.5 bg-slate-950/90 rounded-lg border border-rose-900/60 text-[11px] text-rose-300/95 flex items-center gap-2.5 shadow">
                    <span className="text-lg shrink-0">🔒</span>
                    <span className="leading-tight">
                      <strong>Rules Decree (Locked):</strong> Re-rolling individual party events for Party King/Queen is strictly <strong>unauthorized</strong>. You must host and complete all 4 randomly rolled celebratory events to Gold tier without substitution!
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-roll for Saving Space (Goal 33) */}
              {currentRoll.goal.entry.id === 33 && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-teal-800/60 text-xs text-teal-300">
                  <span className="font-bold">📐 Tiny Home Tier Requirements:</span>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-[11px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">≤3 Sims: Tier 1 (32 tiles)</div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">≤6 Sims: Tier 2 (64 tiles)</div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">≤8 Sims: Tier 3 (100 tiles)</div>
                  </div>
                </div>
              )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Generation Goal Rulebook (80 Total Goals across Base Game & DLC)
            </div>
          </div>

          {/* Roll E: Miscellaneous Fun */}
          <div className="bg-slate-950/90 border border-slate-800 hover:border-rose-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🎪</span>
                  <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                    E) Miscellaneous Fun (1–78)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setIsFunMinimized(prev => !prev)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-sm font-semibold"
                    title={isFunMinimized ? "Expand full misc fun directives" : "Minimize to compact summary"}
                  >
                    <span>{isFunMinimized ? '➕' : '➖'}</span>
                    <span>{isFunMinimized ? 'Expand Details' : 'Minimize Details'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    Dice: #{currentRoll.fun.diceRoll}/78
                  </span>
                  {jokerRerollsAvailable > 0 ? (
                    <button
                      onClick={() => handleUseJokerOnCategory('fun')}
                      className="text-xs bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 px-2.5 py-0.5 rounded transition-all font-black flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                      title="Use your 1 Starting Joker to re-roll Misc Fun!"
                    >
                      <span>🃏</span>
                      <span>Use Joker</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono flex items-center gap-1" title="In Random Legacy Challenge, re-rolls are unauthorized without an available Joker.">
                      <span>🔒</span>
                      <span>Requires Joker</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base text-rose-300">
                    #{currentRoll.fun.entry.id}: {currentRoll.fun.entry.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    {currentRoll.fun.entry.pack}
                  </span>
                </div>
                {isFunMinimized && (
                  <span className="text-[10px] font-mono text-rose-400/90 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                    Compact View Active
                  </span>
                )}
              </div>

              {isFunMinimized ? (
                <div className="mt-2.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
                  <p className="line-clamp-2 leading-relaxed text-slate-300 text-xs">
                    {currentRoll.fun.entry.description}
                  </p>
                  <button
                    onClick={() => setIsFunMinimized(false)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold shrink-0 underline cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-rose-900/60"
                  >
                    Read Full Rules ➔
                  </button>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto pr-1.5 mt-2 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentRoll.fun.entry.description}
                  </p>

                  {currentRoll.fun.entry.notes && (
                    <div className="text-[11px] text-rose-400/90 italic bg-rose-950/30 p-2 rounded border border-rose-900/50">
                      ⚠️ Note: {currentRoll.fun.entry.notes}
                    </div>
                  )}

              {/* Sub-roll for Moody (#4) */}
              {currentRoll.fun.entry.id === 4 && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-indigo-400 font-bold mb-1">
                    <span>🎭 Rolled Required Mood (3h Weekly):</span>
                    <button
                      onClick={handleRerollMood}
                      className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white px-1.5 py-0.5 rounded font-bold transition-all"
                    >
                      🎲 Re-roll Mood
                    </button>
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded bg-indigo-950 text-indigo-200 font-extrabold border border-indigo-700">
                    {currentRoll.fun.rolledMood || 'Focused'}
                  </span>
                </div>
              )}

              {/* Sub-roll for Rainbow Brite (#25) */}
              {currentRoll.fun.entry.id === 25 && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                    <span>🌈 Rolled Signature Color:</span>
                    <button
                      onClick={handleRerollColor}
                      className="text-[10px] bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-slate-950 px-1.5 py-0.5 rounded font-bold transition-all"
                    >
                      🎲 Re-roll Color
                    </button>
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-800 text-white font-extrabold border border-slate-600">
                    {currentRoll.fun.rolledColor || 'Turquoise'}
                  </span>
                </div>
              )}

              {/* Sub-roll for Troubled Teens (#52) */}
              {currentRoll.fun.entry.id === 52 && currentRoll.fun.rolledTroubledTeenType && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <div className="text-amber-400 font-bold mb-1">
                    ⚡ Troubled Teen Archetype:
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {currentRoll.fun.rolledTroubledTeenType}
                  </div>
                </div>
              )}

              {/* Sub-roll for Roommate Fun (#35) */}
              {currentRoll.fun.entry.id === 35 && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <span className="font-bold text-sky-400">NPC Roommates Required:</span>{' '}
                  <span className="font-mono font-extrabold text-white">{currentRoll.fun.rolledRoommates || 2} Roommates</span>
                </div>
              )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              Miscellaneous Fun Rulebook (78 Total Rules)
            </div>
          </div>

        </div>
      )}

      {/* Packs Filter Modal */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-sky-400 flex items-center gap-2">
                  <span>📦</span>
                  <span>The Sims 4 Pack Filter (For Random Legacy Rolls)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select which expansion, game, and stuff packs you own. Rolls will automatically exclude packs you don't have.
                </p>
              </div>
              <button
                onClick={() => setIsPackModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick buttons */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => setEnabledPacks(new Set(allPackCodes))}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold"
              >
                Select All ({packsList.length})
              </button>
              <button
                onClick={() => setEnabledPacks(new Set(["BG"]))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
              >
                Base Game Only
              </button>
              <span className="text-slate-500 text-xs ml-auto font-mono">
                {enabledPacks.size} / {packsList.length} Selected
              </span>
            </div>

            {/* Packs Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {packsList.map(pack => {
                const isSelected = enabledPacks.has(pack.code);
                return (
                  <label
                    key={pack.code}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/70 border-sky-600/80 text-sky-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={pack.code === 'BG'} // Base Game always enabled
                      onChange={(e) => {
                        const updated = new Set(enabledPacks);
                        if (e.target.checked) updated.add(pack.code);
                        else updated.delete(pack.code);
                        setEnabledPacks(updated);
                      }}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <div className="truncate">
                      <div className="font-bold truncate text-[11px]">{pack.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{pack.code} • {pack.type}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsPackModalOpen(false)}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-amber-400 flex items-center gap-2">
                  <span>📜</span>
                  <span>Random Legacy Challenge Generation Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track and review the full multi-generation history of your legacy family.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {legacyHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No generations saved yet. Roll Generation 1 and click "Save" or "Generate Household" to begin your legacy family ledger!
                </div>
              ) : (
                legacyHistory.map(entry => (
                  <div
                    key={entry.generation}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-850">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-sm">
                          👑 Generation {entry.generation}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Saved: {entry.timestamp}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setGenerationNumber(entry.generation);
                          setCurrentRoll(entry);
                          setShowHistoryModal(false);
                          onTriggerNotice(`Loaded Generation ${entry.generation} rolls!`);
                        }}
                        className="bg-slate-800 hover:bg-sky-600 text-sky-300 hover:text-slate-950 px-2.5 py-1 rounded text-[11px] font-bold transition-all"
                      >
                        Load This Gen
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-bold block">Marital Status:</span>
                        <span className="text-sky-300 font-semibold">{entry.marital.entry.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Children:</span>
                        <span className="text-purple-300 font-semibold">{entry.children.targetCount} Kids</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Generation Goal:</span>
                        <span className="text-amber-300 font-semibold truncate block">#{entry.goal.diceRoll} {entry.goal.entry.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Misc Fun:</span>
                        <span className="text-rose-300 font-semibold truncate block">#{entry.fun.diceRoll} {entry.fun.entry.title}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Total Saved: <strong>{legacyHistory.length}</strong> Generations
                </span>
                {legacyHistory.length > 0 && (
                  <button
                    onClick={handleExportBackupFile}
                    className="bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                    title="Download complete ledger as a .json backup file"
                  >
                    <span>📥</span>
                    <span>Download Ledger (.json)</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Backup & Persistence Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">💾</span>
                <div>
                  <h3 className="font-extrabold text-base text-emerald-400 flex items-center gap-2">
                    <span>External Backup & Storage Manager</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                      Auto-Saved to Browser
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Save your legacy progress outside this program so you never lose your family data on reload or clear cache.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setPasteError(null);
                }}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Status Banner */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Browser Storage Status: Active & Synced</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Current Gen: <strong className="text-amber-300">Generation {generationNumber}</strong> • History Records: <strong className="text-sky-300">{legacyHistory.length} Gens</strong> • Live Sims: <strong className="text-purple-300">{currentHousehold?.length || 0} Sims</strong>
                  </div>
                </div>
                <div className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded font-mono">
                  Saved in LocalStorage
                </div>
              </div>

              {/* Option 1: Download File Outside of Program */}
              <div className="p-4 bg-gradient-to-br from-sky-950/40 to-slate-950 rounded-xl border border-sky-800/60 shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-sky-300 flex items-center gap-2">
                      <span>📥</span>
                      <span>1. Download Backup File (.json) — Saved Outside Program</span>
                    </h4>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Downloads your full legacy challenge state, active generation rolls, past history ledger, and simulated household to a <strong className="text-sky-200">.json file</strong> on your computer. Keep this file in your Downloads or Documents folder so your data is permanently preserved outside of this program!
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportBackupFile}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <span>📥</span>
                    <span>Download Backup File</span>
                  </button>
                  <button
                    onClick={handleCopyBackupToClipboard}
                    className="bg-slate-800 hover:bg-slate-700 text-sky-200 border border-slate-700 px-3 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📋</span>
                    <span>Copy JSON to Clipboard</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Upload File to Restore */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-950 rounded-xl border border-emerald-800/60 shadow">
                <h4 className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
                  <span>📂</span>
                  <span>2. Restore from Backup File (.json)</span>
                </h4>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                  Select a previously downloaded <code className="text-emerald-200 bg-slate-900 px-1 py-0.5 rounded">sims4-legacy-gen*-backup-*.json</code> file from your computer. It will instantly restore all your rolls, history ledger, and household Sims!
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <span>📂</span>
                    <span>Choose Backup File to Restore</span>
                  </button>
                </div>
              </div>

              {/* Option 3: Paste JSON text */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow">
                <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                  <span>📋</span>
                  <span>3. Paste Raw Backup Code</span>
                </h4>
                <p className="text-slate-400 text-xs mt-1">
                  Have your backup code copied in Notepad, email, or clipboard? Paste the JSON code here to restore:
                </p>
                <div className="mt-2.5">
                  <textarea
                    rows={3}
                    value={backupPasteText}
                    onChange={(e) => {
                      setBackupPasteText(e.target.value);
                      setPasteError(null);
                    }}
                    placeholder='Paste {"version": 1, "generationNumber": ...} JSON text here'
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {pasteError && (
                    <div className="text-rose-400 text-[11px] font-bold mt-1">
                      ⚠️ {pasteError}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handlePasteRestore}
                      disabled={!backupPasteText.trim()}
                      className="bg-slate-800 hover:bg-emerald-600 disabled:opacity-50 text-emerald-300 hover:text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-all border border-slate-700 cursor-pointer"
                    >
                      ⚡ Restore from Text
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="p-3.5 bg-rose-950/20 rounded-xl border border-rose-900/40 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-bold text-rose-300 text-xs block">Reset Challenge Data</span>
                  <span className="text-[11px] text-slate-400">Clear all saved progress and return to Generation 1 fresh.</span>
                </div>
                <button
                  onClick={handleResetAllData}
                  className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  🗑️ Clear All Data
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Data is always safely kept in browser storage + external downloads.
              </span>
              <button
                onClick={() => setShowBackupModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Official Rules Modal (PieceOfPrincess Dec 26, 2020) */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">📖</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-amber-400 uppercase tracking-wide">
                      PieceOfPrincess Random Legacy Challenge Rules
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700">
                      Posted Dec 26, 2020
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your Sims' lives and family destiny decided at random over 10 generations. Complete rules, DLC pack bans, and aspiration requirements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xl p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search and Tab Nav */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <button
                  onClick={() => setActiveRulesTab('founder')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRulesTab === 'founder'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>👑</span>
                  <span>Founder & Home</span>
                </button>
                <button
                  onClick={() => setActiveRulesTab('general')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRulesTab === 'general'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>📜</span>
                  <span>The 6 General Rules</span>
                </button>
                <button
                  onClick={() => setActiveRulesTab('dlc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRulesTab === 'dlc'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>📦</span>
                  <span>DLC & Pack Rules ({PIECE_OF_PRINCESS_DLC_RULES.length})</span>
                </button>
                <button
                  onClick={() => setActiveRulesTab('aspirations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRulesTab === 'aspirations'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>🎯</span>
                  <span>Aspiration Rules ({ASPIRATION_CAREER_RULES.length + ASPIRATION_SPECIAL_RESTRICTIONS.length})</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={rulesSearchQuery}
                  onChange={(e) => setRulesSearchQuery(e.target.value)}
                  placeholder="Search rules, packs, jobs..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {rulesSearchQuery && (
                  <button
                    onClick={() => setRulesSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* TAB 1: FOUNDER & HOME */}
              {activeRulesTab === 'founder' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-amber-200 text-xs">
                    💡 <strong>Founding Rule:</strong> The legacy lasts for exactly 10 generations. The only thing you can influence yourself without rolling is creating your Founder(s) and building/decorating their home.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PIECE_OF_PRINCESS_FOUNDER_HOME_RULES
                      .filter(r => !rulesSearchQuery || r.title.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.details.toLowerCase().includes(rulesSearchQuery.toLowerCase()))
                      .map(rule => (
                        <div key={rule.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xl">{rule.icon}</span>
                              <h4 className="font-extrabold text-sm text-amber-300">{rule.title}</h4>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-xs">{rule.details}</p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-850 text-[10px] text-slate-400 font-mono">
                            {rule.summary}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: THE 6 GENERAL RULES */}
              {activeRulesTab === 'general' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center justify-between">
                    <span>These 6 core pillars must be strictly adhered to across all 10 generations. Failure requires restarting the challenge.</span>
                    <span className="text-amber-400 font-mono font-bold text-[11px]">Core Canon</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PIECE_OF_PRINCESS_GENERAL_RULES
                      .filter(r => !rulesSearchQuery || r.title.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.details.toLowerCase().includes(rulesSearchQuery.toLowerCase()))
                      .map(rule => (
                        <div key={rule.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{rule.icon}</span>
                                <h4 className="font-extrabold text-sm text-amber-300">{rule.title}</h4>
                              </div>
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-mono font-bold">
                                {rule.id.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-xs mt-1">{rule.details}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-sky-400/90 font-medium bg-slate-900/60 p-2 rounded">
                            📌 <strong>Key Directive:</strong> {rule.summary}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DLC & PACK RULES */}
              {activeRulesTab === 'dlc' && (
                <div className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2 flex-wrap pb-1">
                    <span className="text-slate-400 text-xs font-semibold">Filter Pack Type:</span>
                    {(['all', 'Expansion Pack', 'Game Pack', 'Stuff Pack'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setDlcFilterCategory(cat)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          dlcFilterCategory === cat
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat === 'all' ? 'All Packs' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PIECE_OF_PRINCESS_DLC_RULES
                      .filter(r => (dlcFilterCategory === 'all' || r.category === dlcFilterCategory))
                      .filter(r => !rulesSearchQuery || r.title.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.details.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || (r.pack && r.pack.toLowerCase().includes(rulesSearchQuery.toLowerCase())))
                      .map(rule => (
                        <div key={rule.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{rule.icon}</span>
                                <h4 className="font-extrabold text-sm text-sky-300">{rule.title}</h4>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                                {rule.pack}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-xs mt-1">{rule.details}</p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-850 text-[10px] text-amber-400 font-mono">
                            ⚡ {rule.summary}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ASPIRATION CAREER MATRIX & RESTRICTIONS */}
              {activeRulesTab === 'aspirations' && (
                <div className="space-y-5">
                  {/* Section A: Career-restricted aspirations */}
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                      <h4 className="font-black text-sm text-amber-400 uppercase tracking-wide flex items-center gap-2">
                        <span>💼</span>
                        <span>Aspirations Requiring Specific Matching Careers (15 Total)</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Must roll or hold the matching career to fulfill</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {ASPIRATION_CAREER_RULES
                        .filter(r => !rulesSearchQuery || r.aspiration.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.category.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.allowedCareers.some(c => c.toLowerCase().includes(rulesSearchQuery.toLowerCase())))
                        .map(item => (
                          <div key={item.aspiration} className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500/30 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-extrabold text-white text-sm">
                                {item.category} ({item.aspiration})
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                                Required Career
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              {item.allowedCareers.map(job => (
                                <span key={job} className="text-[11px] font-bold px-2 py-0.5 bg-slate-800 text-sky-300 rounded border border-slate-700">
                                  {job}
                                </span>
                              ))}
                            </div>
                            <p className="mt-2 text-slate-400 text-[11px] leading-relaxed">
                              {item.description}
                            </p>
                            {item.notes && (
                              <div className="mt-1 text-[10px] text-amber-400/90 italic font-mono">
                                ℹ️ {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Section B: Aspirations with special restrictions */}
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                      <h4 className="font-black text-sm text-purple-400 uppercase tracking-wide flex items-center gap-2">
                        <span>🔒</span>
                        <span>Other Aspirations with Special Restrictions (7 Total)</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Strict behavioral or occult prerequisites</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {ASPIRATION_SPECIAL_RESTRICTIONS
                        .filter(r => !rulesSearchQuery || r.aspiration.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.category.toLowerCase().includes(rulesSearchQuery.toLowerCase()) || r.restriction.toLowerCase().includes(rulesSearchQuery.toLowerCase()))
                        .map(item => (
                          <div key={item.aspiration} className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-purple-500/30 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-extrabold text-white text-sm">
                                {item.category} ({item.aspiration})
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                                Restriction
                              </span>
                            </div>
                            <div className="mt-1.5">
                              <span className="text-xs font-bold text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50 inline-block">
                                ⚠️ {item.restriction}
                              </span>
                            </div>
                            <p className="mt-2 text-slate-400 text-[11px] leading-relaxed">
                              {item.details}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs flex-wrap gap-2">
              <span className="text-slate-400">
                Official Random Legacy Challenge by PieceOfPrincess (December 26, 2020)
              </span>
              <button
                onClick={() => setShowRulesModal(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Rulebook
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
