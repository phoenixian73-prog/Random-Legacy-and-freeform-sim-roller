import {
  maritalStatuses,
  MaritalStatusEntry,
  custodySchedules,
  childrenRolls,
  ChildCountRoll,
  conventionalCareersList,
  ConventionalCareer,
  unconventionalCareersList,
  UnconventionalCareer,
  partTimeJobsList,
  PartTimeJob,
  generationGoalsList,
  GenerationGoal,
  miscFunList,
  MiscFun,
  midlifeCrisisAspects,
  MidlifeCrisisAspect,
  rainbowColors,
  moodsList,
  troubledTeenTypes,
  familyDynamicsList,
  romanticDynamicsList,
  LegacyRollResult,
  SecondaryCareerRoll,
  SecondaryCareerSlot,
  packsList,
  getOrdinal,
  getHeirOrderDescription,
  PartyEventGoal,
  TS4_GOALS_AND_REWARDS_PARTIES,
} from '../data/legacyChallengeData';
import { Sim, Lot, RelationMode } from '../types';
import { generateSimObject, calculateRelations, roll, rNum, generateLot, rollDwellingType, getDwellingDetails, getValidTrait, synchronizeCouplePregnancy, filterChallengesForDwelling } from './generator';
import { db, aspReqs } from '../data/simData';
import { isAspirationAllowedForCareer, getCompatibleAspirationsForCareer } from './aspirationCareerRules';
import { generateResidentialRentalConfig } from './rentalRules';

export const allPackCodes = new Set<string>(packsList.map(p => p.code));

function isPackAllowed(packString: string | undefined, enabledPacks: Set<string>): boolean {
  if (!packString || packString === "Base Game" || packString === "BG") return true;
  // Handle combined pack markers like "C&D / HR" or "SV / FR" or "Base Game / P"
  const tokens = packString.split(/[\/\&, ]+/).map(t => t.trim().toUpperCase());
  // If ANY token matches an enabled pack, allow it
  for (const token of tokens) {
    if (token === "BASE" || token === "GAME" || token === "BG") return true;
    if (enabledPacks.has(token)) return true;
  }
  return false;
}

export function rollMaritalStatus(enabledPacks: Set<string> = allPackCodes): { 
  entry: MaritalStatusEntry; 
  diceRoll: number; 
  custodySchedule?: any;
  familyDynamic?: string;
  romanticDynamic?: string;
} {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const diceRoll = Math.floor(Math.random() * 54) + 1; // 1 to 54
    const entry = maritalStatuses.find(m => diceRoll >= m.minRoll && diceRoll <= m.maxRoll);
    if (!entry) continue;

    // Check pack compatibility
    if (entry.pack && !isPackAllowed(entry.pack, enabledPacks)) {
      continue;
    }

    let custodySchedule;
    if (entry.hasCustodySubroll) {
      const custRoll = Math.floor(Math.random() * 7) + 1;
      custodySchedule = custodySchedules.find(c => c.roll === custRoll) || custodySchedules[0];
    }

    // Assign family dynamic and romantic dynamic when married/partnered
    let familyDynamic: string | undefined;
    let romanticDynamic: string | undefined;
    if (entry.partnerCount > 0) {
      familyDynamic = roll(familyDynamicsList).name;
      romanticDynamic = roll(romanticDynamicsList).name;
    }

    return { entry, diceRoll, custodySchedule, familyDynamic, romanticDynamic };
  }

  // Fallback to Couple
  return { 
    entry: maritalStatuses[1], 
    diceRoll: 15,
    familyDynamic: "Close",
    romanticDynamic: "Wholesome"
  };
}

export function rollChildren(marital: MaritalStatusEntry): { 
  entry: ChildCountRoll; 
  diceRoll: number; 
  targetCount: number;
  heirOrder: number;
  heirOrderDescription: string;
} {
  let attempts = 0;
  let entry = childrenRolls[0];
  let diceRoll = 1;
  let targetCount = entry.count;

  while (attempts < 50) {
    attempts++;
    diceRoll = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const matched = childrenRolls.find(c => diceRoll >= c.minRoll && diceRoll <= c.maxRoll) || childrenRolls[0];
    const count = matched.count;

    if (marital.minChildren && count < marital.minChildren) {
      // Must reroll as per rule
      continue;
    }

    entry = matched;
    targetCount = count;
    break;
  }

  if (attempts >= 50) {
    const min = marital.minChildren || 2;
    entry = childrenRolls.find(c => c.count >= min) || childrenRolls[1];
    diceRoll = entry.minRoll;
    targetCount = entry.count;
  }

  const heirOrder = targetCount > 1 ? Math.floor(Math.random() * targetCount) + 1 : 1;
  const heirOrderDescription = getHeirOrderDescription(heirOrder, targetCount);

  return { entry, diceRoll, targetCount, heirOrder, heirOrderDescription };
}

