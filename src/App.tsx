import React, { useState, useEffect } from 'react';
import { Sim, Lot, Memory, DwellingType, TinyHomeTier, RelationMode, ToddlerSkills, HorseSkills, ResidentialRentalConfig } from './types';
import { 
  generateLot, 
  generateSimObject, 
  generateImaginaryFriend, 
  calculateRelations, 
  getHouseholdStructureSummary,
  roll, 
  getValidTrait, 
  rNum, 
  getDeathOptions, 
  rollDeathCause, 
  getPossibleBaseRelations, 
  getPossiblePairRelations,
  generateChildMultiSkills,
  generateToddlerSkills,
  generateHorseSkills,
  getUnlockedAdultSkills,
  getDwellingDetails,
  rollDwellingType,
  isApartmentApplicable,
  rollLotTraits,
  rollLotChallenges,
  rerollSingleLotTrait,
  rerollSingleLotChallenge,
  addLotTrait,
  addLotChallenge,
  filterChallengesForDwelling,
  masterConflicts
} from './utils/generator';
import { db, traitData, aspReqs, childAspirationMap, skillsByName } from './data/simData';
import { SimCard } from './components/SimCard';
import { LotDisplay } from './components/LotDisplay';
import { ControlPanel } from './components/ControlPanel';
import { QuickRollers } from './components/QuickRollers';
import { MemoryBank } from './components/MemoryBank';
import { ChildAspirationModal } from './components/ChildAspirationModal';
import { SkillsGuideModal } from './components/SkillsGuideModal';
import { RandomLegacyChallenge } from './components/RandomLegacyChallenge';
import { StickyRollsBottomBar } from './components/StickyRollsBottomBar';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { APP_VERSION } from './data/versionHistory';
import { LegacyRollResult } from './data/legacyChallengeData';
import { 
  getMatchingCareerForAspiration, 
  getCompatibleAspirationsForCareer, 
  isAspirationAllowedForCareer 
} from './utils/aspirationCareerRules';
import { chooseHeirRandomlyAmongSims, rollHeirCareer, rollSecondaryCareer, rollMidlifeCrisisAspects, formatCareerLabel, allPackCodes, doesRollRequireResidentialRental } from './utils/legacyGenerator';
import { generateResidentialRentalConfig } from './utils/rentalRules';

export default function App() {
  const [activeMode, setActiveMode] = useState<'legacy' | 'sandbox'>('legacy');
  const [household, setHousehold] = useState<Sim[]>([]);
  const [lot, setLot] = useState<Lot>({
    world: '',
    neighborhood: '',
    dwellingType: 'Standard Residential',
    lotTraits: [],
    lotChallenges: []
  });
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const saved = localStorage.getItem('sims4_memories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [currentLegacyRoll, setCurrentLegacyRoll] = useState<LegacyRollResult | null>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_current_roll');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [lastRolled, setLastRolled] = useState({ skill: 'N/A', job: 'N/A', asp: 'N/A' });
  const [relationMode, setRelationMode] = useState<RelationMode>('mixed');
  const [rollNotice, setRollNotice] = useState<string | null>(null);
  const [childAspirationModalSim, setChildAspirationModalSim] = useState<Sim | null>(null);
  const [isChildAspirationModalOpen, setIsChildAspirationModalOpen] = useState(false);
  const [skillsGuideModalSim, setSkillsGuideModalSim] = useState<Sim | null>(null);
  const [isSkillsGuideModalOpen, setIsSkillsGuideModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // 2/3 Chain Roll State (From 1 Sim, next rolled if 2/3 else no more sims)
  const [chainRollProbabilityInput, setChainRollProbabilityInput] = useState<string>("2/3");
  const [chainRollProbability, setChainRollProbability] = useState<number>(2 / 3);
  const [chainRollCap, setChainRollCap] = useState<number>(8); // Strict Sims 4 cap: 8 Sims max
  const [maxHouseholdCapacity, setMaxHouseholdCapacity] = useState<number>(8); // Supports 8, 10, 12, 16, 20 max sims
  const [ruleOrientation, setRuleOrientation] = useState<'standard' | 'inverted'>(() => {
    try {
      const saved = localStorage.getItem('sims4_legacy_rule_orientation');
      if (saved === 'inverted' || saved === 'standard') return saved;
    } catch (e) {}
    return 'standard';
  });

  const [movedOutSpares, setMovedOutSpares] = useState<Sim[]>(() => {
    try {
      const saved = localStorage.getItem('sims4_moved_out_spares');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sims4_moved_out_spares', JSON.stringify(movedOutSpares));
    } catch (e) {
      console.warn("Failed to auto-save movedOutSpares to localStorage:", e);
    }
  }, [movedOutSpares]);

  const triggerNotice = (msg: string) => {
    setRollNotice(msg);
    setTimeout(() => {
      setRollNotice(prev => (prev === msg ? null : prev));
    }, 5000);
  };

  const handleToggleRuleOrientation = () => {
    setRuleOrientation(prev => {
      const next = prev === 'standard' ? 'inverted' : 'standard';
      try {
        localStorage.setItem('sims4_legacy_rule_orientation', next);
      } catch (e) {}
      triggerNotice(
        next === 'inverted'
          ? "🔄 Inverted Rules Active: Aspirations dictate Careers! Toggling/rolling aspirations auto-assigns matching careers."
          : "⚖️ Standard Rules Active: Careers dictate Aspirations! Incompatible aspirations cannot toggle."
      );
      return next;
    });
  };

  // Load initial household & lot from localStorage if present to prevent data loss on reload
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('sims4_active_mode');
      if (savedMode === 'legacy' || savedMode === 'sandbox') {
        setActiveMode(savedMode);
      }
      const savedHousehold = localStorage.getItem('sims4_household');
      const savedLot = localStorage.getItem('sims4_lot');
      if (savedHousehold) {
        const parsedHousehold = JSON.parse(savedHousehold);
        if (Array.isArray(parsedHousehold) && parsedHousehold.length > 0) {
          // If the Heir was auto-killed by the old random generator bug (e.g. cause "Urban Myth" without children), restore them to alive
          const hasChildren = parsedHousehold.some(s => s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child");
          if (!hasChildren) {
            parsedHousehold.forEach(s => {
              if ((s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || s.id === 1) && s.cause === "Urban Myth") {
                s.ghost = false;
                s.cause = "N/A";
              }
            });
          }
          setHousehold(parsedHousehold);
          if (savedLot) {
            const parsedLot = JSON.parse(savedLot);
            if (parsedLot && parsedLot.world) {
              let savedLegacyRoll: LegacyRollResult | null = null;
              try {
                const rawRoll = localStorage.getItem('sims4_legacy_current_roll');
                if (rawRoll) savedLegacyRoll = JSON.parse(rawRoll);
              } catch (e) {}
              const isRentalRequired = doesRollRequireResidentialRental(savedLegacyRoll);

              if (isRentalRequired) {
                if (parsedLot.dwellingType !== 'Residential Rental' || !parsedLot.rentalConfig) {
                  const details = getDwellingDetails('Residential Rental');
                  parsedLot.dwellingType = 'Residential Rental';
                  parsedLot.dwellingDescription = details.description;
                  parsedLot.dwellingPerks = details.perks;
                  parsedLot.rentalConfig = parsedLot.rentalConfig || generateResidentialRentalConfig(undefined, true);
                }
              } else if (parsedLot.dwellingType === 'Residential Rental') {
                // Generation roll does not indicate moving spares into rental: revert from Residential Rental
                const rolled = rollDwellingType(parsedLot.world, parsedLot.neighborhood, false);
                const details = getDwellingDetails(rolled.type, rolled.tier);
                parsedLot.dwellingType = rolled.type;
                parsedLot.tinyHomeTier = rolled.tier;
                parsedLot.dwellingDescription = details.description;
                parsedLot.dwellingPerks = details.perks;
                delete parsedLot.rentalConfig;
              }
              setLot(parsedLot);
            }
          }
          return; // Successfully restored from storage; skip initial random generate
        }
      }
    } catch (e) {
      console.warn("Could not restore saved household from localStorage:", e);
    }
    // Only generate default random sims if no previous household exists
    handleGenerate();
  }, []);

  // User Requirement: "Only roll residential rental wen the generation roll indicates that you must move your spares into the same residential rental"
  useEffect(() => {
    if (!currentLegacyRoll) return;
    const indicatesSparesRental = doesRollRequireResidentialRental(currentLegacyRoll);
    setLot(prev => {
      if (indicatesSparesRental) {
        if (prev.dwellingType === 'Residential Rental' && prev.rentalConfig) {
          return prev;
        }
        const details = getDwellingDetails('Residential Rental');
        const config = generateResidentialRentalConfig(prev.rentalConfig, true);
        return {
          ...prev,
          dwellingType: 'Residential Rental',
          dwellingDescription: details.description,
          dwellingPerks: details.perks,
          rentalConfig: config
        };
      } else {
        // Only roll residential rental when generation roll indicates moving spares into the residential rental!
        if (prev.dwellingType === 'Residential Rental') {
          const rolled = rollDwellingType(prev.world, prev.neighborhood, false);
          const details = getDwellingDetails(rolled.type, rolled.tier);
          const { rentalConfig, ...rest } = prev;
          return {
            ...rest,
            dwellingType: rolled.type,
            tinyHomeTier: rolled.tier,
            dwellingDescription: details.description,
            dwellingPerks: details.perks
          };
        }
        return prev;
      }
    });
  }, [currentLegacyRoll?.marital?.entry?.rentalRental, currentLegacyRoll?.marital?.entry?.title]);

  // Auto-sync household to localStorage
  useEffect(() => {
    if (household.length > 0) {
      try {
        localStorage.setItem('sims4_household', JSON.stringify(household));
      } catch (e) {
        console.warn("Failed to auto-save household to localStorage:", e);
      }
    }
  }, [household]);

  // Auto-sync lot to localStorage
  useEffect(() => {
    if (lot.world) {
      try {
        localStorage.setItem('sims4_lot', JSON.stringify(lot));
      } catch (e) {
        console.warn("Failed to auto-save lot to localStorage:", e);
      }
    }
  }, [lot]);

  // Auto-sync activeMode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sims4_active_mode', activeMode);
    } catch (e) {}
  }, [activeMode]);

  // Auto-sync memories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sims4_memories', JSON.stringify(memories));
    } catch (e) {
      console.warn("Failed to auto-save memories to localStorage:", e);
    }
  }, [memories]);

  // Active Heir Sim & Stage check (Adulthood determines Goal 12 Midlife Crisis reveal)
  const activeHeirSim = household.find(s => s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder" || (s.isNextHeir && !s.isDeceased)) || household.find(s => !s.isPet);
  const isHeirAdult = activeHeirSim ? ["Adult", "Elder"].includes(activeHeirSim.stage) : false;

  // Strict rule: If Goal 12 (Midlife Crisis) and Heir is NOT Adult,
  // ensure aspects are never present/unhidden in state (e.g. from previous sessions in localStorage)
  useEffect(() => {
    if (
      currentLegacyRoll?.goal?.entry?.id === 12 &&
      !isHeirAdult &&
      (currentLegacyRoll.goal.midlifeCrisisAspects || currentLegacyRoll.goal.midlifeCrisisRevealed)
    ) {
      setCurrentLegacyRoll(prev => prev ? {
        ...prev,
        goal: {
          ...prev.goal,
          midlifeCrisisAspects: undefined,
          midlifeCrisisRevealed: false,
        }
      } : null);
    }
  }, [currentLegacyRoll?.goal?.entry?.id, isHeirAdult, currentLegacyRoll?.goal?.midlifeCrisisAspects, currentLegacyRoll?.goal?.midlifeCrisisRevealed]);

  // Callback from Legacy Generator to memorize the previous generation
  const handleMemorizeGeneration = (prevHousehold: Sim[], prevLot: Lot, genNum: number) => {
    if (!prevHousehold || prevHousehold.length === 0) return;
    const heir = prevHousehold.find(s => s.familyUnitRole === "Heir") || prevHousehold[0];
    const newMemory: Memory = {
      lot: JSON.parse(JSON.stringify(prevLot)),
      household: JSON.parse(JSON.stringify(prevHousehold)),
      timestamp: new Date().toLocaleTimeString(),
    };
    setMemories(prev => {
      // Check if already saved
      const isAlreadySaved = prev.some(m => 
        m.household.length === prevHousehold.length && 
        m.household[0]?.id === prevHousehold[0]?.id &&
        m.lot?.world === prevLot?.world
      );
      if (isAlreadySaved) return prev;
      return [...prev, newMemory];
    });
    triggerNotice(`💾 Generation ${genNum} (${heir.stage} Heir, ${prevHousehold.length} Sims) memorized into the Memory Bank!`);
  };

  const handleGenerate = (count: number | null = null) => {
    let size = 1;
    let rollLog: string[] = ["Sim 1 (Guaranteed)"];

    if (count !== null) {
      size = Math.min(8, Math.max(1, count));
      rollLog = [`Specified Size: ${size} Sim${size > 1 ? 's' : ''}`];
    } else {
      // 2/3 Chain Roll: From 1 Sim, the next shall be rolled if 2/3 else no more sims
      // Strictly capped at 8 Sims maximum (Sims 4 limit)
      const maxCap = Math.min(8, chainRollCap > 0 ? chainRollCap : 8);
      while (size < maxCap) {
        const rollVal = Math.random();
        if (rollVal < chainRollProbability) {
          size++;
          rollLog.push(`Sim ${size}: Roll ${(rollVal * 100).toFixed(0)}% < ${(chainRollProbability * 100).toFixed(0)}% (✓ Added)`);
        } else {
          rollLog.push(`Sim ${size + 1}: Roll ${(rollVal * 100).toFixed(0)}% ≥ ${(chainRollProbability * 100).toFixed(0)}% (✕ Stopped)`);
          break;
        }
      }
      triggerNotice(`🎲 ${chainRollProbabilityInput} Chain Roll Result: ${size} Sim${size > 1 ? 's' : ''}! (${rollLog.join(' ➔ ')})`);
    }

    const newHousehold: Sim[] = [];

    for (let i = 0; i < size; i++) {
      let forceStage = (i === 0) ? "Random Teen+" : null;
      let sim = generateSimObject(forceStage, i + 1, null, activeMode === 'legacy');
      newHousehold.push(sim);
    }

    // 25% roll to attach Imaginary Friend for each Toddler or Child (strictly capped at 8 total sims)
    const eligibleChildren = newHousehold.filter(s => !s.isPet && ["Toddler", "Child"].includes(s.stage));
    for (const childSim of eligibleChildren) {
      if (newHousehold.length >= 8) break;
      if (Math.random() < 0.25) {
        const ifSim = generateImaginaryFriend(childSim, newHousehold.length + 1);
        newHousehold.push(ifSim);
      }
    }

    // Determine World Requirement
    const requiredWorlds = new Set<string>();
    newHousehold.forEach(sim => {
      const req = aspReqs[sim.asp];
      if (req && req.world) {
        requiredWorlds.add(req.world);
      }
    });

    let forceWorld: string | null = null;
    if (requiredWorlds.size === 1) {
      forceWorld = Array.from(requiredWorlds)[0];
    }
    // If size > 1, conflicting requirements -> random world (default behavior)

    const newLot = generateLot(forceWorld);

    // CRITICAL: NO SORTING BY AGE NOR ANIMALS LAST!
    // Sims and pets remain in their natural rolled / arrival order.
    // Assign clean sequential IDs in natural drawn order
    newHousehold.forEach((sim, index) => {
      sim.id = index + 1;
    });

    // Calculate relations based on natural household order
    calculateRelations(newHousehold, relationMode);

    setLot(newLot);
    setHousehold(newHousehold);
  };

  const handleAddHuman = (age: string) => {
    if (household.length >= maxHouseholdCapacity) {
      const hasPets = household.some(s => s.isPet);
      triggerNotice(`⚠️ Household is full (${household.length}/${maxHouseholdCapacity} Sims)!${hasPets ? ' You can put a pet up for adoption to free up space.' : ' Increase the Max Sims Capacity limit to add more Sims.'}`);
      return;
    }
    if (!lot.world) return;
    const newId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
    // If age is "Random", allow Pet generation (pass null for forceType)
    // Otherwise force "Human"
    const forceType = age === "Random" ? null : "Human";
    const newSim = generateSimObject(age === "Random" ? null : age, newId, forceType, activeMode === 'legacy');
    
    // Clone existing sims to avoid mutation during calculateRelations
    let newHousehold = [...household.map(s => ({ ...s })), newSim];

    // If a Toddler or Child was added, 25% roll to attach an Imaginary Friend (capped at maxHouseholdCapacity)
    if (!newSim.isPet && ["Toddler", "Child"].includes(newSim.stage) && Math.random() < 0.25 && newHousehold.length < maxHouseholdCapacity) {
      const ifSim = generateImaginaryFriend(newSim, newId + 1);
      newHousehold.push(ifSim);
      triggerNotice(`🎉 25% Roll Success! Sim ${newSim.id} (${newSim.stage}) arrived with an attached Imaginary Friend (Sim ${ifSim.id})!`);
    }

    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    triggerNotice(`➕ Sim ${newSim.id} (${newSim.stage}) added to household! (${newHousehold.length}/${maxHouseholdCapacity})`);
  };

  const handleAddPet = (age: string) => {
    if (household.length >= maxHouseholdCapacity) {
      triggerNotice(`⚠️ Household is full (${household.length}/${maxHouseholdCapacity} Sims)! You can put another pet up for adoption or increase the max Sims capacity.`);
      return;
    }
    if (!lot.world) return;
    const newId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
    const newSim = generateSimObject(age, newId, "Pet");
    // Clone existing sims
    const newHousehold = [...household.map(s => ({ ...s })), newSim];
    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    triggerNotice(`🐾 Pet ${newSim.id} (${newSim.species || 'Pet'}, ${newSim.stage}) added to household! (${newHousehold.length}/${maxHouseholdCapacity})`);
  };

  const handleRollCompleteNewSim = (role: 'partner' | 'helper' | 'general' = 'general') => {
    if (household.length >= maxHouseholdCapacity) {
      triggerNotice(`⚠️ Household is full (${household.length}/${maxHouseholdCapacity} Sims)! Increase Max Sims Capacity or move someone away first.`);
      return;
    }
    const newId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
    const newSim = generateSimObject("Young Adult", newId, "Human", activeMode === 'legacy');

    if (role === 'partner') {
      const c2Career = rollSecondaryCareer(allPackCodes);
      newSim.career = formatCareerLabel(c2Career);
      newSim.branchName = `💍 New Partner / Spouse`;
      newSim.branchBadge = "bg-pink-500/20 text-pink-300 border-pink-500/40";
      newSim.familyUnitRole = "Partner";
      newSim.baseRel = "Spouse";

      const heirSim = household.find(s => s.familyUnitRole === "Heir" || s.id === 1) || household[0];
      if (heirSim) {
        newSim.customRelations = { [heirSim.id]: "Spouse" };
        heirSim.customRelations = { ...(heirSim.customRelations || {}), [newSim.id]: "Spouse" };
        const romDyn = roll(db.romanceDynamics);
        newSim.romanticDynamic = romDyn;
        newSim.customDynamics = { [heirSim.id]: romDyn };
        heirSim.customDynamics = { ...(heirSim.customDynamics || {}), [newSim.id]: romDyn };
      }

      if (currentLegacyRoll) {
        const currentSlots = currentLegacyRoll.secondaryCareers || [];
        const newSlot = {
          id: `replacement-partner-${newId}`,
          role: 'spouse' as const,
          label: `New Partner / Spouse (Sim #${newId})`,
          tag: 'Spouse',
          career: c2Career
        };
        const updatedRoll: LegacyRollResult = {
          ...currentLegacyRoll,
          secondaryCareer: c2Career,
          secondaryCareers: [...currentSlots, newSlot]
        };
        setCurrentLegacyRoll(updatedRoll);
      }

      const newHousehold = [...household.map(s => ({ ...s })), newSim];
      calculateRelations(newHousehold, relationMode, true);
      setHousehold(newHousehold);
      triggerNotice(`💍 Completely rolled & added New Partner (Sim #${newSim.id}) with C2 Job: ${c2Career.categoryType} [Divorce / Move-Out replacement]!`);
    } else if (role === 'helper') {
      const c2Career = rollSecondaryCareer(allPackCodes);
      newSim.career = formatCareerLabel(c2Career);
      newSim.branchName = `🤝 Helper Sim`;
      newSim.branchBadge = "bg-teal-500/20 text-teal-300 border-teal-500/40";
      newSim.familyUnitRole = "Helper";
      newSim.baseRel = "Roommate";

      const newHousehold = [...household.map(s => ({ ...s })), newSim];
      calculateRelations(newHousehold, relationMode, true);
      setHousehold(newHousehold);
      triggerNotice(`🤝 Completely rolled & added New Helper (Sim #${newSim.id}) with C2 Job: ${c2Career.categoryType}!`);
    } else {
      const newHousehold = [...household.map(s => ({ ...s })), newSim];
      calculateRelations(newHousehold, relationMode, true);
      setHousehold(newHousehold);
      triggerNotice(`🎲 Completely rolled & added New Sim #${newSim.id} (${newSim.stage}, ${newSim.baseGender}) from scratch!`);
    }
  };

  const checkHeirDeathSuccession = (householdList: Sim[], deceasedId: number): { updated: Sim[]; notice?: string } => {
    const deceased = householdList.find(s => s.id === deceasedId);
    if (!deceased) return { updated: householdList };

    const isHeir = deceased.familyUnitRole === "Heir" || deceased.familyUnitRole === "Founder" || deceased.isNextHeir;
    if (!isHeir) return { updated: householdList };

    // Find living surviving children (biological or adopted)
    const survivingChildren = householdList.filter(s =>
      s.id !== deceasedId &&
      !s.isPet &&
      !s.ghost &&
      (s.familyUnitRole === "Child" || s.familyUnitRole === "Next Heir" || s.baseRel === "Child")
    );

    if (survivingChildren.length === 0) return { updated: householdList };

    // Choose designated next heir if alive, or first surviving child
    const chosenSuccessor = survivingChildren.find(s => s.isNextHeir) || survivingChildren[0];

    const updated = householdList.map(s => {
      if (s.id === chosenSuccessor.id) {
        return {
          ...s,
          familyUnitRole: "Heir",
          isNextHeir: true,
          branchName: `👑 Successor Heir (${s.stage} • Succeeded Deceased Sim ${deceasedId})`,
          branchBadge: "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm"
        };
      }
      if (s.id === deceasedId) {
        return {
          ...s,
          branchName: `👻 Former Heir (Deceased • Sim ${deceasedId})`,
          branchBadge: "bg-purple-950/70 text-purple-300 border-purple-700/60"
        };
      }
      return { ...s };
    });

    const notice = `👑 HEIR SUCCESSION ACTIVATED: Heir Sim ${deceasedId} died! Surviving child Sim ${chosenSuccessor.id} (${chosenSuccessor.stage}) has inherited the mantle as the active Heir and can now be rolled!`;
    return { updated, notice };
  };

  const handleSetNextHeir = (id: number) => {
    const targetSim = household.find(s => s.id === id);
    if (!targetSim) return;
    const activeMarital = currentLegacyRoll?.marital?.entry?.title || "";
    const isMixedGen = activeMode === 'legacy' && Boolean(activeMarital.includes("Mixed"));

    // Check if the current primary Heir in the household is dead or missing
    const currentPrimaryHeir = household.find(s => 
      s.id !== id && (s.familyUnitRole === "Heir" || s.familyUnitRole === "Founder")
    );
    const isPrimaryHeirDead = Boolean(currentPrimaryHeir && (currentPrimaryHeir.ghost || (currentPrimaryHeir.cause && currentPrimaryHeir.cause !== "N/A")));

    setHousehold(prev => {
      const newHousehold = prev.map(sim => {
        if (sim.isPet) return sim;
        if (sim.id === id) {
          const removeGhost = isMixedGen && sim.ghost;
          const isPromotedToPrimary = isPrimaryHeirDead || !currentPrimaryHeir;
          return {
            ...sim,
            ghost: removeGhost ? false : sim.ghost,
            cause: removeGhost ? "N/A" : sim.cause,
            isNextHeir: true,
            familyUnitRole: isPromotedToPrimary ? "Heir" : "Next Heir",
            branchName: isPromotedToPrimary 
              ? `👑 Successor Heir (${sim.stage} • Sim ${id})`
              : (sim.isAdopted ? `🌟 Next Heir (Adopted)` : `🌟 Next Heir (Infant Start)`),
            branchBadge: "bg-amber-500/25 text-amber-300 border-amber-400 font-extrabold shadow-sm"
          };
        }
        if (sim.isNextHeir && sim.id !== id) {
          return {
            ...sim,
            isNextHeir: false,
            familyUnitRole: "Child",
            branchName: sim.isAdopted ? `🧒 Sibling (Adopted)` : `👶 Sibling`,
            branchBadge: sim.isAdopted ? "bg-violet-500/20 text-violet-300 border-violet-500/40" : "bg-sky-500/20 text-sky-300 border-sky-500/40"
          };
        }
        return sim;
      });

      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });

    if (targetSim?.ghost && isMixedGen) {
      triggerNotice(`🌟 Sim ${id} crowned as Heir! Ghost status was removed: The Heir cannot be a ghost in Mixed generations because ghosts cannot conceive biological children.`);
    } else {
      triggerNotice(`👑 Sim ${id} (${targetSim.stage}) is now crowned as the official Heir / Successor and can be rolled!`);
    }
  };

  const handlePutPetUpForAdoption = (id: number) => {
    const pet = household.find(s => s.id === id);
    if (!pet || !pet.isPet) return;
    const newHousehold = household.filter(s => s.id !== id).map(s => ({ ...s }));
    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    triggerNotice(`🏡 Pet ${pet.id} (${pet.stage} ${pet.species || 'Pet'}) was placed in an adoptive home, freeing up space! (${newHousehold.length}/${maxHouseholdCapacity} Sims)`);
  };

  const handleRemoveSim = (id: number) => {
    // Filter and then clone the remaining sims
    let newHousehold = household.filter(s => s.id !== id).map(s => ({ ...s }));

    // Check if removed Sim was the Heir; if so, trigger succession to surviving child
    const { updated, notice } = checkHeirDeathSuccession(newHousehold, id);
    newHousehold = updated;

    // If an imaginary friend was linked to the removed Sim, re-bind or unbind
    newHousehold = newHousehold.map(s => {
      if (s.occult === "Imaginary Friend" && s.linkedSimId === id) {
        const nextTarget = newHousehold.find(other => other.id !== s.id && !other.isPet && ["Toddler", "Child"].includes(other.stage));
        return {
          ...s,
          linkedSimId: nextTarget ? nextTarget.id : undefined,
          stage: nextTarget ? nextTarget.stage : s.stage
        };
      }
      return s;
    });

    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    if (notice) triggerNotice(notice);
  };

  const handleToggleGhost = (id: number) => {
    const targetSim = household.find(s => s.id === id);
    if (!targetSim) return;
    const willBeGhost = !targetSim.ghost;

    let newHousehold = household.map(sim => {
      if (sim.id !== id) return { ...sim };
      const deathCause = willBeGhost ? rollDeathCause(sim.stage, sim.occult, sim.isPet) : "N/A";
      return {
        ...sim,
        ghost: willBeGhost,
        cause: deathCause
      };
    });

    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    if (willBeGhost) {
      triggerNotice(`👻 Sim ${id} is now a Ghost Sim! (Playable Ghost • Ghost Pregnancies mod supported)`);
    } else {
      triggerNotice(`✨ Sim ${id} returned to mortal form!`);
    }
  };

  const handleUpdateDeath = (id: number, cause: string) => {
    let newHousehold = household.map(sim => sim.id === id ? { ...sim, cause } : { ...sim });
    if (cause !== "N/A") {
      const { updated, notice } = checkHeirDeathSuccession(newHousehold, id);
      newHousehold = updated;
      calculateRelations(newHousehold, relationMode, true);
      setHousehold(newHousehold);
      if (notice) triggerNotice(notice);
      else triggerNotice(`💀 Updated Sim ${id}'s cause of death to "${cause}".`);
    } else {
      setHousehold(newHousehold);
    }
  };

  const applyOccultChanges = (sim: Sim, newOccult: string): Sim => {
    let updatedSim = { ...sim, occult: newOccult };

    if (newOccult === "Servo") {
      const wasYoung = ["Infant", "Toddler", "Child"].includes(sim.stage);
      const wasTeen = sim.stage === "Teen";

      if (wasYoung || wasTeen) updatedSim.stage = "Young Adult";
      
      updatedSim.pregnancy = "N/A"; updatedSim.milk = "N/A"; updatedSim.toilet = "N/A";
      updatedSim.gender = "N/A"; updatedSim.pref = "N/A";
      updatedSim.ghost = false; updatedSim.cause = "N/A";

      // Reroll logic for Young Sims becoming Servos
      if (wasYoung) {
        updatedSim.traits = [];
        for (let k = 0; k < 3; k++) {
          let t = getValidTrait(db.adultTraits, updatedSim.traits);
          if (t) updatedSim.traits.push(t);
        }
        updatedSim.asp = roll(db.aspirationsAdult);
        updatedSim.hobby = roll(db.adultSkills);
        updatedSim.career = roll(db.allCareers);
      } else if (wasTeen) {
        // Ensure 3 traits for former Teens
        while (updatedSim.traits.length < 3) {
          let t = getValidTrait(db.adultTraits, updatedSim.traits);
          if (t) updatedSim.traits.push(t);
          else break;
        }
        // Reroll career to ensure full adult career
        updatedSim.career = roll(db.allCareers);
      }
      
      updatedSim.attracted = roll(["Men", "Women", "Both", "Neither"]);
      updatedSim.exploring = roll(["Yes", "No"]);
      updatedSim.woohoo = roll(["Men", "Women", "Both", "None"]);
      let woohooJealousy = updatedSim.woohoo === "None" ? "No" : roll(["Yes", "No"]);
      updatedSim.bounds = { phys: roll(["Yes", "No"]), nonphys: roll(["Yes", "No"]), woo: woohooJealousy, flex: roll(["Yes", "No"]) };

      let availMods = [...db.servoModules];
      updatedSim.modules = [];
      let numMods = rNum(1, 3);
      for (let i = 0; i < numMods; i++) {
        let m = roll(availMods);
        updatedSim.modules.push(m);
        availMods = availMods.filter(x => x !== m);
      }
      let req = aspReqs[updatedSim.asp];
      if (req && req.occult) {
        let safeAsps = db.aspirationsAdult.filter(a => !aspReqs[a] || !aspReqs[a].occult);
        updatedSim.asp = roll(safeAsps);
      }
    } else if (newOccult === "Imaginary Friend") {
      // Must be linked to a toddler up to child
      const targetSim = household.find(s => s.id !== sim.id && !s.isPet && ["Toddler", "Child"].includes(s.stage));
      if (targetSim) {
        updatedSim.linkedSimId = targetSim.id;
        updatedSim.stage = targetSim.stage;
      } else {
        if (!["Toddler", "Child"].includes(sim.stage)) {
          updatedSim.stage = "Child";
        }
      }

      updatedSim.modules = [];
      updatedSim.isFunctional = false;
      updatedSim.pregnancy = "N/A"; updatedSim.milk = "N/A"; updatedSim.toilet = "N/A";
      updatedSim.gender = "N/A"; updatedSim.pref = "N/A";
      updatedSim.career = "N/A";
      updatedSim.attracted = "N/A"; updatedSim.exploring = "N/A"; updatedSim.woohoo = "N/A";
      updatedSim.bounds = null;

      if (updatedSim.stage === "Toddler") {
        updatedSim.traits = [roll(db.toddlerTraits)];
        updatedSim.hobby = roll(db.toddlerSkills);
        updatedSim.asp = "N/A";
        updatedSim.childSkills = undefined;
        updatedSim.unlockedAdultSkills = undefined;
      } else {
        updatedSim.stage = "Child";
        updatedSim.traits = [roll(db.childTraits)];
        updatedSim.hobby = roll(db.childSkills);
        updatedSim.asp = roll(db.aspirationsChild);
        updatedSim.childSkills = generateChildMultiSkills(updatedSim.hobby);
        updatedSim.unlockedAdultSkills = getUnlockedAdultSkills(updatedSim.childSkills);
      }
    } else {
      updatedSim.linkedSimId = undefined;
      updatedSim.modules = [];
      if (updatedSim.isFunctional && updatedSim.pregnancy === "N/A") {
        updatedSim.pregnancy = roll(db.pregnancyWeighted);
        updatedSim.milk = roll(["Yes", "No"]);
        updatedSim.toilet = roll(["Standing", "Sitting"]);
        updatedSim.gender = roll(["Masculine", "Feminine"]);
        updatedSim.pref = roll(["Masculine", "Feminine"]);
      }
      let req = aspReqs[updatedSim.asp];
      if (req && req.occult && req.occult !== updatedSim.occult) {
        let pool = db.aspirationsAdult.filter(a => !aspReqs[a] || !aspReqs[a].occult || aspReqs[a].occult === updatedSim.occult);
        updatedSim.asp = roll(pool);
      }
    }

    if (updatedSim.ghost) updatedSim.cause = rollDeathCause(updatedSim.stage, updatedSim.occult, updatedSim.isPet);

    return updatedSim;
  };

  const handleRerollOccult = (id: number) => {
    setHousehold(prev => {
      const simToRoll = prev.find(s => s.id === id);
      if (!simToRoll || simToRoll.isPet) return prev;

      let allowedOccults = [...db.occults];
      // In Random Legacy Challenge, Servos cannot reproduce biologically, so exclude for Heirs/Spouses, but ALLOW for Helpers!
      if (activeMode === 'legacy' && simToRoll.familyUnitRole !== "Helper") {
        allowedOccults = allowedOccults.filter(o => o !== "Servo");
      }
      if (["Infant", "Toddler", "Child", "Teen"].includes(simToRoll.stage)) {
        allowedOccults = allowedOccults.filter(o => o !== "Servo");
      }

      // Imaginary friend must be linked to a toddler or child
      const hasToddlerOrChild = prev.some(s => s.id !== id && !s.isPet && ["Toddler", "Child"].includes(s.stage));
      if (!hasToddlerOrChild && !["Toddler", "Child"].includes(simToRoll.stage)) {
        allowedOccults = allowedOccults.filter(o => o !== "Imaginary Friend");
      }

      const newOccult = roll(allowedOccults);
      const newHousehold = prev.map(sim => {
        if (sim.id !== id) return { ...sim };
        return applyOccultChanges(sim, newOccult);
      });
      
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleOccultChange = (id: number, newOccult: string) => {
    const simToChange = household.find(s => s.id === id);
    if (activeMode === 'legacy' && newOccult === "Servo" && simToChange && simToChange.familyUnitRole !== "Helper") {
      triggerNotice("⚠️ In Random Legacy Challenge, Servos cannot be Heirs or Spouses because they cannot reproduce, but Servos ARE allowed as Helpers / Roommates!");
      return;
    }
    setHousehold(prev => {
      const newHousehold = prev.map(sim => {
        if (sim.id !== id || sim.isPet) return { ...sim };
        return applyOccultChanges(sim, newOccult);
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleUpdateLinkedSim = (id: number, targetSimId: number) => {
    setHousehold(prev => {
      const target = prev.find(s => s.id === targetSimId);
      const newHousehold = prev.map(sim => {
        if (sim.id !== id) return { ...sim };
        const updated = { ...sim, linkedSimId: targetSimId };
        if (target && ["Toddler", "Child"].includes(target.stage)) {
          updated.stage = target.stage;
          if (target.stage === "Toddler" && sim.stage !== "Toddler") {
            updated.traits = [roll(db.toddlerTraits)];
            updated.hobby = roll(db.toddlerSkills);
            updated.asp = "N/A";
            updated.childSkills = undefined;
            updated.unlockedAdultSkills = undefined;
          } else if (target.stage === "Child" && sim.stage !== "Child") {
            updated.traits = [roll(db.childTraits)];
            updated.hobby = roll(db.childSkills);
            updated.asp = roll(db.aspirationsChild);
            updated.childSkills = generateChildMultiSkills(updated.hobby);
            updated.unlockedAdultSkills = getUnlockedAdultSkills(updated.childSkills);
          }
        }
        return updated;
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleRollImaginaryFriend = (childId: number) => {
    const child = household.find(s => s.id === childId);
    if (!child || !["Toddler", "Child"].includes(child.stage)) return;
    if (household.length >= 8) {
      triggerNotice("⚠️ Household is full (maximum 8 Sims)!");
      return;
    }
    const existing = household.find(s => s.occult === "Imaginary Friend" && s.linkedSimId === childId);
    if (existing) {
      triggerNotice(`🧸 Sim ${childId} already has an Imaginary Friend (Sim ${existing.id})!`);
      return;
    }

    const hit = Math.random() < 0.25;
    if (hit) {
      const newId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
      const ifSim = generateImaginaryFriend(child, newId);
      const newHousehold = [...household.map(s => ({ ...s })), ifSim];
      calculateRelations(newHousehold, relationMode, true);
      setHousehold(newHousehold);
      triggerNotice(`🎉 25% Roll Success! An Imaginary Friend (Sim ${newId}) manifested for Sim ${childId}!`);
    } else {
      triggerNotice(`🎲 Rolled 25%: Missed this time. Sim ${childId}'s Imaginary Friend didn't appear. (Try rolling again or click Attach!)`);
    }
  };

  const handleForceAttachImaginaryFriend = (childId: number) => {
    const child = household.find(s => s.id === childId);
    if (!child || !["Toddler", "Child"].includes(child.stage)) return;
    if (household.length >= 8) {
      triggerNotice("⚠️ Household is full (maximum 8 Sims)!");
      return;
    }
    const newId = household.length ? Math.max(...household.map(s => s.id)) + 1 : 1;
    const ifSim = generateImaginaryFriend(child, newId);
    const newHousehold = [...household.map(s => ({ ...s })), ifSim];
    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
    triggerNotice(`✨ Attached Imaginary Friend (Sim ${newId}) to Sim ${childId}!`);
  };

  const handleMakeImaginaryFriendReal = (ifId: number) => {
    setHousehold(prev => {
      const target = prev.find(s => s.id === ifId);
      if (!target || target.occult !== "Imaginary Friend") return prev;

      const newHousehold = prev.map(sim => {
        if (sim.id !== ifId) return { ...sim };
        const updated: Sim = {
          ...sim,
          isMadeReal: true,
          isDoll: false,
          isFunctional: true,
          stage: sim.stage === "Toddler" || sim.stage === "Child" ? "Teen" : sim.stage,
          familyUnitRole: "Helper",
          branchName: "🌟 Imaginary Friend (Made Real • Helper)",
          branchBadge: "bg-gradient-to-r from-purple-500/25 to-teal-500/25 text-teal-300 border-teal-400 font-extrabold shadow-sm",
          baseRel: "Roommate",
          pregnancy: sim.pregnancy === "N/A" ? roll(db.pregnancyWeighted) : sim.pregnancy,
          milk: sim.milk === "N/A" ? roll(["Yes", "No"]) : sim.milk,
          toilet: sim.toilet === "N/A" ? roll(["Standing", "Sitting"]) : sim.toilet,
          gender: sim.gender === "N/A" ? (sim.baseGender === "Female" ? "Feminine" : "Masculine") : sim.gender,
          pref: sim.pref === "N/A" ? (sim.baseGender === "Female" ? "Feminine" : "Masculine") : sim.pref,
          attracted: sim.attracted === "N/A" || !sim.attracted ? roll(["Men", "Women", "Both", "Neither"]) : sim.attracted,
          exploring: sim.exploring === "N/A" || !sim.exploring ? roll(["Yes", "No"]) : sim.exploring,
          woohoo: sim.woohoo === "N/A" || !sim.woohoo ? roll(["Men", "Women", "Both", "None"]) : sim.woohoo,
        };

        const wJeal = updated.woohoo === "None" ? "No" : roll(["Yes", "No"]);
        if (!updated.bounds) {
          updated.bounds = { phys: roll(["Yes", "No"]), nonphys: roll(["Yes", "No"]), woo: wJeal, flex: roll(["Yes", "No"]) };
        }

        // Add traits up to Teen level (2 traits)
        const tPool = db.adultTraits;
        while (updated.traits.length < 2) {
          const t = getValidTrait(tPool, updated.traits);
          if (t) updated.traits.push(t);
          else break;
        }

        if (updated.asp === "N/A" || db.aspirationsChild.includes(updated.asp)) {
          updated.asp = roll(db.aspirationsAdult);
        }
        if (updated.career === "N/A") {
          updated.career = roll(["<strong>Part-Time:</strong> Fast Food", "<strong>Part-Time:</strong> Barista", "<strong>Part-Time:</strong> Retail", "<strong>Student:</strong> High School"]);
        }
        if (updated.hobby === "N/A" || db.childSkills.includes(updated.hobby) || db.toddlerSkills.includes(updated.hobby)) {
          updated.hobby = roll(db.adultSkills);
        }

        return updated;
      });

      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
    triggerNotice(`✨ METAMORPHIUM POTION SUCCESS! Imaginary Friend (Sim ${ifId}) turned REAL and became an official playable Teen member of the household!`);
  };

  const handleKeepImaginaryFriendAsDoll = (ifId: number) => {
    setHousehold(prev => {
      const target = prev.find(s => s.id === ifId);
      if (!target || target.occult !== "Imaginary Friend") return prev;

      const newHousehold = prev.map(sim => {
        if (sim.id !== ifId) return { ...sim };
        return {
          ...sim,
          isDoll: true,
          isMadeReal: false,
          isFunctional: false,
          branchName: "🧸 Imaginary Friend Doll (Keepsake • Stayed as Doll)",
          branchBadge: "bg-purple-950/60 text-purple-300 border-purple-800 italic",
          career: "N/A",
          asp: "N/A"
        };
      });

      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
    triggerNotice(`🧸 Imaginary Friend (Sim ${ifId}) remained in doll form as a childhood keepsake.`);
  };

  const handleAgeUp = (id: number) => {
    setHousehold(prev => {
      // Clone all sims first
      const newHousehold = prev.map(sim => ({ ...sim }));
      
      const simIndex = newHousehold.findIndex(s => s.id === id);
      if (simIndex === -1) return newHousehold;
      
      const sim = newHousehold[simIndex];
      if (sim.occult === "Servo") return newHousehold;

      let stageList = sim.isPet ? db.petStages : db.stages;
      let stageIdx = stageList.indexOf(sim.stage);
      if (stageIdx >= stageList.length - 1) return newHousehold;
      let newStage = stageList[stageIdx + 1];

      let updatedSim = { ...sim, stage: newStage };

      if (!updatedSim.isPet) {
        if (newStage === "Toddler") {
          const t = roll(db.toddlerTraits);
          updatedSim.traits = [t]; 
          updatedSim.hobby = roll(db.toddlerSkills);
          updatedSim.childSkills = undefined;
          updatedSim.unlockedAdultSkills = undefined;

          // 25% Imaginary Friend roll at Toddler age
          const hasLinkedIF = newHousehold.some(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (!hasLinkedIF && newHousehold.length < maxHouseholdCapacity && Math.random() < 0.25) {
            const ifSim = generateImaginaryFriend(updatedSim, newHousehold.length + 1);
            newHousehold.push(ifSim);
            triggerNotice(`🌱 Sim ${id} aged up to Toddler! New Toddler trait: "${t}" • 🧸 25% Roll Success! An Imaginary Friend (Sim ${ifSim.id}) manifested!`);
          } else {
            triggerNotice(`🌱 Sim ${id} aged up to Toddler! New Toddler trait: "${t}" • Fundamental: ${updatedSim.hobby}`);
          }
        } else if (newStage === "Child") {
          const t = roll(db.childTraits);
          updatedSim.traits = [t]; 
          updatedSim.asp = roll(db.aspirationsChild); 
          updatedSim.hobby = roll(db.childSkills);
          updatedSim.childSkills = generateChildMultiSkills(updatedSim.hobby);
          updatedSim.unlockedAdultSkills = getUnlockedAdultSkills(updatedSim.childSkills);
          triggerNotice(`🌱 Sim ${id} aged up to Child! New Child trait: "${t}" • Aspiration: "${updatedSim.asp}"`);

          // If this Sim has an attached Toddler Imaginary Friend, age them up to Child as well
          const ifFriend = newHousehold.find(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (ifFriend && ifFriend.stage === "Toddler") {
            ifFriend.stage = "Child";
            ifFriend.traits = [roll(db.childTraits)];
            ifFriend.hobby = roll(db.childSkills);
            ifFriend.asp = roll(db.aspirationsChild);
            ifFriend.childSkills = generateChildMultiSkills(ifFriend.hobby);
            ifFriend.unlockedAdultSkills = getUnlockedAdultSkills(ifFriend.childSkills);
          }
        } else if (newStage === "Teen") {
          // If this Sim has an attached Imaginary Friend, advance the IF to Teen stage as well
          const ifFriend = newHousehold.find(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (ifFriend) {
            ifFriend.stage = "Teen";
            if (!ifFriend.isMadeReal) {
              ifFriend.isDoll = true;
              ifFriend.isFunctional = false;
              ifFriend.branchName = "🧸 Imaginary Friend Doll (Keepsake • Stayed as Doll)";
              ifFriend.branchBadge = "bg-purple-950/60 text-purple-300 border-purple-800 italic";
              triggerNotice(`🧸 Sim ${id} reached Teen! Their Imaginary Friend (Sim ${ifFriend.id}) reached Teen stage as a Doll companion. You can turn them into a real household member or keep them as a doll!`);
            }
          }

          if (updatedSim.occult === "Imaginary Friend") {
            if (updatedSim.isMadeReal) {
              updatedSim.isFunctional = true;
              updatedSim.stage = "Teen";
            } else {
              updatedSim.isDoll = true;
              updatedSim.isFunctional = false;
              updatedSim.stage = "Teen";
              updatedSim.branchName = "🧸 Imaginary Friend Doll (Keepsake • Stayed as Doll)";
              updatedSim.branchBadge = "bg-purple-950/60 text-purple-300 border-purple-800 italic";
              triggerNotice(`🧸 Imaginary Friend (Sim ${id}) reached Teen! Stays as a doll by default; click "Make Real" to bring them to life as a household member.`);
            }
          } else {
            updatedSim.isFunctional = true;
            updatedSim.pregnancy = roll(db.pregnancyWeighted);
            updatedSim.milk = roll(["Yes", "No"]); updatedSim.toilet = roll(["Standing", "Sitting"]);
            updatedSim.attracted = roll(["Men", "Women", "Both", "Neither"]); updatedSim.exploring = roll(["Yes", "No"]);
            updatedSim.woohoo = roll(["Men", "Women", "Both", "None"]);
            let woohooJealousy = updatedSim.woohoo === "None" ? "No" : roll(["Yes", "No"]);
            updatedSim.bounds = { phys: roll(["Yes", "No"]), nonphys: roll(["Yes", "No"]), woo: woohooJealousy, flex: roll(["Yes", "No"]) };

            if (updatedSim.gender === "N/A") updatedSim.gender = roll(["Masculine", "Feminine"]);
            if (updatedSim.pref === "N/A") updatedSim.pref = roll(["Masculine", "Feminine"]);

            // User Requirement: "When children get to teen roll tyheir ocult type normally but exclude ghost roll"
            const livingOccults = db.occults.filter(o => o !== "Imaginary Friend" && o !== "Servo");
            if (Math.random() < 0.35) {
              updatedSim.occult = roll(livingOccults);
            } else if (!updatedSim.occult || updatedSim.occult === "Ghost") {
              updatedSim.occult = "None";
            }
            // Strictly exclude ghost roll
            updatedSim.ghost = false;
            updatedSim.cause = "N/A";

            let aspPool = db.aspirationsAdult.filter(a => { let r = aspReqs[a]; return !r || !r.occult || r.occult === updatedSim.occult; });
            updatedSim.asp = roll(aspPool);
            updatedSim.hobby = roll(db.adultSkills);

            let req = aspReqs[updatedSim.asp] || {};
            if (req.career) updatedSim.career = req.career;
            else updatedSim.career = roll(["<strong>Part-Time:</strong> Fast Food", "<strong>Part-Time:</strong> Barista", "<strong>Part-Time:</strong> Retail", "<strong>Student:</strong> High School", "<strong>Part-Time:</strong> Young Noble"]);

            // Roll next adult trait for Teen
            let t = getValidTrait(db.adultTraits, updatedSim.traits);
            if (t) updatedSim.traits.push(t);

            triggerNotice(`🌱 Sim ${id} aged up to Teen! 2nd Trait rolled: "${t || 'N/A'}" • Occult: ${updatedSim.occult === "None" ? "Human" : updatedSim.occult} (Ghost excluded)`);

            // Award Child Aspiration reward trait upon aging up to Teen (e.g. Creatively Gifted, Idea Person, Physically Gifted, Pack Animal, Socially Gifted, Practiced Host, Mentally Gifted, Headstrong)
            if (sim.asp && childAspirationMap[sim.asp]) {
              const childAsp = childAspirationMap[sim.asp];
              const rewardName = childAsp.rewardTrait.name;
              if (!updatedSim.traits.includes(rewardName)) {
                updatedSim.traits.push(rewardName);
                triggerNotice(`🏆 Child Aspiration Achieved! Sim ${id} completed "${sim.asp}" and unlocked the "${rewardName}" reward trait!`);
              }
            }
          }
        } else if (newStage === "Young Adult") {
          let req = aspReqs[updatedSim.asp] || {};
          if (req.career) updatedSim.career = req.career;
          else updatedSim.career = roll(db.allCareers);

          // Roll next (3rd) adult trait
          let t = getValidTrait(db.adultTraits, updatedSim.traits);
          if (t) updatedSim.traits.push(t);

          triggerNotice(`🌱 Sim ${id} aged up to Young Adult! 3rd Trait rolled: "${t || 'N/A'}"`);
        } else if (newStage === "Adult") {
          const isHeir = updatedSim.familyUnitRole === "Heir" || updatedSim.familyUnitRole === "Founder" || updatedSim.isNextHeir || updatedSim.id === 1;
          if (isHeir && currentLegacyRoll?.goal?.entry?.id === 12) {
            let aspects = currentLegacyRoll.goal.midlifeCrisisAspects;
            if (!aspects || aspects.length === 0) {
              aspects = rollMidlifeCrisisAspects();
            }
            const hasAspect3 = aspects.some(a => a.roll === 3);
            let newCareer = currentLegacyRoll.heirCareer;
            if (hasAspect3) {
              newCareer = rollHeirCareer(allPackCodes);
              const formatted = formatCareerLabel(newCareer);
              updatedSim.career = formatted;
            }
            const titles = aspects.map(a => '#' + a.roll + ' ' + a.title).join(' • ');
            setCurrentLegacyRoll(prev => prev ? {
              ...prev,
              heirCareer: newCareer,
              goal: {
                ...prev.goal,
                midlifeCrisisAspects: aspects,
                midlifeCrisisRevealed: true,
              },
              notes: prev.notes ? `${prev.notes} | Midlife Crisis: ${titles}` : `Midlife Crisis: ${titles}`
            } : null);
            triggerNotice(`🔥 Midlife Crisis (Goal 12) Revealed: Heir Sim ${id} reached Adulthood! Aspects: ${titles}${hasAspect3 ? ` • Aspect #3: C1 Career re-rolled to ${newCareer.categoryType}!` : ''}`);
          } else {
            triggerNotice(`🌱 Sim ${id} aged up to Adult!`);
          }
        } else if (newStage === "Elder" && updatedSim.ghost) {
          updatedSim.cause = rollDeathCause("Elder", updatedSim.occult, false);
        }
      } else {
        if (newStage === "Elder" && Math.random() < 0.1) { updatedSim.ghost = true; updatedSim.cause = "Old Age"; }
      }
      
      newHousehold[simIndex] = updatedSim;
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleUpdateStage = (id: number, targetStage: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => ({ ...sim }));
      const simIndex = newHousehold.findIndex(s => s.id === id);
      if (simIndex === -1) return newHousehold;

      const sim = newHousehold[simIndex];
      if (sim.stage === targetStage) return newHousehold;
      if (sim.occult === "Servo") return newHousehold;

      let updatedSim = { ...sim, stage: targetStage };

      if (!updatedSim.isPet) {
        if (targetStage === "Infant") {
          updatedSim.isFunctional = false;
          updatedSim.traits = [roll(db.infantTraits)];
          updatedSim.hobby = "N/A";
          updatedSim.asp = "N/A";
          updatedSim.career = "N/A";
          updatedSim.childSkills = undefined;
          updatedSim.toddlerSkills = undefined;
          updatedSim.unlockedAdultSkills = undefined;
          triggerNotice(`🌱 Sim ${id} stage set to Infant! Trait: "${updatedSim.traits[0]}"`);
        } else if (targetStage === "Toddler") {
          updatedSim.isFunctional = false;
          const t = roll(db.toddlerTraits);
          updatedSim.traits = [t];
          updatedSim.hobby = roll(db.toddlerSkills);
          updatedSim.asp = "N/A";
          updatedSim.career = "N/A";
          updatedSim.childSkills = undefined;
          updatedSim.toddlerSkills = undefined;
          updatedSim.unlockedAdultSkills = undefined;

          // 25% Imaginary Friend roll at Toddler age
          const hasLinkedIF = newHousehold.some(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (!hasLinkedIF && newHousehold.length < maxHouseholdCapacity && Math.random() < 0.25) {
            const ifSim = generateImaginaryFriend(updatedSim, newHousehold.length + 1);
            newHousehold.push(ifSim);
            triggerNotice(`🌱 Sim ${id} set to Toddler! Trait: "${t}" • 🧸 25% Roll Success! An Imaginary Friend (Sim ${ifSim.id}) manifested!`);
          } else {
            triggerNotice(`🌱 Sim ${id} set to Toddler! Trait: "${t}" • Fundamental: ${updatedSim.hobby} (Imaginary Friend roll available on card!)`);
          }
        } else if (targetStage === "Child") {
          updatedSim.isFunctional = false;
          const t = roll(db.childTraits);
          updatedSim.traits = [t];
          updatedSim.asp = roll(db.aspirationsChild);
          updatedSim.hobby = roll(db.childSkills);
          updatedSim.childSkills = generateChildMultiSkills(updatedSim.hobby);
          updatedSim.unlockedAdultSkills = getUnlockedAdultSkills(updatedSim.childSkills);
          updatedSim.career = "N/A";

          // If linked Imaginary Friend is at Toddler, age up to Child
          const ifFriend = newHousehold.find(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (ifFriend && ifFriend.stage === "Toddler") {
            ifFriend.stage = "Child";
            ifFriend.traits = [roll(db.childTraits)];
            ifFriend.hobby = roll(db.childSkills);
            ifFriend.asp = roll(db.aspirationsChild);
            ifFriend.childSkills = generateChildMultiSkills(ifFriend.hobby);
            ifFriend.unlockedAdultSkills = getUnlockedAdultSkills(ifFriend.childSkills);
          }
          triggerNotice(`🌱 Sim ${id} set to Child! Trait: "${t}" • Aspiration: "${updatedSim.asp}"`);
        } else if (targetStage === "Teen") {
          // If this Sim has an attached Imaginary Friend, advance the IF to Teen stage as well
          const ifFriend = newHousehold.find(s => s.occult === "Imaginary Friend" && s.linkedSimId === id);
          if (ifFriend) {
            ifFriend.stage = "Teen";
            if (!ifFriend.isMadeReal) {
              ifFriend.isDoll = true;
              ifFriend.isFunctional = false;
              ifFriend.branchName = "🧸 Imaginary Friend Doll (Keepsake • Stayed as Doll)";
              ifFriend.branchBadge = "bg-purple-950/60 text-purple-300 border-purple-800 italic";
            }
          }

          if (updatedSim.occult === "Imaginary Friend") {
            if (updatedSim.isMadeReal) {
              updatedSim.isFunctional = true;
            } else {
              updatedSim.isDoll = true;
              updatedSim.isFunctional = false;
              updatedSim.branchName = "🧸 Imaginary Friend Doll (Keepsake • Stayed as Doll)";
              updatedSim.branchBadge = "bg-purple-950/60 text-purple-300 border-purple-800 italic";
              triggerNotice(`🧸 Imaginary Friend (Sim ${id}) set to Teen in Doll form! Can be turned into a real household member or kept as a doll.`);
            }
          } else {
            updatedSim.isFunctional = true;
            updatedSim.pregnancy = roll(db.pregnancyWeighted);
            updatedSim.milk = roll(["Yes", "No"]);
            updatedSim.toilet = roll(["Standing", "Sitting"]);
            updatedSim.attracted = roll(["Men", "Women", "Both", "Neither"]);
            updatedSim.exploring = roll(["Yes", "No"]);
            updatedSim.woohoo = roll(["Men", "Women", "Both", "None"]);
            let woohooJealousy = updatedSim.woohoo === "None" ? "No" : roll(["Yes", "No"]);
            updatedSim.bounds = { phys: roll(["Yes", "No"]), nonphys: roll(["Yes", "No"]), woo: woohooJealousy, flex: roll(["Yes", "No"]) };
            if (updatedSim.gender === "N/A") updatedSim.gender = roll(["Masculine", "Feminine"]);
            if (updatedSim.pref === "N/A") updatedSim.pref = roll(["Masculine", "Feminine"]);

            const livingOccults = db.occults.filter(o => o !== "Imaginary Friend" && o !== "Servo");
            if (Math.random() < 0.35) {
              updatedSim.occult = roll(livingOccults);
            } else if (!updatedSim.occult || updatedSim.occult === "Ghost") {
              updatedSim.occult = "None";
            }
            updatedSim.ghost = false;
            updatedSim.cause = "N/A";

            while (updatedSim.traits.length < 2) {
              let t = getValidTrait(db.adultTraits, updatedSim.traits);
              if (t) updatedSim.traits.push(t);
              else break;
            }
            if (updatedSim.traits.length > 2) updatedSim.traits = updatedSim.traits.slice(0, 2);

            let aspPool = db.aspirationsAdult.filter(a => { let r = aspReqs[a]; return !r || !r.occult || r.occult === updatedSim.occult; });
            updatedSim.asp = roll(aspPool);
            updatedSim.hobby = roll(db.adultSkills);
            updatedSim.career = roll(["<strong>Part-Time:</strong> Fast Food", "<strong>Part-Time:</strong> Barista", "<strong>Part-Time:</strong> Retail", "<strong>Student:</strong> High School"]);
            triggerNotice(`🌱 Sim ${id} set to Teen! Occult: ${updatedSim.occult} • Career: ${updatedSim.career}`);
          }
        } else {
          // Young Adult, Adult, Elder
          updatedSim.isFunctional = true;
          if (updatedSim.gender === "N/A") updatedSim.gender = roll(["Masculine", "Feminine"]);
          if (updatedSim.pref === "N/A") updatedSim.pref = roll(["Masculine", "Feminine"]);
          if (updatedSim.pregnancy === "N/A") updatedSim.pregnancy = roll(db.pregnancyWeighted);
          if (updatedSim.milk === "N/A") updatedSim.milk = roll(["Yes", "No"]);
          if (updatedSim.toilet === "N/A") updatedSim.toilet = roll(["Standing", "Sitting"]);
          if (!updatedSim.attracted) updatedSim.attracted = roll(["Men", "Women", "Both", "Neither"]);
          if (!updatedSim.exploring) updatedSim.exploring = roll(["Yes", "No"]);
          if (!updatedSim.woohoo) updatedSim.woohoo = roll(["Men", "Women", "Both", "None"]);

          while (updatedSim.traits.length < 3) {
            let t = getValidTrait(db.adultTraits, updatedSim.traits);
            if (t) updatedSim.traits.push(t);
            else break;
          }
          if (updatedSim.traits.length > 3) updatedSim.traits = updatedSim.traits.slice(0, 3);

          if (updatedSim.asp === "N/A" || db.aspirationsChild.includes(updatedSim.asp)) {
            updatedSim.asp = roll(db.aspirationsAdult);
          }
          if (updatedSim.career === "N/A") {
            updatedSim.career = roll(db.allCareers);
          }
          if (updatedSim.hobby === "N/A") {
            updatedSim.hobby = roll(db.adultSkills);
          }

          const isHeir = updatedSim.familyUnitRole === "Heir" || updatedSim.familyUnitRole === "Founder" || updatedSim.isNextHeir || updatedSim.id === 1;
          if (targetStage === "Adult" && isHeir && currentLegacyRoll?.goal?.entry?.id === 12) {
            let aspects = currentLegacyRoll.goal.midlifeCrisisAspects;
            if (!aspects || aspects.length === 0) {
              aspects = rollMidlifeCrisisAspects();
            }
            const hasAspect3 = aspects.some(a => a.roll === 3);
            let newCareer = currentLegacyRoll.heirCareer;
            if (hasAspect3) {
              newCareer = rollHeirCareer(allPackCodes);
              const formatted = formatCareerLabel(newCareer);
              updatedSim.career = formatted;
            }
            const titles = aspects.map(a => '#' + a.roll + ' ' + a.title).join(' • ');
            setCurrentLegacyRoll(prev => prev ? {
              ...prev,
              heirCareer: newCareer,
              goal: {
                ...prev.goal,
                midlifeCrisisAspects: aspects,
                midlifeCrisisRevealed: true,
              },
              notes: prev.notes ? `${prev.notes} | Midlife Crisis: ${titles}` : `Midlife Crisis: ${titles}`
            } : null);
            triggerNotice(`🔥 Midlife Crisis (Goal 12) Revealed: Heir Sim ${id} reached Adulthood! Aspects: ${titles}${hasAspect3 ? ` • Aspect #3: C1 Career re-rolled to ${newCareer.categoryType}!` : ''}`);
          } else {
            triggerNotice(`🌱 Sim ${id} set to ${targetStage}!`);
          }
        }
      } else {
        if (targetStage === "Baby") {
          updatedSim.traits = [updatedSim.traits[0] || "Playful"];
        } else {
          while (updatedSim.traits.length < 3) {
            const pPool = updatedSim.species === "Dog" ? db.dogTraits : (updatedSim.species === "Cat" ? db.catTraits : db.horseTraits);
            const t = roll(pPool.filter(x => !updatedSim.traits.includes(x)));
            if (t) updatedSim.traits.push(t);
            else break;
          }
        }
        triggerNotice(`🐾 Pet ${id} set to ${targetStage}!`);
      }

      newHousehold[simIndex] = updatedSim;
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleRerollSim = (id: number, age: string) => {
    const idx = household.findIndex(s => s.id === id);
    if (idx === -1) return;

    const functionalCount = household.filter(s => s.isFunctional && !s.isPet).length;
    const willBeOnlyTeen = (household[idx].isFunctional && !household[idx].isPet && functionalCount === 1);

    let newSim: Sim;
    if (willBeOnlyTeen && age === "Random Teen+") newSim = generateSimObject("Random Teen+", id, "Human", activeMode === 'legacy');
    else newSim = generateSimObject(age, id, "Human", activeMode === 'legacy');

    // Clone all sims
    const newHousehold = household.map(s => ({ ...s }));
    newHousehold[idx] = newSim;
    calculateRelations(newHousehold, relationMode, true);
    setHousehold(newHousehold);
  };

  const handleUpdateBaseRel = (id: number, newRel: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => {
        if (sim.id === id) {
          const updatedCustom = { ...(sim.customRelations || {}) };
          updatedCustom[1] = newRel;
          return { ...sim, baseRel: newRel, customRelations: updatedCustom };
        }
        return { ...sim };
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleUpdatePairRelation = (simAId: number, simBId: number, newRel: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => ({
        ...sim,
        customRelations: { ...(sim.customRelations || {}) }
      }));

      const simA = newHousehold.find(s => s.id === simAId);
      const simB = newHousehold.find(s => s.id === simBId);
      if (!simA || !simB) return prev;

      const inverseRel = newRel === "Parent" ? "Child" : (newRel === "Child" ? "Parent" : newRel);

      simA.customRelations![simBId] = newRel;
      simB.customRelations![simAId] = inverseRel;

      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });

    triggerNotice(`💞 Updated relation: Sim ${simAId} & Sim ${simBId} set to "${newRel}"!`);
  };

  const handleRerollPairRelation = (simAId: number, simBId: number) => {
    const simA = household.find(s => s.id === simAId);
    const simB = household.find(s => s.id === simBId);
    if (!simA || !simB || simA.isPet || simB.isPet) return;

    const hasSpouse = household.some(
      s => s.id !== simBId && (simA.customRelations?.[s.id] === "Spouse" || simA.customRelations?.[s.id] === "Partner" || simA.customRelations?.[s.id] === "Engaged")
    );
    const possible = getPossiblePairRelations(simA, simB, hasSpouse, relationMode !== 'familyOnly');
    const rolled = roll(possible);
    handleUpdatePairRelation(simAId, simBId, rolled);
  };

  const handleRerollRelation = (id: number) => {
    setHousehold(prev => {
      if (prev.length < 2) return prev;
      const sim0 = prev[0];
      const targetSim = prev.find(s => s.id === id);
      if (!targetSim || targetSim.isPet) return prev;

      const hasSpouse = prev.some(s => s.id !== id && (s.baseRel === "Spouse" || s.baseRel === "Partner" || s.baseRel === "Engaged"));
      const allowUnrelated = relationMode !== 'familyOnly';
      const possible = getPossibleBaseRelations(sim0, targetSim, hasSpouse, allowUnrelated);
      const newRel = roll(possible);

      const newHousehold = prev.map(sim => {
        if (sim.id === id) {
          return { ...sim, baseRel: newRel };
        }
        return { ...sim };
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
  };

  const handleUpdateBaseGender = (id: number, newBaseGender: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => {
        if (sim.id !== id) return { ...sim };
        const updated = { ...sim, baseGender: newBaseGender };
        if (newBaseGender === "Female") {
          if (!updated.pronouns || updated.pronouns === "He/Him") updated.pronouns = "She/Her";
          if (updated.gender === "N/A" || updated.gender === "Masculine") {
            updated.gender = "Feminine";
            updated.pref = "Feminine";
          }
          if (updated.milk === "N/A" || !updated.milk) updated.milk = "Yes";
          if (updated.pregnancy === "N/A" || !updated.pregnancy) updated.pregnancy = "Can get pregnant";
          if (updated.toilet === "N/A" || !updated.toilet) updated.toilet = "Sitting";
        } else if (newBaseGender === "Male") {
          if (!updated.pronouns || updated.pronouns === "She/Her") updated.pronouns = "He/Him";
          if (updated.gender === "N/A" || updated.gender === "Feminine") {
            updated.gender = "Masculine";
            updated.pref = "Masculine";
          }
          if (updated.milk === "N/A" || !updated.milk) updated.milk = "No";
          if (updated.pregnancy === "N/A" || !updated.pregnancy) updated.pregnancy = "Can get others pregnant";
          if (updated.toilet === "N/A" || !updated.toilet) updated.toilet = "Standing";
        } else if (newBaseGender === "Non-Binary") {
          if (!updated.pronouns || updated.pronouns === "He/Him" || updated.pronouns === "She/Her") {
            updated.pronouns = "They/Them";
          }
        }
        return updated;
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
    triggerNotice(`👤 Updated Sim ${id}'s gender identity to "${newBaseGender}"!`);
  };

  const handleUpdateCustomGender = (id: number, field: string, value: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      return { ...sim, [field]: value };
    }));
    triggerNotice(`⚙️ Updated Sim ${id}'s CAS setting (${field}) to "${value}"!`);
  };

  const handleUpdatePairDynamic = (simAId: number, simBId: number, newDynamic: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => {
        if (sim.id === simAId) {
          return {
            ...sim,
            customDynamics: { ...(sim.customDynamics || {}), [simBId]: newDynamic }
          };
        }
        if (sim.id === simBId) {
          return {
            ...sim,
            customDynamics: { ...(sim.customDynamics || {}), [simAId]: newDynamic }
          };
        }
        return { ...sim };
      });
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
    triggerNotice(
      newDynamic === "None"
        ? `👨‍👩‍👧 Cleared dynamic between Sim ${simAId} and Sim ${simBId}.`
        : `👨‍👩‍👧 Set dynamic between Sim ${simAId} and Sim ${simBId} to "${newDynamic}"!`
    );
  };

  const handleUpdateSimDynamic = (id: number, familyDynamic?: string, romanticDynamic?: string) => {
    setHousehold(prev => {
      const newHousehold = prev.map(sim => ({
        ...sim,
        customDynamics: { ...(sim.customDynamics || {}) }
      }));
      const sim = newHousehold.find(s => s.id === id);
      if (!sim) return prev;

      if (familyDynamic !== undefined) sim.familyDynamic = familyDynamic;
      if (romanticDynamic !== undefined) {
        sim.romanticDynamic = romanticDynamic;
        // Synchronize with any partner or spouse in the household
        const partner = newHousehold.find(s =>
          s.id !== id && (
            s.customRelations?.[id] === "Spouse" ||
            s.customRelations?.[id] === "Partner" ||
            s.customRelations?.[id] === "Engaged" ||
            sim.customRelations?.[s.id] === "Spouse" ||
            sim.customRelations?.[s.id] === "Partner" ||
            sim.customRelations?.[s.id] === "Engaged"
          )
        );
        if (partner) {
          partner.romanticDynamic = romanticDynamic;
          sim.customDynamics![partner.id] = romanticDynamic;
          partner.customDynamics![sim.id] = romanticDynamic;
        }
      }
      calculateRelations(newHousehold, relationMode, true);
      return newHousehold;
    });
    triggerNotice(`💞 Updated family/romantic dynamic for Sim ${id}!`);
  };

  const handleChooseRandomHeir = () => {
    const result = chooseHeirRandomlyAmongSims(household);
    if (!result) {
      triggerNotice("⚠️ Need at least 2 Sims (or multiple children) in the household to choose an Heir randomly.");
      return;
    }
    setHousehold(result.updatedHousehold);
    calculateRelations(result.updatedHousehold, relationMode, true);
    triggerNotice(result.notice);
  };

  const handleAddTrait = (id: number, trait: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      return { ...sim, traits: [...sim.traits, trait] };
    }));
  };

  const handleRemoveTrait = (id: number, trait: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      return { ...sim, traits: sim.traits.filter(t => t !== trait) };
    }));
  };

  const handleUpdateTrait = (id: number, traitIndex: number, newTrait: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      const newTraits = [...sim.traits];
      newTraits[traitIndex] = newTrait;
      return { ...sim, traits: newTraits };
    }));
    triggerNotice(`✏️ Updated Sim ${id}'s trait #${traitIndex + 1} to "${newTrait}"!`);
  };

  const handleRerollSingleTraitSlot = (id: number, traitIndex: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      const pool = sim.isPet
        ? (sim.species === "Dog" ? db.dogTraits : (sim.species === "Cat" ? db.catTraits : db.horseTraits))
        : (sim.stage === "Infant" ? db.infantTraits : (sim.stage === "Toddler" ? db.toddlerTraits : (sim.stage === "Child" ? db.childTraits : db.adultTraits)));
      
      const otherTraits = sim.traits.filter((_, idx) => idx !== traitIndex);
      const available = pool.filter(t => !otherTraits.includes(t) && !otherTraits.some(ot => masterConflicts[ot]?.has(t)));
      if (available.length === 0) return sim;
      const rolled = roll(available);
      const newTraits = [...sim.traits];
      newTraits[traitIndex] = rolled;
      return { ...sim, traits: newTraits };
    }));
    triggerNotice(`🎲 Re-rolled trait #${traitIndex + 1} for Sim ${id}!`);
  };

  const handleInject = (id: number, field: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.isPet) return sim;
      let updated = { ...sim };
      if (field === 'hobby' && lastRolled.skill !== "N/A") updated.hobby = lastRolled.skill;
      else if (field === 'career' && lastRolled.job !== "N/A") updated.career = lastRolled.job;
      else if (field === 'asp' && lastRolled.asp !== "N/A") updated.asp = lastRolled.asp;
      return updated;
    }));
  };

  const handleMemorize = () => {
    if (household.length === 0) return;
    const saveObj: Memory = {
      lot: JSON.parse(JSON.stringify(lot)),
      household: JSON.parse(JSON.stringify(household)),
      timestamp: new Date().toLocaleTimeString()
    };
    setMemories(prev => [...prev, saveObj]);
  };

  const handleLoadMemory = (index: number) => {
    const saved = memories[index];
    const loadedLot = JSON.parse(JSON.stringify(saved.lot));
    const loadedHousehold = JSON.parse(JSON.stringify(saved.household));
    
    // Ensure relations are calculated/restored
    calculateRelations(loadedHousehold);
    
    setLot(loadedLot);
    setHousehold(loadedHousehold);
  };

  const handleImport = (importedMemories: Memory[]) => {
    setMemories(importedMemories);
  };

  const handleUpdateLastRolled = (skill: string, job: string, asp: string) => {
    setLastRolled(prev => ({
      skill: skill !== "N/A" ? skill : prev.skill,
      job: job !== "N/A" ? job : prev.job,
      asp: asp !== "N/A" ? asp : prev.asp
    }));
  };

  const handleSelectAdultAspiration = (id: number, newAsp: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      const updated = { ...sim, asp: newAsp };
      if (ruleOrientation === 'inverted') {
        const match = getMatchingCareerForAspiration(newAsp);
        if (match) {
          updated.career = match;
          triggerNotice(`🔄 Inverted Rule Applied: Selected "${newAsp}" ➔ Auto-assigned matching career!`);
        } else {
          triggerNotice(`🎯 Selected "${newAsp}" for Sim ${id}!`);
        }
      } else {
        triggerNotice(`🎯 Selected "${newAsp}" for Sim ${id}!`);
      }
      return updated;
    }));
  };

  const handleInvertAlignCareer = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      const match = getMatchingCareerForAspiration(sim.asp);
      if (!match) return sim;
      triggerNotice(`⚡ Inverted Rule: Set Sim ${id}'s career to match "${sim.asp}"!`);
      return { ...sim, career: match };
    }));
  };

  const handleAlignAspirationToCareer = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      const pool = sim.stage === "Child" ? db.aspirationsChild : (sim.stage === "Teen" ? [...db.aspirationsTeen, ...db.aspirationsAdult] : db.aspirationsAdult);
      const validPool = getCompatibleAspirationsForCareer(sim.career, pool);
      const chosen = roll(validPool);
      triggerNotice(`🎲 Aligned Aspiration: Rolled "${chosen}" (matches current career)!`);
      return { ...sim, asp: chosen };
    }));
  };

  const handleRerollAspiration = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      
      let pool = db.aspirationsAdult;
      if (sim.stage === "Child") pool = db.aspirationsChild;
      else if (sim.stage === "Teen") pool = [...db.aspirationsTeen, ...db.aspirationsAdult];
      
      if (ruleOrientation === 'inverted') {
        const newAsp = roll(pool);
        const matchingCareer = getMatchingCareerForAspiration(newAsp);
        const newCareer = matchingCareer || sim.career;
        if (matchingCareer) {
          triggerNotice(`🔄 Inverted Mode: Rolled "${newAsp}" ➔ Auto-aligned career!`);
        } else {
          triggerNotice(`🔄 Rolled aspiration: "${newAsp}"`);
        }
        return { ...sim, asp: newAsp, career: newCareer };
      } else {
        const validPool = getCompatibleAspirationsForCareer(sim.career, pool);
        const newAsp = roll(validPool);
        triggerNotice(`🔄 Rolled compatible aspiration: "${newAsp}"`);
        return { ...sim, asp: newAsp };
      }
    }));
  };

  const handleRerollHobby = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id) return sim;
      let pool = db.adultSkills;
      if (sim.stage === "Toddler") pool = db.toddlerSkills;
      else if (sim.stage === "Child") pool = db.childSkills;
      
      return { ...sim, hobby: roll(pool) };
    }));
  };

  const handleRerollCareer = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.isPet || sim.career === "N/A") return sim;
      if (ruleOrientation === 'inverted') {
        const matching = getMatchingCareerForAspiration(sim.asp);
        if (matching) {
          triggerNotice(`🔒 Career is locked to "${sim.asp}" aspiration under Inverted Mode!`);
          return sim;
        }
      }
      let newCareer = sim.stage === "Teen"
        ? roll(["<strong>Part-Time:</strong> Fast Food", "<strong>Part-Time:</strong> Barista", "<strong>Part-Time:</strong> Retail", "<strong>Student:</strong> High School", "<strong>Part-Time:</strong> Young Noble"])
        : roll(db.allCareers);
      triggerNotice(`💼 Rerolled career for Sim ${id}!`);
      return { ...sim, career: newCareer };
    }));
  };

  const handleUpdateChildSkill = (id: number, skillName: "Creativity" | "Mental" | "Motor" | "Social", level: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.stage !== "Child") return sim;
      const current = sim.childSkills || { Creativity: 1, Mental: 1, Motor: 1, Social: 1 };
      const clampedLevel = Math.max(1, Math.min(10, level));
      const updatedSkills = { ...current, [skillName]: clampedLevel };
      const unlocked = getUnlockedAdultSkills(updatedSkills);
      return {
        ...sim,
        childSkills: updatedSkills,
        unlockedAdultSkills: unlocked
      };
    }));
  };

  const handleRerollChildSkills = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.stage !== "Child") return sim;
      const updatedSkills = generateChildMultiSkills(sim.hobby);
      const unlocked = getUnlockedAdultSkills(updatedSkills);
      return {
        ...sim,
        childSkills: updatedSkills,
        unlockedAdultSkills: unlocked
      };
    }));
    triggerNotice(`🎲 Re-rolled all 4 child multi-skills for Sim ${id}!`);
  };

  const handleMaxChildSkills = (id: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.stage !== "Child") return sim;
      const updatedSkills = { Creativity: 10, Mental: 10, Motor: 10, Social: 10 };
      const unlocked = getUnlockedAdultSkills(updatedSkills);
      return {
        ...sim,
        childSkills: updatedSkills,
        unlockedAdultSkills: unlocked
      };
    }));
    triggerNotice(`⭐ Multi-Skill Mastery! All 4 child multi-skills set to Level 10 for Sim ${id}. Unlocked adult skills: Piano, Violin, Logic, Video Gaming, Fishing, Fitness, Charisma, Mischief!`);
  };

  const handleOpenChildAspirationModal = (sim: Sim | null = null) => {
    setChildAspirationModalSim(sim);
    setIsChildAspirationModalOpen(true);
  };

  const handleSelectChildAspiration = (simId: number, aspirationName: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== simId) return sim;
      return { ...sim, asp: aspirationName };
    }));
    triggerNotice(`🎯 Assigned child aspiration "${aspirationName}" to Sim ${simId}!`);
  };

  const handleGrantRewardTrait = (simId: number, traitName: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== simId) return sim;
      if (sim.traits.includes(traitName)) return sim;
      return { ...sim, traits: [...sim.traits, traitName] };
    }));
    triggerNotice(`🏆 Granted reward trait "${traitName}" to Sim ${simId}!`);
  };

  const handleOpenSkillsGuide = (sim: Sim | null = null) => {
    setSkillsGuideModalSim(sim);
    setIsSkillsGuideModalOpen(true);
  };

  const handleApplySkillToSim = (simId: number, skillName: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== simId) return sim;
      return { ...sim, hobby: skillName };
    }));
    triggerNotice(`⚡ Set "${skillName}" as hobby/primary skill for Sim ${simId}!`);
  };

  const handleApplyToddlerAgingBonus = (simId: number, bonusTrait: string) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== simId) return sim;
      if (sim.traits.includes(bonusTrait)) return sim;
      return { ...sim, traits: [...sim.traits, bonusTrait] };
    }));
    triggerNotice(`🌟 Granted toddler aging reward trait "${bonusTrait}" to Sim ${simId}!`);
  };

  const handleUpdateToddlerSkill = (id: number, skillName: keyof ToddlerSkills, level: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || sim.stage !== "Toddler") return sim;
      const current = sim.toddlerSkills || { Communication: 2, Imagination: 2, Movement: 2, Potty: 1, Thinking: 2 };
      const maxLvl = skillName === "Potty" ? 3 : 5;
      const clampedLevel = Math.max(1, Math.min(maxLvl, level));
      return {
        ...sim,
        toddlerSkills: { ...current, [skillName]: clampedLevel }
      };
    }));
  };

  const handleUpdateHorseSkill = (id: number, skillName: keyof HorseSkills, level: number) => {
    setHousehold(prev => prev.map(sim => {
      if (sim.id !== id || !sim.isPet || sim.species !== "Horse") return sim;
      const current = sim.horseSkills || { Agility: 3, Endurance: 3, Jumping: 3, Temperament: 3 };
      const clampedLevel = Math.max(1, Math.min(10, level));
      return {
        ...sim,
        horseSkills: { ...current, [skillName]: clampedLevel }
      };
    }));
  };

  const handleRerollLot = () => {
    const isRentalRequired = doesRollRequireResidentialRental(currentLegacyRoll);
    const newLot = generateLot(null, null, isRentalRequired ? 'Residential Rental' : null, isRentalRequired);
    setLot(newLot);
    triggerNotice(`📍 Generated ${newLot.world} (${newLot.neighborhood}) — ${newLot.dwellingType}!`);
  };

  const handleRerollDwelling = () => {
    const isRentalRequired = doesRollRequireResidentialRental(currentLegacyRoll);
    const rolled = rollDwellingType(lot.world, lot.neighborhood, isRentalRequired);
    const details = getDwellingDetails(rolled.type, rolled.tier);
    setLot(prev => {
      const isRental = rolled.type === 'Residential Rental';
      const rentalConfig = isRental 
        ? (prev.rentalConfig || generateResidentialRentalConfig(undefined, true)) 
        : undefined;
      const { rentalConfig: prevConfig, ...rest } = prev;
      return {
        ...rest,
        dwellingType: rolled.type,
        tinyHomeTier: rolled.tier,
        dwellingDescription: details.description,
        dwellingPerks: details.perks,
        ...(isRental ? { rentalConfig } : {})
      };
    });
    triggerNotice(`🏠 Rerolled dwelling: ${rolled.type}${rolled.tier ? ` (${rolled.tier})` : ''}!`);
  };

  const handleUpdateDwellingType = (newType: DwellingType) => {
    let tier: TinyHomeTier | undefined = undefined;
    if (newType === 'Tiny Home') {
      tier = 'Tier 2: Tiny Home (Max 64 tiles)';
    }
    const details = getDwellingDetails(newType, tier);
    setLot(prev => {
      const rentalConfig = newType === 'Residential Rental'
        ? (prev.rentalConfig || generateResidentialRentalConfig(undefined, true))
        : undefined;
      const { rentalConfig: prevConfig, ...rest } = prev;
      const sanitizedChallenges = filterChallengesForDwelling(prev.lotChallenges, newType);
      return {
        ...rest,
        dwellingType: newType,
        tinyHomeTier: tier,
        dwellingDescription: details.description,
        dwellingPerks: details.perks,
        lotChallenges: sanitizedChallenges,
        ...(rentalConfig ? { rentalConfig } : {})
      };
    });
    triggerNotice(`🏠 Dwelling set to "${newType}"!`);
  };

  const handleUpdateRentalConfig = (config: ResidentialRentalConfig, notice?: string) => {
    setLot(prev => ({
      ...prev,
      rentalConfig: config
    }));
    if (notice) {
      triggerNotice(notice);
    }
  };

  const handleUpdateTinyTier = (tier: TinyHomeTier) => {
    const details = getDwellingDetails('Tiny Home', tier);
    setLot(prev => ({
      ...prev,
      tinyHomeTier: tier,
      dwellingDescription: details.description,
      dwellingPerks: details.perks
    }));
    triggerNotice(`📐 Tiny Home Tier updated to "${tier}"!`);
  };

  const handleUpdateSubNeighborhood = (newNeighborhood: string) => {
    const aptApplicable = isApartmentApplicable(lot.world, newNeighborhood);
    let dwellingType = lot.dwellingType;
    let tier = lot.tinyHomeTier;
    if ((dwellingType === 'Apartment' || dwellingType === 'Penthouse') && !aptApplicable) {
      dwellingType = 'Standard Residential';
      tier = undefined;
    }
    const details = getDwellingDetails(dwellingType, tier);
    setLot(prev => ({
      ...prev,
      neighborhood: newNeighborhood,
      dwellingType,
      tinyHomeTier: tier,
      dwellingDescription: details.description,
      dwellingPerks: details.perks,
      isApartmentApplicable: aptApplicable
    }));
    triggerNotice(`🏙️ Sub-neighborhood set to "${newNeighborhood}" (${lot.world})!`);
  };

  const handleUpdateWorld = (newWorld: string) => {
    const isRentalRequired = doesRollRequireResidentialRental(currentLegacyRoll);
    const newLot = generateLot(newWorld, null, isRentalRequired ? 'Residential Rental' : null, isRentalRequired);
    setLot(newLot);
    triggerNotice(`📍 Changed world to "${newWorld}" (${newLot.neighborhood})!`);
  };

  const handleRerollAllTraits = () => {
    const count = lot.lotTraits.length > 0 ? lot.lotTraits.length : undefined;
    const newTraits = rollLotTraits(count);
    setLot(prev => ({ ...prev, lotTraits: newTraits }));
    triggerNotice(`✨ Rolled ${newTraits.length} Lot Traits: ${newTraits.join(', ') || 'None'}`);
  };

  const handleRerollSingleTrait = (index: number) => {
    const updated = rerollSingleLotTrait(lot.lotTraits, index);
    setLot(prev => ({ ...prev, lotTraits: updated }));
    triggerNotice(`✨ Re-rolled Trait: Now "${updated[index]}"!`);
  };

  const handleAddLotTrait = () => {
    if (lot.lotTraits.length >= 3) {
      triggerNotice("⚠️ Maximum of 3 Lot Traits allowed in The Sims 4!");
      return;
    }
    const updated = addLotTrait(lot.lotTraits);
    setLot(prev => ({ ...prev, lotTraits: updated }));
    triggerNotice(`✨ Added Lot Trait: "${updated[updated.length - 1]}"!`);
  };

  const handleRemoveLotTrait = (trait: string) => {
    const updated = lot.lotTraits.filter(t => t !== trait);
    setLot(prev => ({ ...prev, lotTraits: updated }));
    triggerNotice(`Removed Lot Trait "${trait}".`);
  };

  const handleClearLotTraits = () => {
    setLot(prev => ({ ...prev, lotTraits: [] }));
    triggerNotice(`Cleared all Lot Traits.`);
  };

  const handleRerollAllChallenges = () => {
    const newChallenges = rollLotChallenges(lot.dwellingType);
    setLot(prev => ({ ...prev, lotChallenges: newChallenges }));
    triggerNotice(`⚠️ Rolled ${newChallenges.length} Lot Challenges: ${newChallenges.join(', ') || 'None'}`);
  };

  const handleRerollSingleChallenge = (index: number) => {
    const updated = rerollSingleLotChallenge(lot.lotChallenges, index, lot.dwellingType);
    setLot(prev => ({ ...prev, lotChallenges: updated }));
    triggerNotice(`⚠️ Re-rolled Challenge: Now "${updated[index]}"!`);
  };

  const handleAddLotChallenge = () => {
    const updated = addLotChallenge(lot.lotChallenges, lot.dwellingType);
    setLot(prev => ({ ...prev, lotChallenges: updated }));
    triggerNotice(`⚠️ Added Lot Challenge: "${updated[updated.length - 1]}"!`);
  };

  const handleRemoveLotChallenge = (challenge: string) => {
    const updated = lot.lotChallenges.filter(c => c !== challenge);
    setLot(prev => ({ ...prev, lotChallenges: updated }));
    triggerNotice(`Removed Lot Challenge "${challenge}".`);
  };

  const handleClearLotChallenges = () => {
    setLot(prev => ({ ...prev, lotChallenges: [] }));
    triggerNotice(`Cleared all Lot Challenges.`);
  };

  const handleUpdatePartnerStatus = (id: number, status: 'Married' | 'Engaged' | 'Dating' | 'Domestic Partner' | 'WooHoo Partner' | 'Divorced / Co-parent') => {
    setHousehold(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const newSim = { ...s, partnerStatus: status };
        let relKey = "Spouse";
        let badgeTag = `💍 Spouse (${status})`;
        if (status === "Married") {
          relKey = "Spouse";
          badgeTag = "💍 Spouse (Married)";
        } else if (status === "Engaged") {
          relKey = "Engaged";
          badgeTag = "💎 Fiancé / Fiancée (Engaged)";
        } else if (status === "Dating") {
          relKey = "Partner";
          badgeTag = "❤️ Romantic Partner (Dating)";
        } else if (status === "Domestic Partner") {
          relKey = "Partner";
          badgeTag = "🏡 Domestic Partner (Cohabiting)";
        } else if (status === "WooHoo Partner") {
          relKey = "WooHoo Partner";
          badgeTag = "🔥 WooHoo Partner (Friends with Benefits)";
        } else if (status === "Divorced / Co-parent") {
          relKey = "Not Related";
          badgeTag = "💔 Co-parent / Ex-Partner";
        }
        newSim.branchName = badgeTag;
        newSim.baseRel = relKey;

        const heirSim = prev.find(h => h.id !== id && (h.familyUnitRole === "Heir" || h.familyUnitRole === "Founder" || h.id === 1));
        if (heirSim) {
          newSim.customRelations = { ...(newSim.customRelations || {}), [heirSim.id]: relKey };
        }
        return newSim;
      });

      const heirSim = updated.find(h => h.familyUnitRole === "Heir" || h.familyUnitRole === "Founder" || h.id === 1);
      const targetSim = updated.find(s => s.id === id);
      if (heirSim && targetSim) {
        let inv = targetSim.baseRel || "Spouse";
        heirSim.customRelations = { ...(heirSim.customRelations || {}), [id]: inv };
      }
      calculateRelations(updated, relationMode);
      return updated;
    });
    triggerNotice(`💍 Partner status set to "${status}"!`);
  };

  const handleUpdateHelperType = (id: number, helperType: 'Roommate' | 'Brother' | 'Sister' | 'Uncle' | 'Aunt' | 'Cousin' | 'Grandparent' | 'Royal Retainer') => {
    setHousehold(prev => {
      const heirSim = prev.find(h => h.id !== id && (h.familyUnitRole === "Heir" || h.familyUnitRole === "Founder" || h.id === 1));
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const newSim = { ...s, helperType };
        let relKey = "Not Related";
        let badge = `🤝 Helper Sim (${helperType})`;

        switch (helperType) {
          case "Roommate":
            relKey = "Not Related";
            badge = "🤝 Live-in Helper (Roommate)";
            break;
          case "Royal Retainer":
            relKey = "Not Related";
            badge = "🏰 Royal Retainer / Butler";
            break;
          case "Brother":
            relKey = "Sibling";
            badge = "👑 Royal Family Helper (Brother)";
            break;
          case "Sister":
            relKey = "Sibling";
            badge = "👑 Royal Family Helper (Sister)";
            break;
          case "Uncle":
            relKey = "Aunt/Uncle";
            badge = "👑 Royal Family Helper (Uncle / Regent)";
            break;
          case "Aunt":
            relKey = "Aunt/Uncle";
            badge = "👑 Royal Family Helper (Aunt / Regent)";
            break;
          case "Cousin":
            relKey = "Cousin";
            badge = "👑 Royal Family Helper (Cousin / Noble Kin)";
            break;
          case "Grandparent":
            relKey = "Grandparent";
            badge = "👑 Royal Family Helper (Grandparent)";
            break;
        }

        newSim.branchName = badge;
        newSim.baseRel = relKey;
        if (heirSim) {
          newSim.customRelations = { ...(newSim.customRelations || {}), [heirSim.id]: relKey };
        }
        return newSim;
      });

      if (heirSim) {
        const helperSim = updated.find(s => s.id === id);
        if (helperSim && helperSim.baseRel) {
          let invRel = helperSim.baseRel;
          if (invRel === "Aunt/Uncle") invRel = "Niece/Nephew";
          else if (invRel === "Grandparent") invRel = "Grandchild";
          heirSim.customRelations = { ...(heirSim.customRelations || {}), [id]: invRel };
        }
      }
      calculateRelations(updated, relationMode);
      return updated;
    });
    triggerNotice(`👑 Helper archetype set to Option 3: "${helperType}"!`);
  };

  const handleMoveOutSpare = (id: number) => {
    const target = household.find(s => s.id === id);
    if (!target) return;

    const heir = household.find(h => h.familyUnitRole === "Heir" || h.familyUnitRole === "Founder" || h.id === 1);
    let kinDescription = "Royal Kin / Spare";
    if (heir && target.pairwiseRelations?.[heir.id]) {
      const relRaw = target.pairwiseRelations[heir.id].rawRel;
      if (relRaw === "Sibling") kinDescription = "Sibling of Heir (Royal Spare)";
      else if (relRaw === "Cousin") kinDescription = "Cousin of Heir (Noble Branch)";
      else if (relRaw === "Aunt/Uncle") kinDescription = "Uncle/Aunt of Heir (Former Regent)";
      else if (relRaw === "Child") kinDescription = "Non-Heir Offspring (Spare)";
      else if (target.baseRel === "Sibling") kinDescription = "Sibling of Heir";
      else kinDescription = target.branchName || "Extended Family Kin";
    }

    const spareToArchive: Sim = {
      ...target,
      isMovedOutSpare: true,
      movedOutTo: lot.world ? `Other Households (${lot.world})` : "Other Households (Sims 4 World)",
      movedOutRelationToHeir: kinDescription
    };

    setMovedOutSpares(prev => [...prev.filter(s => s.id !== id), spareToArchive]);
    setHousehold(prev => {
      const nextHousehold = prev.filter(s => s.id !== id);
      calculateRelations(nextHousehold, relationMode);
      return nextHousehold;
    });

    triggerNotice(`📦 Sim ${target.id} (${kinDescription}) moved out to ${spareToArchive.movedOutTo}! Household slot freed for legacy continuation.`);
  };

  const handleMoveSpareBack = (id: number) => {
    if (household.length >= maxHouseholdCapacity) {
      triggerNotice(`⚠️ Household is full (${household.length}/${maxHouseholdCapacity} Sims). Free a slot before moving Sim back!`);
      return;
    }
    const spare = movedOutSpares.find(s => s.id === id);
    if (!spare) return;

    const restoredSim: Sim = {
      ...spare,
      isMovedOutSpare: false
    };

    setMovedOutSpares(prev => prev.filter(s => s.id !== id));
    setHousehold(prev => {
      const nextHousehold = [...prev, restoredSim];
      calculateRelations(nextHousehold, relationMode);
      return nextHousehold;
    });

    triggerNotice(`🏰 Sim ${spare.id} (${spare.movedOutRelationToHeir || 'Kin'}) moved BACK into the Royal Castle household!`);
  };

  const handleAssignSpareAsHelper = (id: number) => {
    if (household.length >= maxHouseholdCapacity) {
      triggerNotice(`⚠️ Household is full (${household.length}/${maxHouseholdCapacity} Sims). Free a slot before moving Sim back!`);
      return;
    }
    const spare = movedOutSpares.find(s => s.id === id);
    if (!spare) return;

    const isSibling = spare.movedOutRelationToHeir?.toLowerCase().includes("sibling");
    const isCousin = spare.movedOutRelationToHeir?.toLowerCase().includes("cousin");
    const helperType = isSibling ? (spare.baseGender === "Female" ? "Sister" : "Brother") : isCousin ? "Cousin" : "Uncle";

    const restoredSim: Sim = {
      ...spare,
      isMovedOutSpare: false,
      familyUnitRole: "Helper",
      helperType: helperType as any,
      branchName: `👑 Royal Family Helper (${helperType} • Generation Helper)`,
      branchBadge: "bg-teal-500/20 text-teal-300 border-teal-500/40"
    };

    setMovedOutSpares(prev => prev.filter(s => s.id !== id));
    setHousehold(prev => {
      const nextHousehold = [...prev, restoredSim];
      calculateRelations(nextHousehold, relationMode);
      return nextHousehold;
    });

    triggerNotice(`👑 Sim ${spare.id} moved back into the household as the official Generation Helper (${helperType})!`);
  };

  const handleDeleteSpareFromLedger = (id: number) => {
    setMovedOutSpares(prev => prev.filter(s => s.id !== id));
    triggerNotice(`Removed Sim ${id} from the Moved-Out Spares Ledger.`);
  };

  const handleApplyLegacyHousehold = (newHousehold: Sim[], updatedLot: Lot, notice: string) => {
    setHousehold(newHousehold);
    setLot(updatedLot);
    triggerNotice(notice);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-5">
      <div className="max-w-[1250px] mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b-2 border-slate-700">
          <div>
            <h1 className="text-sky-400 uppercase tracking-[3px] text-2xl sm:text-3xl font-black flex items-center gap-2 flex-wrap">
              <span>Simology Manager</span>
              <button
                onClick={() => setIsVersionModalOpen(true)}
                className="text-amber-300 font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="View v1.0+ Overhaul & Version History Ledger"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold">{APP_VERSION}</span>
                <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-normal bg-black/40 px-1 py-0.2 rounded">
                  Overhaul Log 📜
                </span>
              </button>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete Sims 4 Simology & Random Legacy Challenge Engine (PieceOfPrincess Ruleset)
            </p>
          </div>

          {/* Guide Quick Access & Version Updates */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 border border-amber-400/40 cursor-pointer"
              onClick={() => setIsVersionModalOpen(true)}
              title="Browse v1.0 Overhauls & Changelog"
            >
              <span>🚀</span>
              <span>v1.0 Overhaul</span>
            </button>
            <button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 border border-emerald-400/40"
              onClick={() => handleOpenSkillsGuide(null)}
              title="Browse complete Sims 4 Skills Guide"
            >
              <span>🎓</span>
              <span>Skills Guide</span>
            </button>
            <button
              className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 border border-sky-400/40"
              onClick={() => handleOpenChildAspirationModal(null)}
              title="Browse all 8 categorized Child Aspirations"
            >
              <span>🧒</span>
              <span>Child Aspirations</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Banner */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-slate-950 p-1.5 rounded-2xl border border-slate-700/80 shadow-xl gap-1">
            <button
              onClick={() => setActiveMode('legacy')}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeMode === 'legacy'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 shadow-lg scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>👑</span>
              <span>Random Legacy Challenge Mode</span>
              <span className="bg-black/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                5 Main Rolls
              </span>
            </button>
            <button
              onClick={() => setActiveMode('sandbox')}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeMode === 'sandbox'
                  ? 'bg-sky-500 text-slate-950 shadow-lg scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>👥</span>
              <span>Freeform Household Builder</span>
              <span className="bg-black/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                1–8 Sims
              </span>
            </button>
          </div>
        </div>

        {/* Main Mode View */}
        {activeMode === 'legacy' ? (
          <RandomLegacyChallenge
            currentLot={lot}
            currentHousehold={household}
            ruleOrientation={ruleOrientation}
            onToggleRuleOrientation={handleToggleRuleOrientation}
            onApplyToHousehold={handleApplyLegacyHousehold}
            onTriggerNotice={triggerNotice}
            onRestoreHouseholdAndLot={(restoredHousehold, restoredLot) => {
              setHousehold(restoredHousehold);
              if (restoredLot) setLot(restoredLot);
              triggerNotice("💾 Restored live household & lot from external backup!");
            }}
            onMemorizeGeneration={handleMemorizeGeneration}
            onRollChange={(roll) => setCurrentLegacyRoll(roll)}
            onChooseRandomHeir={handleChooseRandomHeir}
            onRollCompleteNewSim={handleRollCompleteNewSim}
          />
        ) : (
          <ControlPanel
            onAddHuman={handleAddHuman}
            onAddPet={handleAddPet}
            onGenerate={handleGenerate}
            onMemorize={handleMemorize}
            relationMode={relationMode}
            onRelationModeChange={(mode) => {
              setRelationMode(mode);
              if (household.length > 0) {
                const updatedHousehold = household.map(s => ({ ...s }));
                calculateRelations(updatedHousehold, mode);
                setHousehold(updatedHousehold);
              }
            }}
            onOpenChildAspirationsGuide={() => handleOpenChildAspirationModal(null)}
            onOpenSkillsGuide={() => handleOpenSkillsGuide(null)}
            chainRollProbabilityInput={chainRollProbabilityInput}
            chainRollProbability={chainRollProbability}
            onChainRollProbabilityChange={(inputVal, numericVal) => {
              setChainRollProbabilityInput(inputVal);
              setChainRollProbability(numericVal);
            }}
            chainRollCap={chainRollCap}
            onChainRollCapChange={setChainRollCap}
          />
        )}

        <LotDisplay 
          lot={lot}
          isLockedByRandomFun={currentLegacyRoll?.fun?.entry?.id === 1}
          onRerollLot={handleRerollLot}
          onRerollDwelling={handleRerollDwelling}
          onUpdateDwellingType={handleUpdateDwellingType}
          onUpdateTinyTier={handleUpdateTinyTier}
          onUpdateSubNeighborhood={handleUpdateSubNeighborhood}
          onUpdateWorld={handleUpdateWorld}
          onUpdateRentalConfig={handleUpdateRentalConfig}
          onRerollAllTraits={handleRerollAllTraits}
          onRerollSingleTrait={handleRerollSingleTrait}
          onAddTrait={handleAddLotTrait}
          onRemoveTrait={handleRemoveLotTrait}
          onClearTraits={handleClearLotTraits}
          onRerollAllChallenges={handleRerollAllChallenges}
          onRerollSingleChallenge={handleRerollSingleChallenge}
          onAddChallenge={handleAddLotChallenge}
          onRemoveChallenge={handleRemoveLotChallenge}
          onClearChallenges={handleClearLotChallenges}
        />

        {rollNotice && (
          <div className="bg-sky-950/90 border border-sky-400 text-sky-100 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-between shadow-lg">
            <span className="font-medium flex items-center gap-2">{rollNotice}</span>
            <button
              onClick={() => setRollNotice(null)}
              className="text-sky-300 font-bold ml-3 hover:text-white text-base"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Household Structure & Co-Living Overview Banner */}
        {household.length > 0 && (() => {
          const summary = getHouseholdStructureSummary(household);
          return (
            <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl mb-6 shadow-xl">
              <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🏡</span>
                  <div>
                    <div className="text-base font-extrabold text-sky-400 uppercase tracking-wide flex items-center gap-2">
                      <span>Household Co-Living & Family Tree Overview</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                        {household.length} Total {household.length === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      Co-living Type: <span className="text-amber-300 font-bold">{summary.householdType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-750 text-xs shadow-inner">
                    <span className="text-slate-400 font-semibold">Max Sims:</span>
                    <select
                      className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded border border-slate-700 text-xs cursor-pointer focus:outline-none focus:border-amber-400"
                      value={maxHouseholdCapacity}
                      onChange={(e) => {
                        const cap = Number(e.target.value);
                        setMaxHouseholdCapacity(cap);
                        triggerNotice(`⚙️ Max Household Capacity set to ${cap} Sims ${cap > 8 ? '(Multi-Max / MCCC Mod)' : '(Sims 4 Standard)'}`);
                      }}
                      title="Set household size cap (8 for standard Sims 4, or up to 20 for MCCC multi-max mods)"
                    >
                      <option value={8}>8 Sims (Vanilla TS4)</option>
                      <option value={10}>10 Sims</option>
                      <option value={12}>12 Sims</option>
                      <option value={16}>16 Sims</option>
                      <option value={20}>20 Sims (MCCC Mod)</option>
                    </select>
                  </div>

                  <button
                    className="bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 shadow cursor-pointer"
                    onClick={() => {
                      const updated = household.map(s => ({ ...s }));
                      calculateRelations(updated, relationMode);
                      setHousehold(updated);
                      triggerNotice(`🔄 Recalculated Co-Living & Family Units (${relationMode} mode)!`);
                    }}
                    title="Recalculate and re-roll household family units and roommate assignments for current Sims"
                  >
                    <span>🔄</span>
                    <span>Re-roll Co-Living Structure</span>
                  </button>

                  <button
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    onClick={() => handleRollCompleteNewSim('partner')}
                    title="Completely roll and add a new Spouse / Partner (with newly rolled C2 career and romantic dynamic) for remarriage or post-divorce replacement"
                  >
                    <span>💍</span>
                    <span>Roll New Partner</span>
                  </button>

                  <button
                    className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    onClick={() => handleRollCompleteNewSim('general')}
                    title="Completely roll and add a brand-new Sim from scratch (stage, traits, aspiration, CAS gender, career) in case of divorce or moving someone away"
                  >
                    <span>🎲</span>
                    <span>Roll New Sim (From Scratch)</span>
                  </button>
                </div>
              </div>

              {/* Units Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
                {summary.units.map((unit, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${unit.badge}`}>
                        {unit.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {unit.sims.length} {unit.sims.length === 1 ? 'Sim' : 'Sims'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {unit.sims.map(sim => (
                        <div key={sim.id} className="text-xs flex items-center justify-between gap-1 text-slate-200">
                          <span className="font-semibold text-sky-200">
                            Sim {sim.id}:
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            {sim.isPet ? `${sim.stage} ${sim.species}` : `${sim.stage} (${sim.baseGender})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-5">
          {household.map(sim => (
            <SimCard
              key={sim.id}
              sim={sim}
              household={household}
              isLegacyMode={activeMode === 'legacy'}
              onToggleGhost={handleToggleGhost}
              onUpdateDeath={handleUpdateDeath}
              onRerollOccult={handleRerollOccult}
              onOccultChange={handleOccultChange}
              onRemoveSim={handleRemoveSim}
              onAgeUp={handleAgeUp}
              onUpdateStage={handleUpdateStage}
              onRerollSim={handleRerollSim}
              onAddTrait={handleAddTrait}
              onRemoveTrait={handleRemoveTrait}
              onUpdateTrait={handleUpdateTrait}
              onRerollSingleTraitSlot={handleRerollSingleTraitSlot}
              onInject={handleInject}
              ruleOrientation={ruleOrientation}
              onToggleRuleOrientation={handleToggleRuleOrientation}
              onSelectAdultAspiration={handleSelectAdultAspiration}
              onInvertAlignCareer={handleInvertAlignCareer}
              onAlignAspirationToCareer={handleAlignAspirationToCareer}
              onRerollAspiration={handleRerollAspiration}
              onRerollHobby={handleRerollHobby}
              onRerollCareer={handleRerollCareer}
              onUpdateBaseRel={handleUpdateBaseRel}
              onRerollRelation={handleRerollRelation}
              onUpdatePairRelation={handleUpdatePairRelation}
              onRerollPairRelation={handleRerollPairRelation}
              onUpdateLinkedSim={handleUpdateLinkedSim}
              onRollImaginaryFriend={handleRollImaginaryFriend}
              onAttachImaginaryFriend={handleForceAttachImaginaryFriend}
              onUpdateChildSkill={handleUpdateChildSkill}
              onRerollChildSkills={handleRerollChildSkills}
              onMaxChildSkills={handleMaxChildSkills}
              onUpdateToddlerSkill={handleUpdateToddlerSkill}
              onUpdateHorseSkill={handleUpdateHorseSkill}
              onUpdateBaseGender={handleUpdateBaseGender}
              onUpdateCustomGender={handleUpdateCustomGender}
              onUpdatePairDynamic={handleUpdatePairDynamic}
              onUpdateSimDynamic={handleUpdateSimDynamic}
              onOpenChildAspirationModal={handleOpenChildAspirationModal}
              onSelectChildAspiration={handleSelectChildAspiration}
              onOpenSkillsGuide={handleOpenSkillsGuide}
              onSetNextHeir={handleSetNextHeir}
              onPutPetUpForAdoption={handlePutPetUpForAdoption}
              onMakeImaginaryFriendReal={handleMakeImaginaryFriendReal}
              onKeepImaginaryFriendAsDoll={handleKeepImaginaryFriendAsDoll}
              onChooseRandomHeir={handleChooseRandomHeir}
              onUpdatePartnerStatus={handleUpdatePartnerStatus}
              onUpdateHelperType={handleUpdateHelperType}
              onMoveOutSpare={handleMoveOutSpare}
              isLockedByRandomFun={currentLegacyRoll?.fun?.entry?.id === 1}
            />
          ))}
        </div>

        {/* Royal Kin & Moved-Out Spares Ledger (Manage Households) */}
        <div className="mt-8 bg-slate-950/80 border border-slate-700/80 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-850">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏰</span>
              <div>
                <h3 className="text-base font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  <span>Royal Kin & Moved-Out Spares Ledger</span>
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    {movedOutSpares.length} {movedOutSpares.length === 1 ? 'Relative' : 'Relatives'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official Sims 4 Manage Households system: non-heir adult children, cousins, and former regents can be moved out to free castle slots and moved back in anytime!
                </p>
              </div>
            </div>

            <span className="text-[11px] bg-slate-900 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-mono">
              Castle Lot Slots: {household.length}/{maxHouseholdCapacity} Sims
            </span>
          </div>

          {movedOutSpares.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs italic">
              No spares or relatives moved out yet. When non-heir siblings, cousins, or elders grow up, use the <strong className="text-indigo-300">"Move Out Spare (Manage Households)"</strong> button on their card to free up slots for babies and spouses without losing their lore!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {movedOutSpares.map(spare => (
                <div
                  key={spare.id}
                  className="bg-slate-900/90 border border-slate-850 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-800">
                      <span className="font-bold text-sky-200 text-sm">
                        Sim {spare.id} ({spare.stage})
                      </span>
                      <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded border border-amber-900/60 font-semibold">
                        {spare.movedOutRelationToHeir || 'Royal Kin'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300 mb-3">
                      <div>
                        <span className="text-slate-400">Residing in:</span> <span className="text-slate-100 font-semibold">{spare.movedOutTo || 'Other Households'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Career:</span> <span className="text-amber-200" dangerouslySetInnerHTML={{ __html: spare.career }} />
                      </div>
                      <div>
                        <span className="text-slate-400">Aspiration:</span> <span className="text-sky-300 font-medium">{spare.asp}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {spare.traits.map(t => (
                          <span key={t} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Move Back In, Assign as Helper, Remove */}
                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleMoveSpareBack(spare.id)}
                      disabled={household.length >= maxHouseholdCapacity}
                      className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1 shadow cursor-pointer"
                      title="Move this Sim back into the active Castle household using Manage Households"
                    >
                      <span>📥</span>
                      <span>Move Back In</span>
                    </button>

                    <button
                      onClick={() => handleAssignSpareAsHelper(spare.id)}
                      disabled={household.length >= maxHouseholdCapacity}
                      className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-2 py-1 rounded transition-all flex items-center gap-1 shadow cursor-pointer"
                      title="Option 3: Move back into the household as the official Generation Helper (Uncle / Sibling / Cousin)!"
                    >
                      <span>👑</span>
                      <span>As Gen Helper</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSpareFromLedger(spare.id)}
                      className="text-red-400 hover:text-red-200 text-xs px-1.5 py-1 cursor-pointer"
                      title="Delete permanently from ledger"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <QuickRollers
          onLog={(text) => console.log(text)}
          onUpdateLastRolled={handleUpdateLastRolled}
        />

        <MemoryBank
          memories={memories}
          onLoad={handleLoadMemory}
          onImport={handleImport}
        />

        <ChildAspirationModal
          isOpen={isChildAspirationModalOpen}
          onClose={() => {
            setIsChildAspirationModalOpen(false);
            setChildAspirationModalSim(null);
          }}
          currentSim={childAspirationModalSim}
          onSelectAspiration={handleSelectChildAspiration}
          onGrantRewardTrait={handleGrantRewardTrait}
        />

        <SkillsGuideModal
          isOpen={isSkillsGuideModalOpen}
          onClose={() => {
            setIsSkillsGuideModalOpen(false);
            setSkillsGuideModalSim(null);
          }}
          currentSim={skillsGuideModalSim}
          onApplySkillToSim={handleApplySkillToSim}
          onApplyToddlerAgingBonus={handleApplyToddlerAgingBonus}
        />

        {/* Sticky 5 Rolls Bottom Bar (Visible from bottom so player doesn't scroll back and forth) */}
        {activeMode === 'legacy' && currentLegacyRoll && (
          <StickyRollsBottomBar
            currentRoll={currentLegacyRoll}
            isHeirAdult={isHeirAdult}
            onScrollToRolls={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        <VersionHistoryModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
        />
      </div>
    </div>
  );
}