export function rollHeirCareer(enabledPacks: Set<string> = allPackCodes) {
  const catRoll = Math.floor(Math.random() * 10) + 1; // 1 to 10
  const filteredConventional = conventionalCareersList.filter(c => isPackAllowed(c.pack, enabledPacks));
  const filteredUnconventional = unconventionalCareersList.filter(c => isPackAllowed(c.pack, enabledPacks));
  const filteredPartTime = partTimeJobsList.filter(c => isPackAllowed(c.pack, enabledPacks));

  const convPool = filteredConventional.length > 0 ? filteredConventional : conventionalCareersList;
  const unconvPool = filteredUnconventional.length > 0 ? filteredUnconventional : unconventionalCareersList;
  const ptPool = filteredPartTime.length > 0 ? filteredPartTime : partTimeJobsList;

  if (catRoll >= 1 && catRoll <= 5) {
    // Conventional Careers
    const chosen = roll(convPool);
    return {
      categoryRoll: catRoll,
      categoryType: 'Conventional' as const,
      careerRoll: chosen.id,
      conventional: chosen
    };
  } else if (catRoll >= 6 && catRoll <= 8) {
    // Unconventional Careers
    const chosen = roll(unconvPool);
    return {
      categoryRoll: catRoll,
      categoryType: 'Unconventional' as const,
      careerRoll: chosen.id,
      unconventional: chosen
    };
  } else if (catRoll === 9) {
    // Career Hopper (Roll 5 different conventional careers)
    const shuffled = [...convPool].sort(() => 0.5 - Math.random());
    const hopper = shuffled.slice(0, Math.min(5, shuffled.length));
    return {
      categoryRoll: catRoll,
      categoryType: 'Career Hopper' as const,
      hopperCareers: hopper
    };
  } else {
    // Double Part-timer (Roll 2 distinct part-time jobs)
    const shuffled = [...ptPool].sort(() => 0.5 - Math.random());
    const pt1 = shuffled[0];
    const pt2 = shuffled.length > 1 ? shuffled[1] : shuffled[0];
    return {
      categoryRoll: catRoll,
      categoryType: 'Double Part-timer' as const,
      careerRoll: pt1.id,
      partTime: pt1,
      partTime2: pt2
    };
  }
}

export function rollSecondaryCareer(enabledPacks: Set<string> = allPackCodes) {
  const catRoll = Math.floor(Math.random() * 10) + 1; // 1 to 10
  const filteredConventional = conventionalCareersList.filter(c => isPackAllowed(c.pack, enabledPacks));
  const filteredUnconventional = unconventionalCareersList.filter(c => isPackAllowed(c.pack, enabledPacks));
  const filteredPartTime = partTimeJobsList.filter(c => isPackAllowed(c.pack, enabledPacks));

  const convPool = filteredConventional.length > 0 ? filteredConventional : conventionalCareersList;
  const unconvPool = filteredUnconventional.length > 0 ? filteredUnconventional : unconventionalCareersList;
  const ptPool = filteredPartTime.length > 0 ? filteredPartTime : partTimeJobsList;

  if (catRoll >= 1 && catRoll <= 4) {
    const chosen = roll(convPool);
    return {
      categoryRoll: catRoll,
      categoryType: 'Conventional' as const,
      careerRoll: chosen.id,
      conventional: chosen
    };
  } else if (catRoll >= 5 && catRoll <= 7) {
    const chosen = roll(unconvPool);
    return {
      categoryRoll: catRoll,
      categoryType: 'Unconventional' as const,
      careerRoll: chosen.id,
      unconventional: chosen
    };
  } else if (catRoll === 8) {
    const chosen = roll(ptPool);
    return {
      categoryRoll: catRoll,
      categoryType: 'Part-Timer' as const,
      careerRoll: chosen.id,
      partTime: chosen
    };
  } else if (catRoll === 9) {
    const shuffled = [...convPool].sort(() => 0.5 - Math.random());
    const hopper = shuffled.slice(0, Math.min(5, shuffled.length));
    return {
      categoryRoll: catRoll,
      categoryType: 'Career Hopper' as const,
      hopperCareers: hopper
    };
  } else {
    return {
      categoryRoll: catRoll,
      categoryType: 'Unemployed' as const
    };
  }
}

export function rollMidlifeCrisisAspects(): MidlifeCrisisAspect[] {
  // Pick 3 unique aspects from 1 to 12
  const shuffled = [...midlifeCrisisAspects].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export function rollGenerationGoal(generationNumber: number, enabledPacks: Set<string> = allPackCodes) {
  const eligible = generationGoalsList.filter(g => {
    // Check pack compatibility
    if (!isPackAllowed(g.pack, enabledPacks)) return false;
    // Check generation 1 exclusions
    if (generationNumber === 1 && [8, 11, 20].includes(g.id)) return false;
    return true;
  });

  const pool = eligible.length > 0 ? eligible : generationGoalsList;
  const chosen = roll(pool);

  // Per Random Legacy Challenge rules:
  // Goal 12 (Midlife Crisis) aspects must NOT be rolled or revealed before the Heir reaches Adulthood.
  // They remain completely sealed until age === "Adult" to avoid advance household manipulation.
  const midlifeCrisis: MidlifeCrisisAspect[] | undefined = undefined;

  let partyTypes: string[] | undefined;
  let partyGoals: PartyEventGoal[] | undefined;
  if (chosen.id === 9) {
    const shuffled = [...TS4_GOALS_AND_REWARDS_PARTIES].sort(() => 0.5 - Math.random());
    partyGoals = shuffled.slice(0, 4).map(p => ({
      ...p,
      isGoldAchieved: false
    }));
    partyTypes = partyGoals.map(p => `${p.name} (${p.cost})`);
  }

  return {
    entry: chosen,
    diceRoll: chosen.id,
    midlifeCrisisAspects: midlifeCrisis,
    midlifeCrisisRevealed: false,
    partyTypes,
    partyGoals
  };
}

export function rollMiscFun(childCount: number, generationNumber: number, enabledPacks: Set<string> = allPackCodes) {
  const eligible = miscFunList.filter(f => {
    if (!isPackAllowed(f.pack, enabledPacks)) return false;
    // Fun #9: Half-Siblings requires > 1 kid
    if (f.id === 9 && childCount <= 1) return false;
    // Fun #19, #20: Re-roll if generation 1
    if (generationNumber === 1 && [19, 20].includes(f.id)) return false;
    return true;
  });

  const pool = eligible.length > 0 ? eligible : miscFunList;
  const chosen = roll(pool);

  let rolledMood: string | undefined;
  if (chosen.id === 4) {
    rolledMood = roll(moodsList);
  }

  let rolledColor: string | undefined;
  if (chosen.id === 25) {
    rolledColor = roll(rainbowColors);
  }

  let rolledRoommates: number | undefined;
  if (chosen.id === 35) {
    rolledRoommates = Math.floor(Math.random() * 3) + 1; // 1 to 3
  }

  let rolledTroubledTeenType: string | undefined;
  if (chosen.id === 52) {
    const t = roll(troubledTeenTypes);
    rolledTroubledTeenType = `${t.type}: ${t.name} — ${t.description}`;
  }

  return {
    entry: chosen,
    diceRoll: chosen.id,
    rolledMood,
    rolledColor,
    rolledRoommates,
    rolledTroubledTeenType
  };
}

export function getSecondaryMemberSlots(
  marital: MaritalStatusEntry,
  childCount: number
): Array<{ id: string; role: 'spouse' | 'helper'; label: string; tag: string }> {
  const slots: Array<{ id: string; role: 'spouse' | 'helper'; label: string; tag: string }> = [];

  // 1. Spouses & Subsequent Spouses
  if (marital.title === "Black Widow") {
    slots.push({ id: "spouse-1", role: "spouse", label: "Spouse 1 (First Marriage / Doomed)", tag: "Spouse 1" });
    slots.push({ id: "spouse-2", role: "spouse", label: "Subsequent Spouse 2", tag: "Subsequent Spouse 2" });
    slots.push({ id: "spouse-3", role: "spouse", label: "Subsequent Spouse 3", tag: "Subsequent Spouse 3" });
  } else if (marital.title === "Second Chance") {
    slots.push({ id: "partner-1", role: "spouse", label: "Partner 1 (First Child Co-Parent)", tag: "Partner 1" });
    slots.push({ id: "partner-2", role: "spouse", label: "Subsequent Partner (New Spouse)", tag: "Subsequent Partner" });
  } else if (marital.title.includes("Second Chance (Again...)")) {
    const count = Math.max(3, childCount || 3);
    for (let i = 1; i <= count; i++) {
      slots.push({
        id: `partner-${i}`,
        role: "spouse",
        label: i === 1 ? "Partner 1 (First Child Co-Parent)" : `Subsequent Partner ${i} (Child ${i} Co-Parent)`,
        tag: `Partner ${i}`
      });
    }
  } else if (marital.title === "Multiplied Love" || marital.partnerCount === 2) {
    slots.push({ id: "partner-1", role: "spouse", label: "Partner 1 (Polyamorous)", tag: "Partner 1" });
    slots.push({ id: "partner-2", role: "spouse", label: "Partner 2 (Polyamorous)", tag: "Partner 2" });
  } else if (marital.partnerCount === 1) {
    slots.push({ id: "spouse-1", role: "spouse", label: "Spouse / Primary Partner", tag: "Spouse" });
  }

  // 2. Helpers
  if (marital.requiresOccult) {
    for (let h = 1; h <= (marital.helperCount || 3); h++) {
      slots.push({ id: `helper-occult-${h}`, role: "helper", label: `Occult Helper ${h}`, tag: `Occult Helper ${h}` });
    }
  } else if (marital.helperCount > 0) {
    for (let h = 1; h <= marital.helperCount; h++) {
      slots.push({ id: `helper-${h}`, role: "helper", label: `Helper Sim ${h}`, tag: `Helper ${h}` });
    }
  }

  return slots;
}

export function rollAllSecondaryCareers(
  marital: MaritalStatusEntry,
  childCount: number,
  enabledPacks: Set<string> = allPackCodes
): SecondaryCareerSlot[] {
  const slots = getSecondaryMemberSlots(marital, childCount);
  return slots.map(slot => ({
    ...slot,
    career: rollSecondaryCareer(enabledPacks)
  }));
}

export function rollCompleteLegacyGeneration(
  genNumber: number,
  enabledPacks: Set<string> = allPackCodes
): LegacyRollResult {
  const marital = rollMaritalStatus(enabledPacks);
  const children = rollChildren(marital.entry);
  const heirCareer = rollHeirCareer(enabledPacks);
  
  // Secondary careers rolled individually for each spouse, subsequent partner, and helper
  const secondaryCareers = rollAllSecondaryCareers(marital.entry, children.targetCount, enabledPacks);
  const secondaryCareer = secondaryCareers.length > 0 ? secondaryCareers[0].career : null;

  const goal = rollGenerationGoal(genNumber, enabledPacks);
  const fun = rollMiscFun(children.targetCount, genNumber, enabledPacks);

  return {
    generation: genNumber,
    marital,
    children,
    heirCareer,
    secondaryCareer,
    secondaryCareers,
    goal,
    fun,
    timestamp: new Date().toLocaleTimeString(),
    isCompleted: false
  };
}

export function formatCareerNameOnly(careerObj: LegacyRollResult['heirCareer'] | LegacyRollResult['secondaryCareer']): string {
  if (!careerObj) {
    return `<span class="text-slate-400 italic">None (Single)</span>`;
  }
  if (careerObj.categoryType === 'Conventional') {
    const c = careerObj.conventional;
    if (!c) return "Conventional Career";
    return `<strong>${c.name}</strong> <span class="text-emerald-400/90 font-normal">(${c.branch || 'Standard'} • ${c.pack})</span>`;
  } else if (careerObj.categoryType === 'Unconventional') {
    const u = careerObj.unconventional;
    if (!u) return "Unconventional Career";
    return `<strong>${u.name}</strong> <span class="text-emerald-400/90 font-normal">[${u.pack}]</span>`;
  } else if (careerObj.categoryType === 'Career Hopper') {
    const list = careerObj.hopperCareers || [];
    return `<strong>Career Hopper (5 Jobs):</strong> ${list.map((c, i) => `${i + 1}. ${c.name}`).join(' ➔ ')}`;
  } else if (careerObj.categoryType === 'Double Part-timer') {
    const pt1 = careerObj.partTime;
    const pt2 = careerObj.partTime2;
    if (pt1 && pt2) {
      return `<strong>Double Part-Timer:</strong> ${pt1.name} [${pt1.pack || 'BG'}] & ${pt2.name} [${pt2.pack || 'BG'}]`;
    }
    return `<strong>Double Part-Timer:</strong> ${pt1?.name || 'Part-Time Job'}`;
  } else if (careerObj.categoryType === 'Part-Timer') {
    const pt = careerObj.partTime;
    return `<strong>Part-Timer:</strong> ${pt?.name || 'Part-Time Job'} [${pt?.pack || 'BG'}]`;
  } else {
    return `<strong>Unemployed</strong>`;
  }
}

export function getCareerDetailedExplanation(careerObj: LegacyRollResult['heirCareer'] | LegacyRollResult['secondaryCareer']): {
  title: string;
  category: string;
  pack?: string;
  description: string;
} | null {
  if (!careerObj) return null;
  if (careerObj.categoryType === 'Conventional') {
    const c = careerObj.conventional;
    if (!c) return null;
    return {
      title: `${c.name} (${c.branch || 'Standard Branch'})`,
      category: 'Conventional Career',
      pack: c.pack,
      description: `Join the official ${c.name} career track (${c.branch || 'Standard Branch'}). Reach the top level. All income must strictly come from work paychecks and daily performance.`
    };
  } else if (careerObj.categoryType === 'Unconventional') {
    const u = careerObj.unconventional;
    if (!u) return null;
    return {
      title: `${u.name}`,
      category: 'Unconventional Career',
      pack: u.pack,
      description: u.description
    };
  } else if (careerObj.categoryType === 'Career Hopper') {
    return {
      title: 'Career Hopper (5 Jobs Sequence)',
      category: 'Career Hopper',
      description: 'Must work through all 5 conventional jobs in strict sequence. Reach level 5 (or choose branch) before quitting to join the next job. No side income outside the active job!'
    };
  } else if (careerObj.categoryType === 'Double Part-timer') {
    const pt1 = careerObj.partTime;
    const pt2 = careerObj.partTime2;
    const names = [pt1 ? `${pt1.name} [${pt1.pack || 'BG'}]` : '', pt2 ? `${pt2.name} [${pt2.pack || 'BG'}]` : ''].filter(Boolean).join(' and ');
    return {
      title: `Double Part-Timer (${names})`,
      category: 'Part-Time Careers',
      description: `Must maintain both ${names} part-time jobs simultaneously. All income must strictly come from these two jobs.`
    };
  } else if (careerObj.categoryType === 'Part-Timer') {
    const pt = careerObj.partTime;
    return {
      title: `Part-Timer: ${pt?.name || 'Part-Time Job'}`,
      category: 'Part-Time Career',
      pack: pt?.pack,
      description: `Work as a ${pt?.name || 'part-timer'}. No other employment or income sources allowed.`
    };
  } else {
    return {
      title: 'Unemployed',
      category: 'Unemployed',
      description: 'Full-time homemaker / stay-at-home parent. Cannot hold a job or earn commercial income.'
    };
  }
}

export function formatCareerLabel(careerObj: LegacyRollResult['heirCareer'] | LegacyRollResult['secondaryCareer']): string {
  if (!careerObj) {
    return `<span class="text-slate-400 italic">N/A — No spouse or live-in helper for this generation</span>`;
  }
  if (careerObj.categoryType === 'Conventional') {
    const c = careerObj.conventional;
    if (!c) return "Conventional Career";
    return `<strong>${c.name}:</strong> ${c.branch || 'Standard'} (${c.pack})`;
  } else if (careerObj.categoryType === 'Unconventional') {
    const u = careerObj.unconventional;
    if (!u) return "Unconventional Career";
    return `<strong>${u.name}</strong> [${u.pack}] — ${u.description}`;
  } else if (careerObj.categoryType === 'Career Hopper') {
    const list = careerObj.hopperCareers || [];
    return `<strong>Career Hopper (5 Jobs):</strong> ${list.map(c => `${c.name} (${c.branch || 'Branch'})`).join(' ➔ ')}`;
  } else if (careerObj.categoryType === 'Double Part-timer') {
    const pt1 = careerObj.partTime;
    const pt2 = careerObj.partTime2;
    if (pt1 && pt2) {
      return `<strong>Double Part-Timer (2 Jobs):</strong> ${pt1.name} (${pt1.pack || 'Base Game'}) & ${pt2.name} (${pt2.pack || 'Base Game'})`;
    }
    return `<strong>Double Part-Timer:</strong> ${pt1?.name || 'Part-Time Job'}`;
  } else if (careerObj.categoryType === 'Part-Timer') {
    const pt = careerObj.partTime;
    return `<strong>Part-Timer:</strong> ${pt?.name || 'Part-Time Job'} (${pt?.pack || 'Base Game'})`;
  } else {
    return `<strong>Unemployed:</strong> Full-time homemaker / stay-at-home parent`;
  }
}

/**
 * Checks if the generation roll indicates moving spares into the same residential rental
 * (Marital Status #50: Multi-family Dwelling).
 */
export function doesRollRequireResidentialRental(legacyRoll?: LegacyRollResult | null): boolean {
  if (!legacyRoll || !legacyRoll.marital || !legacyRoll.marital.entry) return false;
  return Boolean(
    legacyRoll.marital.entry.rentalRental ||
    legacyRoll.marital.entry.title === "Multi-family Dwelling"
  );
}

/**
 * Applies a rolled Legacy generation result to build a complete, realistic Sims 4 household
 * that faithfully implements all rolled constraints:
 * - Heir with primary career
 * - Partners/Spouses with their own unique C2 career
 * - Helpers with their own unique C2 career
 * - Designated children slots (bio vs adopted)
 */
export function populateHouseholdFromLegacy(
  legacyRoll: LegacyRollResult,
  currentLot: Lot,
  carriedOverHeir?: Sim | null,
  autoPopulateChildren: boolean = false
): { newHousehold: Sim[]; updatedLot: Lot } {
  const newHousehold: Sim[] = [];
  let nextId = 1;

  const isMixed = legacyRoll.marital.entry.title.includes("Mixed");

  // 1. Generate or carry over the Heir
  const heirCareerStr = formatCareerLabel(legacyRoll.heirCareer);
  let heirSim: Sim;

  if (carriedOverHeir) {
    heirSim = {
      ...carriedOverHeir,
      id: nextId++,
      stage: "Young Adult",
      career: heirCareerStr,
      branchName: `👑 Heir (Gen ${legacyRoll.generation})`,
      branchBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      familyUnitRole: "Heir",
      isNextHeir: false,
      isDeceased: false,
      baseRel: "Self",
      customRelations: {}
    };
    // Ensure 3 adult traits for the grown heir
    while (heirSim.traits.length < 3) {
      const t = getValidTrait(db.adultTraits, heirSim.traits);
      if (t) heirSim.traits.push(t);
      else break;
    }
    // Update aspiration to adult if previously childhood, and ensure compatible with rolled career
    if (db.aspirationsChild.includes(heirSim.asp) || !isAspirationAllowedForCareer(heirSim.asp, heirCareerStr)) {
      heirSim.asp = roll(getCompatibleAspirationsForCareer(heirCareerStr, db.aspirationsAdult));
    }
  } else {
    heirSim = generateSimObject("Young Adult", nextId++, "Human", true);
    heirSim.isDeceased = false;
    heirSim.career = heirCareerStr;
    if (!isAspirationAllowedForCareer(heirSim.asp, heirCareerStr)) {
      heirSim.asp = roll(getCompatibleAspirationsForCareer(heirCareerStr, db.aspirationsAdult));
    }
    heirSim.branchName = `👑 Heir (Gen ${legacyRoll.generation})`;
    heirSim.branchBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    heirSim.familyUnitRole = "Heir";
  }

  // Note: With Ghost Pregnancies mod enabled, ghost Heirs can freely have biological offspring and science babies
  // in Mixed generations.

  // Assign family & romantic dynamics when married/partnered
  if (legacyRoll.marital.entry.partnerCount > 0) {
    heirSim.familyDynamic = legacyRoll.marital.familyDynamic || "Close";
    heirSim.romanticDynamic = legacyRoll.marital.romanticDynamic || "Wholesome";
  }

  newHousehold.push(heirSim);

  // 2. Individual Secondary Careers lookup
  const marital = legacyRoll.marital.entry;
  const secondarySlots = legacyRoll.secondaryCareers && legacyRoll.secondaryCareers.length > 0
    ? legacyRoll.secondaryCareers
    : (legacyRoll.secondaryCareer ? [{
        id: "legacy-partner",
        role: "spouse" as const,
        label: "Spouse / Partner",
        tag: "Spouse",
        career: legacyRoll.secondaryCareer
      }] : []);

  const spouseSlots = secondarySlots.filter(s => s.role === 'spouse');
  const helperSlots = secondarySlots.filter(s => s.role === 'helper');

  // 2. Partners based on Marital Status
  for (let p = 0; p < marital.partnerCount; p++) {
    if (newHousehold.length >= 8) break;
    const partner = generateSimObject("Young Adult", nextId++, "Human", true);
    const assignedSlot = spouseSlots[p] || secondarySlots[p] || null;
    partner.career = assignedSlot ? formatCareerLabel(assignedSlot.career) : formatCareerLabel(legacyRoll.secondaryCareer);
    if (!isAspirationAllowedForCareer(partner.asp, partner.career)) {
      partner.asp = roll(getCompatibleAspirationsForCareer(partner.career, db.aspirationsAdult));
    }
    const assignedRomDyn = legacyRoll.marital.romanticDynamic || heirSim.romanticDynamic || "Wholesome";
    partner.familyDynamic = legacyRoll.marital.familyDynamic || "Close";
    partner.romanticDynamic = assignedRomDyn;
    heirSim.romanticDynamic = assignedRomDyn;
    partner.branchName = marital.partnerCount > 1 
      ? `💍 Partner ${p + 1} (Polyamorous • ${assignedRomDyn})` 
      : (marital.title.includes("Widow") 
          ? `💍 First Partner (Doomed Spouse • ${partner.familyDynamic})` 
          : `💍 Spouse / Partner (${partner.familyDynamic} • ${assignedRomDyn})`);
    partner.branchBadge = "bg-pink-500/20 text-pink-300 border-pink-500/40";
    partner.familyUnitRole = "Partner";
    
    // Set relation and synchronized romantic dynamic to Heir
    partner.baseRel = "Spouse";
    partner.customRelations = { [heirSim.id]: "Spouse" };
    heirSim.customRelations = { ...(heirSim.customRelations || {}), [partner.id]: "Spouse" };
    partner.customDynamics = { [heirSim.id]: assignedRomDyn };
    heirSim.customDynamics = { ...(heirSim.customDynamics || {}), [partner.id]: assignedRomDyn };

    // Pair couple in a reproductively compatible fashion disregarding gender
    synchronizeCouplePregnancy(heirSim, partner);

    newHousehold.push(partner);
  }

  // 3. Helpers based on Marital Status with individual C2 careers
  if (marital.requiresOccult) {
    // Full Occult House: 3 Occult helpers
    const occultPool = ["Vampire", "Spellcaster", "Werewolf", "Mermaid", "Alien"];
    for (let h = 0; h < marital.helperCount; h++) {
      if (newHousehold.length >= 8) break;
      const helper = generateSimObject("Young Adult", nextId++, "Human", true);
      helper.occult = occultPool[h % occultPool.length];
      const assignedSlot = helperSlots[h] || secondarySlots[marital.partnerCount + h] || null;
      helper.career = assignedSlot ? formatCareerLabel(assignedSlot.career) : formatCareerLabel(legacyRoll.secondaryCareer);
      if (!isAspirationAllowedForCareer(helper.asp, helper.career)) {
        helper.asp = roll(getCompatibleAspirationsForCareer(helper.career, db.aspirationsAdult));
      }
      helper.branchName = `🔮 Occult Helper (${helper.occult})`;
      helper.branchBadge = "bg-purple-500/20 text-purple-300 border-purple-500/40";
      helper.familyUnitRole = "Helper";
      helper.baseRel = "Roommate";
      newHousehold.push(helper);
    }
  } else if (marital.helperCount > 0) {
    for (let h = 0; h < marital.helperCount; h++) {
      if (newHousehold.length >= 8) break;
      const helper = generateSimObject("Young Adult", nextId++, "Human", true);
      const assignedSlot = helperSlots[h] || secondarySlots[marital.partnerCount + h] || null;
      helper.career = assignedSlot ? formatCareerLabel(assignedSlot.career) : formatCareerLabel(legacyRoll.secondaryCareer);
      if (!isAspirationAllowedForCareer(helper.asp, helper.career)) {
        helper.asp = roll(getCompatibleAspirationsForCareer(helper.career, db.aspirationsAdult));
      }
      helper.branchName = `🤝 Helper Sim ${h + 1}`;
      helper.branchBadge = "bg-teal-500/20 text-teal-300 border-teal-500/40";
      helper.familyUnitRole = "Helper";
      helper.baseRel = "Roommate";
      newHousehold.push(helper);
    }
  }

  // 4. Pets for Full Pet House
  if (marital.petCount > 0) {
    const petSpecies = ["Dog", "Cat", "Horse"];
    for (let pt = 0; pt < marital.petCount; pt++) {
      if (newHousehold.length >= 8) break;
      const pet = generateSimObject("Adult", nextId++, "Pet");
      pet.species = petSpecies[pt % petSpecies.length];
      pet.branchName = `🐾 Companion ${pet.species}`;
      pet.branchBadge = "bg-amber-600/20 text-amber-300 border-amber-600/40";
      newHousehold.push(pet);
    }
  }

  // 5. Children Slots: If autoPopulateChildren is true, pre-spawn infants.
  // Otherwise, user adds children manually in order of birth/adoption per user's rules!
  if (autoPopulateChildren) {
    const numChildren = legacyRoll.children.targetCount;
    const designatedHeirOrder = legacyRoll.children.heirOrder || 1;

    for (let c = 0; c < numChildren; c++) {
      if (newHousehold.length >= 8) break;
      const isAdopted = isMixed && c % 2 === 1;
      const isNextHeir = ((c + 1) === designatedHeirOrder);
      const childAge = "Infant";

      const childSim = generateSimObject(childAge, nextId++, "Human", true);
      childSim.isNextHeir = isNextHeir;
      childSim.isAdopted = isAdopted;

      const ordStr = getOrdinal(c + 1);
      if (isNextHeir) {
        childSim.branchName = isAdopted 
          ? `🌟 Next Heir (Gen ${legacyRoll.generation + 1} • ${ordStr} Arrival - Adopted Infant)` 
          : `🌟 Next Heir (Gen ${legacyRoll.generation + 1} • ${ordStr} Arrival - Infant)`;
        childSim.branchBadge = "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm";
        childSim.familyUnitRole = "Next Heir";
      } else {
        childSim.branchName = isAdopted 
          ? `🧒 Child #${c + 1} (${ordStr} Arrival - Adopted Infant)` 
          : `👶 Child #${c + 1} (${ordStr} Arrival - Infant Sibling)`;
        childSim.branchBadge = isAdopted 
          ? "bg-violet-500/20 text-violet-300 border-violet-500/40" 
          : "bg-sky-500/20 text-sky-300 border-sky-500/40";
        childSim.familyUnitRole = "Child";
      }

      childSim.baseRel = "Child";

      // Set relations with Heir
      childSim.customRelations = { [heirSim.id]: "Child" };
      heirSim.customRelations = { ...(heirSim.customRelations || {}), [childSim.id]: "Parent" };

      // In The Sims 4, couples of any gender pairing (including homosexual couples via Science Babies: "Have Science Baby with...")
      // are both parents to their children on the family tree!
      const partnerSims = newHousehold.filter(s => s.familyUnitRole === "Partner");
      partnerSims.forEach(partner => {
        childSim.customRelations![partner.id] = "Child";
        partner.customRelations = { ...(partner.customRelations || {}), [childSim.id]: "Parent" };
      });

      newHousehold.push(childSim);
    }
  }

  // PieceOfPrincess Cats & Dogs DLC Rule:
  // "If you have the aspiration 'FRIEND OF THE ANIMALS' you need to add two animals into your household."
  const hasFriendOfAnimals = newHousehold.some(s => s.asp === "Friend of the Animals");
  if (hasFriendOfAnimals) {
    const currentPets = newHousehold.filter(s => s.isPet).length;
    const needed = Math.max(0, 2 - currentPets);
    for (let p = 0; p < needed; p++) {
      if (newHousehold.length >= 8) break;
      const pet = generateSimObject("Adult", nextId++, "Pet");
      pet.species = (p % 2 === 0) ? "Dog" : "Cat";
      pet.branchName = `🐾 Required Companion (${pet.species} - Friend of Animals)`;
      pet.branchBadge = "bg-amber-600/25 text-amber-300 border-amber-500/50";
      newHousehold.push(pet);
    }
  }

  // Calculate overall relations
  calculateRelations(newHousehold, 'mixed', true);

  // 6. Location & Lot: Only roll residential rental when the generation roll indicates that you must move your spares into the same residential rental (Marital #50: Multi-family Dwelling)
  const requiresResidentialRental = Boolean(
    marital.rentalRental ||
    marital.title === "Multi-family Dwelling"
  );

  let updatedLot = (currentLot && currentLot.world && legacyRoll.goal.entry.id !== 8)
    ? { ...currentLot }
    : generateLot(null, null, null, requiresResidentialRental);

  // Saving Space (Goal 33)
  if (legacyRoll.goal.entry.id === 33) {
    updatedLot.dwellingType = "Tiny Home";
    if (newHousehold.length <= 3) {
      updatedLot.tinyHomeTier = "Tier 1: Micro Home (Max 32 tiles)";
    } else if (newHousehold.length <= 6) {
      updatedLot.tinyHomeTier = "Tier 2: Tiny Home (Max 64 tiles)";
    } else {
      updatedLot.tinyHomeTier = "Tier 3: Small Home (Max 100 tiles)";
    }
    const details = getDwellingDetails(updatedLot.dwellingType, updatedLot.tinyHomeTier);
    updatedLot.dwellingDescription = details.description;
    updatedLot.dwellingPerks = details.perks;
    delete updatedLot.rentalConfig;
  } else if (requiresResidentialRental) {
    // Multi-family dwelling (Marital #50): Move to a Residential Rental lot together with remaining family members in separate units
    updatedLot.dwellingType = "Residential Rental";
    const details = getDwellingDetails(updatedLot.dwellingType);
    updatedLot.dwellingDescription = details.description;
    updatedLot.dwellingPerks = details.perks;
    updatedLot.rentalConfig = generateResidentialRentalConfig(updatedLot.rentalConfig, true);
  } else {
    // If not indicated by generation roll, strictly forbid Residential Rental
    if (updatedLot.dwellingType === "Residential Rental") {
      const rolledDwelling = rollDwellingType(updatedLot.world, updatedLot.neighborhood, false);
      updatedLot.dwellingType = rolledDwelling.type;
      updatedLot.tinyHomeTier = rolledDwelling.tier;
      const details = getDwellingDetails(updatedLot.dwellingType, updatedLot.tinyHomeTier);
      updatedLot.dwellingDescription = details.description;
      updatedLot.dwellingPerks = details.perks;
      delete updatedLot.rentalConfig;
    }
  }

  // Ghastly Roommates (Misc Fun #48) or Paranormal President (Goal #46)
  if (legacyRoll.fun.entry.id === 48 || legacyRoll.goal.entry.id === 46) {
    updatedLot.dwellingType = "Haunted Home";
    const details = getDwellingDetails(updatedLot.dwellingType);
    updatedLot.dwellingDescription = details.description;
    updatedLot.dwellingPerks = details.perks;
    delete updatedLot.rentalConfig;
  }

  // Domestic Dilemma (Goal #17) -> Add negative lot challenge if not present
  if (legacyRoll.goal.entry.id === 17) {
    const negativeChallenges = ["Off-the-Grid", "Quake Zone", "Cursed", "Grody", "Gremlins", "Filthy", "Mold", "Creepy Crawlies"];
    const challenge = roll(negativeChallenges);
    if (!updatedLot.lotChallenges.includes(challenge)) {
      updatedLot.lotChallenges = [...updatedLot.lotChallenges, challenge];
    }
  }

  // Ensure challenges match the final dwelling type restrictions
  updatedLot.lotChallenges = filterChallengesForDwelling(updatedLot.lotChallenges, updatedLot.dwellingType);

  return { newHousehold, updatedLot };
}

/**
 * Creates and appends a single child (Infant) to the legacy household,
 * tracking order of arrival (birth / adoption) and automatically designating
 * the Heir according to the rolled legacy rule.
 */
export function createLegacyChildSim(
  household: Sim[],
  legacyRoll: LegacyRollResult,
  options?: {
    isAdopted?: boolean;
    gender?: "Male" | "Female";
    customName?: string;
  }
): {
  childSim: Sim;
  updatedHousehold: Sim[];
  isNextHeir: boolean;
  heirOrder: number;
  arrivalIndex: number;
  notice: string;
} {
  const isMixed = legacyRoll.marital.entry.title.includes("Mixed");
  // Existing children
  const existingChildren = household.filter(s => 
    !s.isPet && (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
  );
  const arrivalIndex = existingChildren.length + 1;
  const heirOrder = legacyRoll.children.heirOrder || 1;
  const isNextHeir = (arrivalIndex === heirOrder);

  // Adoption status
  let isAdopted = false;
  if (options?.isAdopted !== undefined) {
    isAdopted = options.isAdopted;
  } else if (isMixed) {
    // In mixed generations, alternate
    isAdopted = (arrivalIndex % 2 === 0);
  }

  const nextId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
  const childSim = generateSimObject("Infant", nextId, "Human", true);

  if (options?.gender) {
    childSim.baseGender = options.gender;
    if (childSim.isFunctional && childSim.gender !== "N/A") {
      childSim.gender = options.gender === "Female" ? "Feminine" : "Masculine";
      childSim.pref = options.gender === "Female" ? "Feminine" : "Masculine";
    }
  }

  if (options?.customName) {
    childSim.branchName = options.customName;
  }

  childSim.isAdopted = isAdopted;
  childSim.isNextHeir = isNextHeir;
  childSim.isDeceased = false;
  childSim.familyUnitRole = isNextHeir ? "Next Heir" : "Child";
  childSim.baseRel = "Child";

  const ordStr = getOrdinal(arrivalIndex);
  const heirOrdStr = getOrdinal(heirOrder);

  if (isNextHeir) {
    childSim.branchName = isAdopted
      ? `🌟 Next Heir (Gen ${legacyRoll.generation + 1} • ${ordStr} Arrival - Adopted Infant)`
      : `🌟 Next Heir (Gen ${legacyRoll.generation + 1} • ${ordStr} Arrival - Infant)`;
    childSim.branchBadge = "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm";
  } else {
    childSim.branchName = isAdopted
      ? `🧒 Child #${arrivalIndex} (${ordStr} Arrival - Adopted Infant)`
      : `👶 Child #${arrivalIndex} (${ordStr} Arrival - Infant Sibling)`;
    childSim.branchBadge = isAdopted
      ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
      : "bg-sky-500/20 text-sky-300 border-sky-500/40";
  }

  // Relations: Wire to Heir
  const heirSim = household.find(s => s.familyUnitRole === "Founder" || s.familyUnitRole === "Heir" || s.id === 1) || household[0];
  childSim.customRelations = heirSim ? { [heirSim.id]: "Child" } : {};
  
  const updatedHousehold = household.map(s => {
    if (heirSim && s.id === heirSim.id) {
      return {
        ...s,
        customRelations: { ...(s.customRelations || {}), [childSim.id]: "Parent" }
      };
    }
    // Wire to all live-in partners (Science Babies co-parents)
    if (s.familyUnitRole === "Partner") {
      childSim.customRelations![s.id] = "Child";
      return {
        ...s,
        customRelations: { ...(s.customRelations || {}), [childSim.id]: "Parent" }
      };
    }
    // Wire pairwise sibling relations
    if (!s.isPet && (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")) {
      childSim.customRelations![s.id] = "Sibling";
      return {
        ...s,
        customRelations: { ...(s.customRelations || {}), [childSim.id]: "Sibling" }
      };
    }
    return { ...s };
  });

  updatedHousehold.push(childSim);
  calculateRelations(updatedHousehold, 'mixed', true);

  const notice = isNextHeir
    ? `👑 NEXT HEIR ARRIVED! Child #${arrivalIndex} (${ordStr} child born/adopted) matches the rolled heir rule and is designated as the Next Heir for Gen ${legacyRoll.generation + 1}!`
    : `🍼 Child #${arrivalIndex} (${ordStr} child) added to household! Remember: the ${heirOrdStr} child in arrival order is designated as the Next Heir.`;

  return {
    childSim,
    updatedHousehold,
    isNextHeir,
    heirOrder,
    arrivalIndex,
    notice
  };
}

/**
 * Constraint Mode: Randomly selects the Heir in case of multiple Sims in the household.
 * If multiple children exist, randomly chooses one of the children.
 * If starting Generation 1 (Founders) with multiple starting adult Sims, randomly chooses the primary Founder/Heir.
 */
export function chooseHeirRandomlyAmongSims(household: Sim[], generationNumber: number = 1): {
  updatedHousehold: Sim[];
  chosenSim: Sim;
  notice: string;
} | null {
  if (!household || household.length < 2) return null;

  // 1. Check if there are children in the household
  const children = household.filter(s =>
    !s.isPet && !s.ghost && (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
  );

  let pool: Sim[] = [];
  let isChildSelection = false;

  if (children.length >= 1) {
    pool = children;
    isChildSelection = true;
  } else {
    // Starting household with multiple Sims (Founder + Partner / Helpers / Roommates)
    const adultPool = household.filter(s =>
      !s.isPet && !s.ghost && ["Young Adult", "Adult", "Elder"].includes(s.stage)
    );
    if (adultPool.length >= 2) {
      pool = adultPool;
      isChildSelection = false;
    } else {
      pool = household.filter(s => !s.isPet && !s.ghost);
    }
  }

  if (pool.length === 0) return null;

  const chosenSim = roll(pool);

  const updatedHousehold = household.map(s => {
    if (s.id === chosenSim.id) {
      return {
        ...s,
        isNextHeir: true,
        familyUnitRole: isChildSelection ? "Next Heir" : "Heir",
        branchName: isChildSelection
          ? `🌟 Next Heir (Randomly Chosen • Sim ${s.id})`
          : `👑 First Heir / Founder (Randomly Chosen • Sim ${s.id})`,
        branchBadge: "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm"
      };
    }
    if (s.isNextHeir && s.id !== chosenSim.id) {
      return {
        ...s,
        isNextHeir: false,
        familyUnitRole: s.familyUnitRole === "Next Heir" ? "Child" : s.familyUnitRole,
        branchName: s.isAdopted ? `🧒 Sibling (Adopted)` : (s.familyUnitRole === "Partner" ? s.branchName : `👶 Sibling`),
        branchBadge: s.isAdopted ? "bg-violet-500/20 text-violet-300 border-violet-500/40" : (s.familyUnitRole === "Partner" ? s.branchBadge : "bg-sky-500/20 text-sky-300 border-sky-500/40")
      };
    }
    return { ...s };
  });

  const notice = isChildSelection
    ? `🎲 CONSTRAINT MODE: Sim ${chosenSim.id} (${chosenSim.stage}) was randomly chosen as the Heir among the ${pool.length} children!`
    : `🎲 CONSTRAINT MODE: Sim ${chosenSim.id} (${chosenSim.stage}) was randomly chosen as the First Heir / Founder among the ${pool.length} multiple Sims!`;

  return {
    updatedHousehold,
    chosenSim,
    notice
  };
}

