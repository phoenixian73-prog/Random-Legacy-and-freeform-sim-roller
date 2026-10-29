import { db, traitData, deathDB, aspReqs, childMultiSkillConfig } from "../data/simData";
import { Sim, Lot, TraitConflict, ChildMultiSkills, ToddlerSkills, HorseSkills, DwellingType, TinyHomeTier, RelationMode } from "../types";

let masterConflicts: Record<string, Set<string>> = {};

export function initConflicts() {
  masterConflicts = {};
  const all = [...traitData.human, ...traitData.pet];
  all.forEach((t) => {
    if (!masterConflicts[t.name]) masterConflicts[t.name] = new Set();
    t.conflicts.forEach((c) => {
      masterConflicts[t.name].add(c);
      if (!masterConflicts[c]) masterConflicts[c] = new Set();
      masterConflicts[c].add(t.name);
    });
  });
}

// Initialize immediately
initConflicts();

export function roll<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateChildMultiSkills(primarySkill?: string): ChildMultiSkills {
  const skills: ChildMultiSkills = {
    Creativity: rNum(1, 5),
    Mental: rNum(1, 5),
    Motor: rNum(1, 5),
    Social: rNum(1, 5)
  };

  // If a primary child hobby is specified, elevate it
  if (primarySkill && primarySkill in skills) {
    (skills as any)[primarySkill] = rNum(4, 8);
  }

  // 15% chance for a child prodigy roll where one skill is maxed (10)
  if (Math.random() < 0.15) {
    const keys: (keyof ChildMultiSkills)[] = ["Creativity", "Mental", "Motor", "Social"];
    const chosen = primarySkill && keys.includes(primarySkill as keyof ChildMultiSkills) 
      ? (primarySkill as keyof ChildMultiSkills) 
      : roll(keys);
    skills[chosen] = 10;
  }

  return skills;
}

export function generateToddlerSkills(primarySkill?: string): ToddlerSkills {
  const skills: ToddlerSkills = {
    Communication: rNum(1, 4),
    Imagination: rNum(1, 4),
    Movement: rNum(1, 4),
    Potty: rNum(1, 3),
    Thinking: rNum(1, 4)
  };

  if (primarySkill && primarySkill in skills) {
    (skills as any)[primarySkill] = primarySkill === "Potty" ? 3 : rNum(3, 5);
  }

  // 10% chance for a superstar toddler with maxed stats
  if (Math.random() < 0.10) {
    skills.Communication = 5;
    skills.Imagination = 5;
    skills.Movement = 5;
    skills.Thinking = 5;
    skills.Potty = 3;
  }

  return skills;
}

export function generateHorseSkills(): HorseSkills {
  return {
    Agility: rNum(1, 6),
    Endurance: rNum(1, 6),
    Jumping: rNum(1, 6),
    Temperament: rNum(1, 6)
  };
}

export function getUnlockedAdultSkills(skills?: ChildMultiSkills): string[] {
  if (!skills) return [];
  const unlocked: string[] = [];
  if (skills.Creativity >= 10) unlocked.push(...childMultiSkillConfig.Creativity.unlockedAdultSkills);
  if (skills.Mental >= 10) unlocked.push(...childMultiSkillConfig.Mental.unlockedAdultSkills);
  if (skills.Motor >= 10) unlocked.push(...childMultiSkillConfig.Motor.unlockedAdultSkills);
  if (skills.Social >= 10) unlocked.push(...childMultiSkillConfig.Social.unlockedAdultSkills);
  return Array.from(new Set(unlocked));
}

function getDegressiveCount(type: 'traits' | 'challenges'): number {
  if (type === 'traits') {
    let r = Math.random();
    if (r < 0.15) return 0;
    if (r < 0.60) return 1;
    if (r < 0.85) return 2;
    return 3;
  } else {
    // Challenges: Flat 50/50 Toggle
    if (Math.random() < 0.5) return 0; // 50% chance OFF

    let count = 1; // 50% chance ON (Starts at 1)
    let max = 15;

    while (count < max) {
      let threshold = 0;
      if (count === 1) threshold = 0.75; // Chance for 2nd
      else if (count === 2) threshold = 0.50; // Chance for 3rd
      else {
        // Decay from 50% down to 1% linearly
        threshold = 0.50 - ((count - 2) * 0.04);
      }
      if (threshold < 0.01) threshold = 0.01;

      if (Math.random() < threshold) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}

export function getValidTrait(pool: string[], currentTraits: string[]): string | null {
  let available = pool.filter((t) => {
    if (currentTraits.includes(t)) return false;
    if (currentTraits.some((ct) => masterConflicts[ct] && masterConflicts[ct].has(t))) return false;
    return true;
  });
  return available.length > 0 ? roll(available) : null;
}

export function getPossiblePairRelations(simA: Sim, simB: Sim, hasSpouse: boolean = false, allowUnrelated: boolean = true): string[] {
  if (simB.isPet) return ["Pet"];
  if (simA.isPet) return ["Owner"];

  if (simB.occult === "Imaginary Friend" && simB.linkedSimId === simA.id) return ["Imaginary Friend"];
  if (simA.occult === "Imaginary Friend" && simA.linkedSimId === simB.id) return ["Creator / Companion"];
  if (simA.occult === "Imaginary Friend" || simB.occult === "Imaginary Friend") return ["Not Related"];

  const idxA = db.stages.indexOf(simA.stage);
  const idxB = db.stages.indexOf(simB.stage);
  const diff = idxB - idxA;

  const possible: string[] = [];

  const isServoA = simA.occult === "Servo";
  const isServoB = simB.occult === "Servo";
  const hasServo = isServoA || isServoB;

  if (!hasServo) {
    // simB older by 2+ stages and simB is YA+
    if (diff >= 2) {
      if (idxB >= 4) possible.push("Parent");
      possible.push("Sibling");
    }
    // simA older by 2+ stages and simA is YA+
    if (diff <= -2) {
      if (idxA >= 4) possible.push("Child");
      possible.push("Sibling");
    }
    // Close age
    if (Math.abs(diff) <= 1) {
      possible.push("Sibling");
    }
  }

  // Allow Spouse/Partner/Engaged/WooHoo Partner for YA+ (index >= 4) AND for Teens (index === 3) if both are Teens
  if ((idxA >= 4 && idxB >= 4) || (idxA === 3 && idxB === 3)) {
    if (!hasSpouse) {
      possible.push("Spouse", "Engaged", "Partner", "WooHoo Partner");
    }
  }

  // Not Related option
  if (allowUnrelated || hasServo) {
    if (!["Infant", "Toddler"].includes(simB.stage)) {
      possible.push("Not Related");
    }
  }

  if (possible.length === 0) {
    possible.push(allowUnrelated ? "Not Related" : "Sibling");
  }

  return possible;
}

export function getPossibleBaseRelations(sim0: Sim, simI: Sim, hasSpouse: boolean = false, allowUnrelated: boolean = true): string[] {
  return getPossiblePairRelations(sim0, simI, hasSpouse, allowUnrelated);
}

// Helper to get raw direct relation between two sims
function getDirectRel(idA: number, idB: number, household: Sim[]): string | null {
  const sA = household.find(s => s.id === idA);
  const sB = household.find(s => s.id === idB);
  if (!sA || !sB) return null;

  if (sA.customRelations && sA.customRelations[idB]) {
    return sA.customRelations[idB];
  }
  if (sB.customRelations && sB.customRelations[idA]) {
    const inv = sB.customRelations[idA];
    if (inv === "Parent") return "Child";
    if (inv === "Child") return "Parent";
    return inv;
  }
  return null;
}

export function getRelation(sA: Sim, sB: Sim, household: Sim[] = []): string {
  if (sA.id === sB.id) return "Self";

  // Check direct custom/manual relation
  const direct = getDirectRel(sA.id, sB.id, household);
  if (direct && direct !== "Not Related") {
    if (sA.customRelations?.[sB.id]) {
      return sA.customRelations[sB.id];
    }
    if (sB.customRelations?.[sA.id]) {
      const inv = sB.customRelations[sA.id];
      if (inv === "Parent") return "Child";
      if (inv === "Child") return "Parent";
      return inv;
    }
  }

  // Pre-gather family trees for all Sims in household
  const parents = (id: number): number[] => {
    return household
      .filter(other => !other.isPet && other.occult !== "Imaginary Friend")
      .filter(other => {
        const r = getDirectRel(other.id, id, household);
        return r === "Parent";
      })
      .map(o => o.id);
  };

  const children = (id: number): number[] => {
    return household
      .filter(other => !other.isPet && other.occult !== "Imaginary Friend")
      .filter(other => {
        const r = getDirectRel(id, other.id, household);
        return r === "Parent";
      })
      .map(o => o.id);
  };

  const spouses = (id: number): number[] => {
    return household
      .filter(other => !other.isPet && other.occult !== "Imaginary Friend")
      .filter(other => {
        const r = getDirectRel(id, other.id, household);
        return r === "Spouse" || r === "Partner" || r === "Engaged" || r === "WooHoo Partner";
      })
      .map(o => o.id);
  };

  const siblings = (id: number): number[] => {
    return household
      .filter(other => !other.isPet && other.occult !== "Imaginary Friend" && other.id !== id)
      .filter(other => {
        const r = getDirectRel(id, other.id, household);
        if (r === "Sibling") return true;
        const p1 = parents(id);
        const p2 = parents(other.id);
        if (p1.length > 0 && p2.length > 0 && p1.some(p => p2.includes(p))) {
          return r !== "Spouse" && r !== "Partner" && r !== "Engaged" && r !== "WooHoo Partner" && r !== "Parent" && r !== "Child";
        }
        return false;
      })
      .map(o => o.id);
  };

  const pA = parents(sA.id);
  const pB = parents(sB.id);
  const cA = children(sA.id);
  const sibA = siblings(sA.id);
  const sibB = siblings(sB.id);
  const spA = spouses(sA.id);

  // 1. Direct Parent / Child
  if (pA.includes(sB.id)) return "Parent";
  if (cA.includes(sB.id)) return "Child";

  // 2. Direct Spouse / Partner / Engaged / WooHoo Partner
  if (spA.includes(sB.id)) {
    const spRel = getDirectRel(sA.id, sB.id, household);
    if (spRel === "Engaged") return "Engaged";
    if (spRel === "Partner") return "Partner";
    if (spRel === "WooHoo Partner") return "WooHoo Partner";
    return "Spouse";
  }

  // 3. Sibling
  if (sibA.includes(sB.id)) return "Sibling";

  // 4. Grandparent: sB is a parent of one of sA's parents
  if (pA.some(parentOfA => parents(parentOfA).includes(sB.id))) {
    return "Grandparent";
  }

  // 5. Grandchild: sB is a child of one of sA's children
  if (cA.some(childOfA => children(childOfA).includes(sB.id))) {
    return "Grandchild";
  }

  // 6. Aunt / Uncle: sB is a sibling of a parent of sA, or spouse of an aunt/uncle
  if (pA.some(parentOfA => sibB.includes(parentOfA) || siblings(parentOfA).includes(sB.id))) {
    return "Aunt/Uncle";
  }
  if (pA.some(parentOfA => siblings(parentOfA).some(uncleId => spouses(uncleId).includes(sB.id)))) {
    return "Aunt/Uncle";
  }

  // 7. Niece / Nephew: sB is a child of a sibling of sA, or child of a sibling of sA's spouse
  if (sibA.some(siblingOfA => children(siblingOfA).includes(sB.id))) {
    return "Niece/Nephew";
  }
  if (spA.some(spouseOfA => siblings(spouseOfA).some(sibSp => children(sibSp).includes(sB.id)))) {
    return "Niece/Nephew";
  }

  // 8. Cousin: sA and sB have parents who are siblings
  if (pA.some(parentA => pB.some(parentB => siblings(parentA).includes(parentB)))) {
    return "Cousin";
  }

  // 9. In-Laws:
  // Parent-in-Law: sB is parent of sA's spouse
  if (spA.some(spouseOfA => parents(spouseOfA).includes(sB.id))) {
    return "Parent-in-Law";
  }
  // Child-in-Law: sB is spouse of sA's child
  if (cA.some(childOfA => spouses(childOfA).includes(sB.id))) {
    return "Child-in-Law";
  }
  // Sibling-in-Law:
  if (spA.some(spouseOfA => siblings(spouseOfA).includes(sB.id))) {
    return "Sibling-in-Law";
  }
  if (sibA.some(siblingOfA => spouses(siblingOfA).includes(sB.id))) {
    return "Sibling-in-Law";
  }
  if (spA.some(spouseOfA => siblings(spouseOfA).some(sibSp => spouses(sibSp).includes(sB.id)))) {
    return "Sibling-in-Law";
  }

  return "Not Related";
}

export function formatRel(rel: string, baseGender: string, isPet: boolean): string {
  const isFem = baseGender === "Female";
  if (isPet) {
    if (rel === "Packmate") return "Packmate 🐾";
    if (rel === "Pet") return "Pet 🐾";
    if (rel === "Owner") return "Owner 👤";
  }
  switch (rel) {
    case "Parent": return isFem ? "Mother 👨‍👧" : "Father 👨‍👦";
    case "Child": return isFem ? "Daughter 👶" : "Son 👶";
    case "Sibling": return isFem ? "Sister 👫" : "Brother 👫";
    case "Spouse": return isFem ? "Wife 💍" : "Husband 💍";
    case "Engaged": return isFem ? "Fiancée 💍" : "Fiancé 💍";
    case "Partner": return "Partner ❤️";
    case "WooHoo Partner": return "WooHoo Partner 🔥";
    case "Child-in-Law": return isFem ? "Daughter-in-Law 🤝" : "Son-in-Law 🤝";
    case "Parent-in-Law": return isFem ? "Mother-in-Law 🤝" : "Father-in-Law 🤝";
    case "Sibling-in-Law": return isFem ? "Sister-in-Law 🤝" : "Brother-in-Law 🤝";
    case "Grandchild": return isFem ? "Granddaughter 👧" : "Grandson 👦";
    case "Grandparent": return isFem ? "Grandmother 👵" : "Grandfather 👴";
    case "Niece/Nephew": return isFem ? "Niece 👧" : "Nephew 👦";
    case "Aunt/Uncle": return isFem ? "Aunt 👩" : "Uncle 👨";
    case "Cousin": return "Cousin 👥";
    case "Imaginary Friend": return `<span class="text-pink-400 font-bold">Imaginary Friend 🧸</span>`;
    case "Creator / Companion": return `<span class="text-purple-300 font-bold">Companion (Creator) 🎈</span>`;
    case "Not Related": return `<span class="text-emerald-400 font-bold">Household Member 👤</span>`;
    case "Roommate": return `<span class="text-emerald-400 font-bold">Household Member 👤</span>`;
    default: return rel;
  }
}

export function rollDeathCause(stage: string, occult: string, isPet: boolean): string {
  if (isPet) return "Old Age";
  let options: string[] = [];
  if (stage === "Child" || stage === "Infant" || stage === "Toddler") {
    options = [...deathDB.Child];
  } else if (["Teen", "Young Adult", "Adult"].includes(stage)) {
    options = [...deathDB.TeenPlus];
  } else if (stage === "Elder") {
    options = [...deathDB.TeenPlus, ...deathDB.ElderOnly];
  }
  if (deathDB.Occult[occult] && !["Child", "Toddler", "Infant"].includes(stage)) {
    options = options.concat(deathDB.Occult[occult]);
  }
  return options.length > 0 ? roll(options) : "N/A";
}

export function getDeathOptions(sim: Sim): string[] {
  if (sim.isPet) return ["Old Age"];
  let options: string[] = [];
  if (["Child", "Infant", "Toddler"].includes(sim.stage)) options = [...deathDB.Child];
  else if (sim.stage === "Elder") options = [...deathDB.TeenPlus, ...deathDB.ElderOnly];
  else options = [...deathDB.TeenPlus];

  if (deathDB.Occult[sim.occult] && !["Child", "Toddler", "Infant"].includes(sim.stage)) {
    options = options.concat(deathDB.Occult[sim.occult]);
  }
  return options;
}

export function generateSimObject(forceStage: string | null = null, forceId: number = 1, forceType: string | null = null, isLegacy: boolean = false): Sim {
  const isPet = forceType === "Pet" ? true : (forceType === "Human" ? false : (forceStage ? false : (Math.random() < 0.25)));
  let sTraits: string[] = [];
  let supplementaryTraits: string[] = [];

  if (isPet) {
    let stage = forceStage && db.petStages.includes(forceStage) ? forceStage : roll(db.petStages);
    let species = roll(["Dog", "Cat", "Horse"]);
    let isGhost = false, cause = "N/A";

    let pool = species === "Dog" ? db.dogTraits : (species === "Cat" ? db.catTraits : db.horseTraits);
    
    // Main Traits
    for (let k = 0; k < 3; k++) {
      let t = getValidTrait(pool, sTraits);
      if (t) sTraits.push(t);
    }

    // Supplementary Traits (3 extra choices)
    for (let k = 0; k < 3; k++) {
      let t = getValidTrait(pool, [...sTraits, ...supplementaryTraits]);
      if (t) supplementaryTraits.push(t);
    }

    const isHorse = species === "Horse";
    const horseHobby = isHorse ? roll(db.horseSkills) : "N/A";
    const horseSkills = isHorse ? generateHorseSkills() : undefined;

    return {
      id: forceId, isPet: true, isFunctional: false,
      species: species, stage: stage, ghost: isGhost, cause: cause, isDeceased: false, occult: "None", modules: [],
      baseGender: roll(["Male", "Female"]), gender: "N/A", pref: "N/A",
      pregnancy: "N/A", milk: "N/A", toilet: "N/A", attracted: "N/A", exploring: "N/A", woohoo: "N/A",
      traits: sTraits, supplementaryTraits: supplementaryTraits, hobby: horseHobby, horseSkills: horseSkills, asp: "N/A", career: "N/A", bounds: null, relationsList: []
    };
  }

  let stage = forceStage;
  if (forceStage === "Random Teen+") stage = roll(db.teenPlusStages);
  if (!forceStage || db.petStages.includes(forceStage!)) stage = roll(db.stages);
  const isFun = db.teenPlusStages.includes(stage!);

  let asp = "N/A";
  if (stage === "Teen") asp = roll([...db.aspirationsTeen, ...db.aspirationsAdult]);
  else if (isFun) asp = roll(db.aspirationsAdult);
  else if (stage === "Child") asp = roll(db.aspirationsChild);

  let isGhost = false, occult = "None";
  let sRoll = Math.random();

  let allowedOccults = db.occults.filter(o => o !== "Imaginary Friend");
  // PieceOfPrincess Random Legacy Rule: Servos cannot reproduce biologically and are strictly excluded from Legacy Challenge
  if (isLegacy) {
    allowedOccults = allowedOccults.filter(o => o !== "Servo");
  }
  if (["Infant", "Toddler", "Child", "Teen"].includes(stage!)) {
    allowedOccults = allowedOccults.filter(o => o !== "Servo");
  }

  // Sims can be ghosts as precedent rules indicate (playable ghost state, isDeceased: false)
  if (sRoll < 0.08) {
    isGhost = true;
  } else if (sRoll < 0.15) {
    occult = roll(allowedOccults);
    isGhost = true;
  } else if (sRoll > 0.7) {
    occult = roll(allowedOccults);
  }

  let req = aspReqs[asp] || {};
  if (req.occult) occult = req.occult;

  if (occult === "Servo") {
    if (isLegacy) {
      occult = "None";
    } else if (["Infant", "Toddler", "Child", "Teen"].includes(stage!)) {
      stage = "Young Adult";
    }
  }

  let cause = "N/A";
  if (isGhost) cause = rollDeathCause(stage!, occult, false);

  let pool: string[] = [];
  let maxT = 1;
  if (stage === "Infant") pool = db.infantTraits;
  else if (stage === "Toddler") pool = db.toddlerTraits;
  else if (stage === "Child") pool = db.childTraits;
  else { pool = db.adultTraits; maxT = stage === "Teen" ? 2 : 3; }

  for (let k = 0; k < maxT; k++) {
    let t = getValidTrait(pool, sTraits);
    if (t) sTraits.push(t);
  }

  let modules: string[] = [];
  if (occult === "Servo") {
    let availMods = [...db.servoModules];
    let numMods = rNum(1, 3);
    for (let i = 0; i < numMods; i++) {
      let m = roll(availMods);
      modules.push(m);
      availMods = availMods.filter(x => x !== m);
    }
    if (asp !== "N/A") {
      let safeAsps = db.aspirationsAdult.filter(a => !aspReqs[a] || !aspReqs[a].occult);
      asp = roll(safeAsps);
    }
  }

  let wh = isFun ? roll(["Men", "Women", "Both", "None"]) : "N/A";
  let wJeal = wh === "None" ? "No" : roll(["Yes", "No"]);
  let baseG = roll(["Male", "Female"]);
  
  // Frame and Preference only for Teen+
  let frame = "N/A";
  let pref = "N/A";
  
  if (isFun) {
    frame = roll(["Masculine", "Feminine"]);
    pref = roll(["Masculine", "Feminine"]);
  }

  let hobby = "N/A";
  if (isFun) hobby = roll(db.adultSkills);
  else if (stage === "Child") hobby = roll(db.childSkills);
  else if (stage === "Toddler") hobby = roll(db.toddlerSkills);

  let career = "N/A";
  if (isFun) {
    if (req.career) career = req.career;
    else if (stage === "Teen") career = roll(["<strong>Part-Time:</strong> Fast Food", "<strong>Part-Time:</strong> Barista", "<strong>Part-Time:</strong> Retail", "<strong>Student:</strong> High School", "<strong>Part-Time:</strong> Young Noble"]);
    else career = roll(db.allCareers);
  }

  let preg = "N/A", milk = "N/A", toilet = "N/A";

  if (isFun) {
    if (occult === "Servo") {
      preg = "N/A"; milk = "N/A"; toilet = "N/A";
      frame = "N/A"; pref = "N/A";
    } else {
      preg = roll(db.pregnancyWeighted);
      milk = roll(["Yes", "No"]);
      toilet = roll(["Standing", "Sitting"]);
    }
  }

  let childSkills: ChildMultiSkills | undefined = undefined;
  let toddlerSkills: ToddlerSkills | undefined = undefined;
  let unlockedAdultSkills: string[] | undefined = undefined;
  if (stage === "Child") {
    childSkills = generateChildMultiSkills(hobby);
    unlockedAdultSkills = getUnlockedAdultSkills(childSkills);
  } else if (stage === "Toddler") {
    toddlerSkills = generateToddlerSkills(hobby);
  }

  return {
    id: forceId, isPet: false, isFunctional: isFun,
    species: "Human", stage: stage!, ghost: isGhost, cause: cause, isDeceased: false, occult: occult, modules: modules,
    baseGender: baseG, gender: frame, pref: pref,
    pregnancy: preg, milk: milk, toilet: toilet,
    attracted: isFun ? roll(["Men", "Women", "Both", "Neither"]) : "N/A", exploring: isFun ? roll(["Yes", "No"]) : "N/A",
    woohoo: wh, traits: sTraits, hobby: hobby, asp: asp, career: career,
    bounds: isFun ? { phys: roll(["Yes", "No"]), nonphys: roll(["Yes", "No"]), woo: wJeal, flex: roll(["Yes", "No"]) } : null,
    relationsList: [],
    childSkills: childSkills,
    toddlerSkills: toddlerSkills,
    unlockedAdultSkills: unlockedAdultSkills
  };
}

export function generateImaginaryFriend(linkedSim: Sim, forceId: number = 1): Sim {
  // Stage matches the linked sim: Toddler or Child
  const stage = ["Toddler", "Child"].includes(linkedSim.stage) ? linkedSim.stage : "Child";
  const baseG = roll(["Male", "Female"]);
  let sTraits: string[] = [];

  const pool = stage === "Toddler" ? db.toddlerTraits : db.childTraits;
  const t = roll(pool);
  if (t) sTraits.push(t);

  const hobby = stage === "Toddler" ? roll(db.toddlerSkills) : roll(db.childSkills);
  const asp = stage === "Child" ? roll(db.aspirationsChild) : "N/A";

  let childSkills: ChildMultiSkills | undefined = undefined;
  let unlockedAdultSkills: string[] | undefined = undefined;
  if (stage === "Child") {
    childSkills = generateChildMultiSkills(hobby);
    unlockedAdultSkills = getUnlockedAdultSkills(childSkills);
  }

  return {
    id: forceId,
    isPet: false,
    isFunctional: false,
    species: "Human",
    stage: stage,
    ghost: false,
    cause: "N/A",
    isDeceased: false,
    occult: "Imaginary Friend",
    modules: [],
    baseGender: baseG,
    gender: "N/A",
    pref: "N/A",
    pregnancy: "N/A",
    milk: "N/A",
    toilet: "N/A",
    attracted: "N/A",
    exploring: "N/A",
    woohoo: "N/A",
    traits: sTraits,
    hobby: hobby,
    asp: asp,
    career: "N/A",
    bounds: null,
    relationsList: [],
    linkedSimId: linkedSim.id,
    childSkills: childSkills,
    unlockedAdultSkills: unlockedAdultSkills
  };
}

// Sub-neighborhoods that natively support apartments:
export const APARTMENT_SUB_NEIGHBORHOODS: Record<string, string[]> = {
  "San Myshuno": ["Spice Market", "Arts Quarter", "Fashion District", "Uptown"],
  "Evergreen Harbor": ["Conifer Station", "Grims Quarry", "Port Promise"],
  "Ondarion": ["Bellacorde", "Dambele"]
};

export const PENTHOUSE_SUB_NEIGHBORHOODS: Record<string, string[]> = {
  "San Myshuno": ["Uptown", "Fashion District", "Arts Quarter"]
};

export function isApartmentApplicable(world: string, neighborhood: string): boolean {
  return !!(APARTMENT_SUB_NEIGHBORHOODS[world] && APARTMENT_SUB_NEIGHBORHOODS[world].includes(neighborhood));
}

export function isPenthouseApplicable(world: string, neighborhood: string): boolean {
  return !!(PENTHOUSE_SUB_NEIGHBORHOODS[world] && PENTHOUSE_SUB_NEIGHBORHOODS[world].includes(neighborhood));
}

export function getDwellingDetails(type: DwellingType, tier?: TinyHomeTier): { description: string; perks: string[] } {
  switch (type) {
    case 'Tiny Home':
      if (tier?.includes('Micro Home')) {
        return {
          description: "Ultra-compact micro residence limited to 32 tiles. Maximizes environmental efficiency and cozy closeness.",
          perks: [
            "⚡ Double Skill Gain (Skills level 2x faster)",
            "😊 Feelin' Fine (+2 to all Positive Moodlets)",
            "🛋️ Cozy Comfort (+2 Comfort anywhere in the house)",
            "📉 Bills Cut in Half (50% reduction on utilities)",
            "💞 Double Relationship Gain with household members"
          ]
        };
      } else if (tier?.includes('Tiny Home')) {
        return {
          description: "Compact living up to 64 tiles. Balanced cozy footprint with formidable gameplay bonuses.",
          perks: [
            "⚡ Faster Skill Gain (+1 Boost across all skills)",
            "🛋️ Cozy Comfort (+1 Comfort on beds & chairs)",
            "📉 Lower Bills (25% utility bill reduction)",
            "💞 Accelerated Relationship Building"
          ]
        };
      } else {
        return {
          description: "Modest space-conscious living up to 100 tiles. Excellent intro into small footprint builds.",
          perks: [
            "🛋️ Cozy Comfort (+1 Comfort boost)",
            "😊 Positive Moodlet Duration Boost",
            "📉 Reduced Utility Bills"
          ]
        };
      }
    case 'Haunted Home':
      return {
        description: "Paranormal Haunted House Residential lot. High spiritual activity, nocturnal phenomena, and ghostly visitors.",
        perks: [
          "👻 Nightly Specter Visits (Friendly, Playful, or Mischievous)",
          "🕯️ Claude René Duplantier Guidry visits to offer survival advice & ectoplasm help",
          "🔮 Séance Table rituals (Commune with departed, summon Bonehilda)",
          "⚠️ Temperance Wrath events & Cursed doll / creepy vine outbreaks",
          "🎖️ Unlocks Medium Skill progression & Paranormal Investigator License"
        ]
      };
    case 'Residential Rental':
      return {
        description: "Multi-unit rental property from For Rent. Shared walls and common areas with unit ratings and landlord/tenant dynamics.",
        perks: [
          "🏢 Multi-Unit Property: Live as a Tenant or live-in Property Owner",
          "⭐ Unit Rating System (1 to 5 Stars based on size, amenities, decor)",
          "🔧 Maintenance Emergencies (Mold, insects, broken heaters, trash overflow)",
          "🗣️ Communal Living: Shared courtyards, laundry rooms, potlucks & snooping",
          "💰 Collect rental income or balance strict lease conditions"
        ]
      };
    case 'Apartment':
      return {
        description: "City high-rise flat with communal hallway, neighbor drama, and bustling urban skyline.",
        perks: [
          "🏙️ Bustling Hallway Living & Bulletin Board neighborhood notices",
          "🔊 Neighbor Encounters (Loud music, romance drama, complaining at door)",
          "🔧 Landlord Maintenance Service (Free plumbing & electrical repairs)",
          "🗑️ Communal Chute disposal & package deliveries in lobby",
          "🌆 Immersive city sounds, festivals right downstairs & urban views"
        ]
      };
    case 'Penthouse':
      return {
        description: "Exclusive top-floor luxury penthouse towering over the metropolitan skyline with private elevator access.",
        perks: [
          "🌆 360° Panoramic Skyline Views & Private Elevator Access",
          "🏗️ Full Architectural Freedom (Build multi-level rooftop oasis)",
          "🏊 Rooftop pools, open-air stargazing terraces & luxury living",
          "✨ Prestigious status for elite and influential Sims"
        ]
      };
    case 'Standard Residential':
    default:
      return {
        description: "Standard standalone residential property located in the heart of the sub-neighborhood.",
        perks: [
          "🏡 Complete architectural and interior design freedom",
          "🌳 Standalone private yard, garden, and exterior space",
          "📐 No tile limits or communal landlord restrictions",
          "📬 Independent mailbox and standard municipal services"
        ]
      };
  }
}

export function rollDwellingType(
  world: string,
  neighborhood: string,
  allowResidentialRental: boolean = false
): { type: DwellingType; tier?: TinyHomeTier } {
  const aptApplicable = isApartmentApplicable(world, neighborhood);
  const penthouseApplicable = isPenthouseApplicable(world, neighborhood);

  const weighted: { type: DwellingType; weight: number }[] = [
    { type: 'Standard Residential', weight: 40 },
    { type: 'Tiny Home', weight: 35 },
    { type: 'Haunted Home', weight: 25 },
  ];

  // User decree: "Only roll residential rental wen the generation roll indicates that you must move your spares into the same residential rental"
  if (allowResidentialRental) {
    weighted.push({ type: 'Residential Rental', weight: 35 });
  }

  if (aptApplicable) {
    weighted.push({ type: 'Apartment', weight: 45 });
  }

  if (penthouseApplicable) {
    weighted.push({ type: 'Penthouse', weight: 15 });
  }

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let rand = Math.random() * total;
  let chosen: DwellingType = 'Standard Residential';

  for (const item of weighted) {
    if (rand < item.weight) {
      chosen = item.type;
      break;
    }
    rand -= item.weight;
  }

  let tier: TinyHomeTier | undefined = undefined;
  if (chosen === 'Tiny Home') {
    const tiers: TinyHomeTier[] = [
      'Tier 1: Micro Home (Max 32 tiles)',
      'Tier 2: Tiny Home (Max 64 tiles)',
      'Tier 3: Small Home (Max 100 tiles)'
    ];
    tier = roll(tiers);
  }

  return { type: chosen, tier };
}

// --- LOT TRAITS & CHALLENGES REROLL UTILITIES ---

export function filterLotTraitConflicts(pool: string[], selectedTraits: string[]): string[] {
  let available = pool.filter(t => !selectedTraits.includes(t));
  if (selectedTraits.includes("On Ley Line")) available = available.filter(x => x !== "On a Dark Ley Line");
  if (selectedTraits.includes("On a Dark Ley Line")) available = available.filter(x => x !== "On Ley Line");
  return available;
}

export function rollLotTraits(count?: number): string[] {
  const tCount = count !== undefined ? count : getDegressiveCount('traits');
  let available = [...db.lotTraits];
  const lts: string[] = [];
  for (let k = 0; k < tCount; k++) {
    available = filterLotTraitConflicts(available, lts);
    if (available.length === 0) break;
    const t = roll(available);
    lts.push(t);
  }
  return lts;
}

export function getDisabledChallengesForDwelling(dwellingType?: string): string[] {
  if (!dwellingType) return [];
  const restrictions: Record<string, string[]> = db.dwellingChallengeRestrictions || {};
  return restrictions[dwellingType] || [];
}

export function filterChallengesForDwelling(challenges: string[], dwellingType?: string): string[] {
  const disabled = getDisabledChallengesForDwelling(dwellingType);
  if (disabled.length === 0) return challenges;
  return challenges.filter(c => !disabled.includes(c));
}

/**
 * Continuous degressive lot challenges roll.
 * Starts high (70% probability for the 1st challenge) and decays continuously until a miss,
 * up to all available applicable challenges in The Sims 4.
 * Strictly respects dwelling restrictions (e.g. Apartments, Tiny Homes, Haunted Homes).
 */
export function rollLotChallenges(dwellingType?: string, count?: number): string[] {
  const disabled = getDisabledChallengesForDwelling(dwellingType);
  let available = db.lotChallenges.filter(c => !disabled.includes(c));

  if (count !== undefined) {
    const lcs: string[] = [];
    for (let l = 0; l < count; l++) {
      const unpicked = available.filter(c => !lcs.includes(c));
      if (unpicked.length === 0) break;
      const c = roll(unpicked);
      lcs.push(c);
    }
    return lcs;
  }

  // Continuous degressive rolls starting high and decaying until a miss
  const lcs: string[] = [];
  let currentChance = 0.70; // 70% chance for 1st challenge
  const decayFactor = 0.72; // Decays with each consecutively successful roll

  while (available.length > 0) {
    if (Math.random() < currentChance) {
      const picked = roll(available);
      lcs.push(picked);
      available = available.filter(c => c !== picked);
      currentChance *= decayFactor;
    } else {
      break;
    }
  }

  return lcs;
}

export function rerollSingleLotTrait(currentTraits: string[], index: number): string[] {
  const otherTraits = currentTraits.filter((_, i) => i !== index);
  const available = filterLotTraitConflicts([...db.lotTraits], otherTraits);
  if (available.length === 0) return currentTraits;
  const newTrait = roll(available);
  const updated = [...currentTraits];
  updated[index] = newTrait;
  return updated;
}

export function rerollSingleLotChallenge(currentChallenges: string[], index: number, dwellingType?: string): string[] {
  const otherChallenges = currentChallenges.filter((_, i) => i !== index);
  const disabled = getDisabledChallengesForDwelling(dwellingType);
  const available = db.lotChallenges.filter(c => !otherChallenges.includes(c) && !disabled.includes(c));
  if (available.length === 0) return currentChallenges;
  const newChallenge = roll(available);
  const updated = [...currentChallenges];
  updated[index] = newChallenge;
  return updated;
}

export function addLotTrait(currentTraits: string[]): string[] {
  if (currentTraits.length >= 3) return currentTraits; // TS4 has max 3 lot traits
  const available = filterLotTraitConflicts([...db.lotTraits], currentTraits);
  if (available.length === 0) return currentTraits;
  const newTrait = roll(available);
  return [...currentTraits, newTrait];
}

export function addLotChallenge(currentChallenges: string[], dwellingType?: string): string[] {
  const disabled = getDisabledChallengesForDwelling(dwellingType);
  const available = db.lotChallenges.filter(c => !currentChallenges.includes(c) && !disabled.includes(c));
  if (available.length === 0) return currentChallenges;
  const newChallenge = roll(available);
  return [...currentChallenges, newChallenge];
}

/**
 * Synchronizes pregnancy mechanics for a romantic couple (disregarding gender).
 * Pairs the couple in a reproductively compatible fashion:
 * Exactly ONE partner is assigned "Can get pregnant" (with nursing milk: "Yes")
 * and the OTHER partner is assigned "Can get others pregnant".
 * Both same-sex and opposite-sex couples are 100% guaranteed biological reproduction.
 */
export function synchronizeCouplePregnancy(simA: Sim, simB: Sim): void {
  if (!simA || !simB || simA.isPet || simB.isPet) return;
  if (simA.occult === "Servo" || simB.occult === "Servo") return;

  const aCanCarry = simA.pregnancy === "Can get pregnant";
  const aCanImpregnate = simA.pregnancy === "Can get others pregnant";
  const bCanCarry = simB.pregnancy === "Can get pregnant";
  const bCanImpregnate = simB.pregnancy === "Can get others pregnant";

  // If already complementarily paired (one carries, one impregnates), keep their assignment
  if ((aCanCarry && bCanImpregnate) || (aCanImpregnate && bCanCarry)) {
    return;
  }

  let carrier: Sim;
  let impregnator: Sim;

  if (aCanCarry) {
    carrier = simA;
    impregnator = simB;
  } else if (bCanCarry) {
    carrier = simB;
    impregnator = simA;
  } else if (aCanImpregnate) {
    impregnator = simA;
    carrier = simB;
  } else if (bCanImpregnate) {
    impregnator = simB;
    carrier = simA;
  } else {
    // Neither has a defined reproductive role (or both rolled "Neither")
    // Disregarding gender: 50/50 randomized designation
    const aCarries = Math.random() < 0.5;
    carrier = aCarries ? simA : simB;
    impregnator = aCarries ? simB : simA;
  }

  carrier.pregnancy = "Can get pregnant";
  carrier.milk = "Yes";
  if (!carrier.toilet || carrier.toilet === "N/A") {
    carrier.toilet = carrier.baseGender === "Male" ? "Standing" : "Sitting";
  }

  impregnator.pregnancy = "Can get others pregnant";
  if (!impregnator.toilet || impregnator.toilet === "N/A") {
    impregnator.toilet = impregnator.baseGender === "Female" ? "Sitting" : "Standing";
  }
}

export function generateLot(
  forceWorld: string | null = null,
  forceNeighborhood: string | null = null,
  forceDwellingType: DwellingType | null = null,
  allowResidentialRental: boolean = false
): Lot {
  const tCount = getDegressiveCount('traits');
  const lts = rollLotTraits(tCount);

  const worldNames = Object.keys(db.worlds);
  let world = roll(worldNames);
  
  // Exclude Vacation Worlds (if not forced)
  const vacationWorlds = ["Granite Falls", "Selvadorada", "Batuu"];
  if (!forceWorld) {
    let tries = 0;
    while (vacationWorlds.includes(world) && tries < 10) {
      world = roll(worldNames);
      tries++;
    }
  }

  if (forceWorld && worldNames.includes(forceWorld)) {
    world = forceWorld;
  }

  const neighborhoodsObj = (db.worlds as any)[world] || {};
  let neighborhoodNames = Object.keys(neighborhoodsObj);

  // Filter for residential-capable sub-neighborhoods (prefer those with residential lots or living capacity)
  const residentialSubHoods = neighborhoodNames.filter(n => {
    const data = neighborhoodsObj[n];
    return data && data.residential && data.residential.length > 0;
  });

  if (residentialSubHoods.length > 0) {
    neighborhoodNames = residentialSubHoods;
  }

  let neighborhood = roll(neighborhoodNames);
  if (forceNeighborhood && Object.keys(neighborhoodsObj).includes(forceNeighborhood)) {
    neighborhood = forceNeighborhood;
  }

  // Roll Dwelling Type: Residential, Tiny Home (with Tier), Haunted Home, Residential Rental, Apartment (if applicable), Penthouse (if applicable)
  let dwellingInfo: { type: DwellingType; tier?: TinyHomeTier };
  if (forceDwellingType) {
    let tier: TinyHomeTier | undefined = undefined;
    if (forceDwellingType === 'Tiny Home') {
      tier = roll([
        'Tier 1: Micro Home (Max 32 tiles)',
        'Tier 2: Tiny Home (Max 64 tiles)',
        'Tier 3: Small Home (Max 100 tiles)'
      ]);
    }
    dwellingInfo = { type: forceDwellingType, tier };
  } else {
    dwellingInfo = rollDwellingType(world, neighborhood, allowResidentialRental);
  }

  // Continuous degressive lot challenge roll respecting the dwelling type restrictions
  const lcs = rollLotChallenges(dwellingInfo.type);

  const details = getDwellingDetails(dwellingInfo.type, dwellingInfo.tier);
  const aptApplicable = isApartmentApplicable(world, neighborhood);

  return { 
    world: world, 
    neighborhood: neighborhood, // The sub-neighbourhood, NOT a selected parcel!
    dwellingType: dwellingInfo.type,
    tinyHomeTier: dwellingInfo.tier,
    dwellingDescription: details.description,
    dwellingPerks: details.perks,
    isApartmentApplicable: aptApplicable,
    lotTraits: lts, 
    lotChallenges: lcs,
    lotType: 'Residential',
    isGalleryRegeneration: false,
    redesignResidential: Math.random() < 0.4
  };
}

export function calculateRelations(
  household: Sim[],
  relationMode: RelationMode = 'mixed',
  preserveManual: boolean = false
) {
  let size = household.length;
  if (size === 0) return;

  household.forEach(s => {
    if (!s.customRelations) s.customRelations = {};
    if (!s.pairwiseRelations) s.pairwiseRelations = {};
    if (!preserveManual) s.customRelations = {};
    s.baseRel = undefined;
    s.familyUnitId = undefined;
    s.familyUnitName = undefined;
    s.familyUnitBadge = undefined;
    s.familyUnitRole = undefined;
    s.isIndependentRoommate = false;
  });

  const humans = household.filter(s => !s.isPet && s.occult !== "Imaginary Friend");

  if (!preserveManual && relationMode !== 'unrelatedOnly' && humans.length > 1) {
    const adults = humans.filter(s => ["Young Adult", "Adult", "Elder"].includes(s.stage));
    const teens = humans.filter(s => s.stage === "Teen");
    const kids = humans.filter(s => ["Infant", "Toddler", "Child"].includes(s.stage));

    // Decision: Should we generate multi-family co-living?
    let wantMultiFamily = false;
    if (relationMode === 'multiFamily') {
      wantMultiFamily = true;
    } else if (relationMode === 'mixed') {
      // If we have >= 3 adults/teens, or (>= 2 adults/teens and >= 2 kids), 55% chance of multiple independent families sharing home
      if ((adults.length + teens.length >= 3) || (adults.length + teens.length >= 2 && kids.length >= 2)) {
        wantMultiFamily = Math.random() < 0.55;
      }
    }

    if (wantMultiFamily && (adults.length + teens.length >= 2)) {
      // ==========================================
      // MULTI-FAMILY CO-LIVING GENERATION
      // Independent families + optional solo roomies
      // ==========================================
      const availableAdults = [...adults];
      const availableTeens = [...teens];
      const availableKids = [...kids];
      const partnered = new Set<number>();

      // Family Unit 1: Couple or Single Parent
      const unit1Adults: Sim[] = [];
      if (availableAdults.length >= 2) {
        unit1Adults.push(availableAdults.shift()!);
        unit1Adults.push(availableAdults.shift()!);
        const rel = roll(["Spouse", "Spouse", "Partner"]);
        unit1Adults[0].customRelations![unit1Adults[1].id] = rel;
        unit1Adults[1].customRelations![unit1Adults[0].id] = rel;
        synchronizeCouplePregnancy(unit1Adults[0], unit1Adults[1]);
        partnered.add(unit1Adults[0].id);
        partnered.add(unit1Adults[1].id);
      } else if (availableAdults.length === 1) {
        unit1Adults.push(availableAdults.shift()!);
      } else if (availableTeens.length >= 2) {
        unit1Adults.push(availableTeens.shift()!);
        unit1Adults.push(availableTeens.shift()!);
        unit1Adults[0].customRelations![unit1Adults[1].id] = "Partner";
        unit1Adults[1].customRelations![unit1Adults[0].id] = "Partner";
        synchronizeCouplePregnancy(unit1Adults[0], unit1Adults[1]);
        partnered.add(unit1Adults[0].id);
        partnered.add(unit1Adults[1].id);
      }

      // Distribute kids: Unit 1 gets their own children
      const totalKids = availableKids.length;
      let unit1KidsCount = totalKids;
      const otherAdultsCount = availableAdults.length + availableTeens.length;
      if (otherAdultsCount >= 1 && totalKids >= 2) {
        unit1KidsCount = Math.ceil(totalKids / 2);
      } else if (otherAdultsCount >= 1 && totalKids === 1) {
        unit1KidsCount = Math.random() < 0.5 ? 1 : 0;
      }

      for (let k = 0; k < unit1KidsCount; k++) {
        if (availableKids.length === 0) break;
        const kid = availableKids.shift()!;
        unit1Adults.forEach(parent => {
          parent.customRelations![kid.id] = "Parent";
          kid.customRelations![parent.id] = "Child";
        });
      }

      // Optionally attach a teen child to Unit 1
      if (availableTeens.length > 0 && Math.random() < 0.5) {
        const teen = availableTeens.shift()!;
        unit1Adults.forEach(parent => {
          parent.customRelations![teen.id] = "Parent";
          teen.customRelations![parent.id] = "Child";
        });
      }

      // Family Unit 2: Completely Independent Family Unit!
      if (availableAdults.length >= 1 || availableKids.length > 0 || (availableTeens.length >= 2 && relationMode === 'multiFamily')) {
        const unit2Adults: Sim[] = [];
        if (availableAdults.length >= 2) {
          unit2Adults.push(availableAdults.shift()!);
          unit2Adults.push(availableAdults.shift()!);
          const rel = roll(["Spouse", "Spouse", "Partner"]);
          unit2Adults[0].customRelations![unit2Adults[1].id] = rel;
          unit2Adults[1].customRelations![unit2Adults[0].id] = rel;
          synchronizeCouplePregnancy(unit2Adults[0], unit2Adults[1]);
          partnered.add(unit2Adults[0].id);
          partnered.add(unit2Adults[1].id);
        } else if (availableAdults.length === 1) {
          unit2Adults.push(availableAdults.shift()!);
        } else if (availableTeens.length >= 1) {
          unit2Adults.push(availableTeens.shift()!);
        }

        // Assign their own children to Unit 2!
        while (availableKids.length > 0) {
          const kid = availableKids.shift()!;
          if (unit2Adults.length > 0) {
            unit2Adults.forEach(parent => {
              parent.customRelations![kid.id] = "Parent";
              kid.customRelations![parent.id] = "Child";
            });
          } else {
            // Safety fallback: if no adult in unit 2, assign to unit 1
            unit1Adults.forEach(parent => {
              parent.customRelations![kid.id] = "Parent";
              kid.customRelations![parent.id] = "Child";
            });
          }
        }

        // Optionally attach a teen child to Unit 2
        if (availableTeens.length > 0 && unit2Adults.length > 0 && Math.random() < 0.5) {
          const teen = availableTeens.shift()!;
          unit2Adults.forEach(parent => {
            parent.customRelations![teen.id] = "Parent";
            teen.customRelations![parent.id] = "Child";
          });
        }

        // Small chance (20%) if in 'mixed' mode for Unit 2 to be an offshoot sibling branch of Unit 1
        if (relationMode === 'mixed' && Math.random() < 0.20 && unit1Adults.length > 0 && unit2Adults.length > 0) {
          unit1Adults[0].customRelations![unit2Adults[0].id] = "Sibling";
          unit2Adults[0].customRelations![unit1Adults[0].id] = "Sibling";
        }
      }

      // Any remaining adults or teens are INDEPENDENT ROOMMATES!
      // They have NO relations to anyone else in the household.
    } else {
      // ==========================================
      // SINGLE EXTENDED FAMILY GENERATION
      // Core family + relatives or solo roomies
      // ==========================================
      const adultsPool = [...adults];
      const teensPool = [...teens];
      const kidsPool = [...kids];
      const partnered = new Set<number>();

      let coupleA: Sim | null = null;
      let coupleB: Sim | null = null;

      if (adultsPool.length >= 2) {
        coupleA = adultsPool[0];
        coupleB = adultsPool[1];
        const rel = roll(["Spouse", "Spouse", "Partner"]);
        coupleA.customRelations![coupleB.id] = rel;
        coupleB.customRelations![coupleA.id] = rel;
        synchronizeCouplePregnancy(coupleA, coupleB);
        partnered.add(coupleA.id);
        partnered.add(coupleB.id);
      } else if (adultsPool.length === 1) {
        coupleA = adultsPool[0];
      } else if (teensPool.length >= 2 && Math.random() < 0.5) {
        coupleA = teensPool[0];
        coupleB = teensPool[1];
        coupleA.customRelations![coupleB.id] = "Partner";
        coupleB.customRelations![coupleA.id] = "Partner";
        synchronizeCouplePregnancy(coupleA, coupleB);
        partnered.add(coupleA.id);
        partnered.add(coupleB.id);
      }

      // Parenting for kids
      for (const kid of kidsPool) {
        if (coupleA && coupleB) {
          coupleA.customRelations![kid.id] = "Parent";
          kid.customRelations![coupleA.id] = "Child";
          coupleB.customRelations![kid.id] = "Parent";
          kid.customRelations![coupleB.id] = "Child";
        } else if (coupleA) {
          coupleA.customRelations![kid.id] = "Parent";
          kid.customRelations![coupleA.id] = "Child";
        } else if (teensPool.length > 0) {
          const guardian = teensPool[0];
          guardian.customRelations![kid.id] = "Sibling";
          kid.customRelations![guardian.id] = "Sibling";
        }
      }

      // Parenting for teens
      for (const teen of teensPool) {
        if (partnered.has(teen.id)) continue;
        if (coupleA && coupleB && Math.random() < 0.8) {
          coupleA.customRelations![teen.id] = "Parent";
          teen.customRelations![coupleA.id] = "Child";
          coupleB.customRelations![teen.id] = "Parent";
          teen.customRelations![coupleB.id] = "Child";
        } else if (coupleA && Math.random() < 0.8) {
          coupleA.customRelations![teen.id] = "Parent";
          teen.customRelations![coupleA.id] = "Child";
        }
      }

      // Remaining adults
      const unassignedAdults = adultsPool.filter(a => !partnered.has(a.id));
      let i = 0;
      while (i < unassignedAdults.length) {
        const sim = unassignedAdults[i];
        if (i + 1 < unassignedAdults.length && (relationMode === 'familyOnly' || Math.random() < 0.7)) {
          const offshootPartner = unassignedAdults[i + 1];
          const rel = roll(["Spouse", "Partner"]);
          sim.customRelations![offshootPartner.id] = rel;
          offshootPartner.customRelations![sim.id] = rel;
          synchronizeCouplePregnancy(sim, offshootPartner);
          partnered.add(sim.id);
          partnered.add(offshootPartner.id);

          if (coupleA && (relationMode === 'familyOnly' || Math.random() < 0.6)) {
            sim.customRelations![coupleA.id] = "Sibling";
            coupleA.customRelations![sim.id] = "Sibling";
          }
          i += 2;
          continue;
        }

        if (coupleA) {
          if (sim.stage === "Elder" && coupleA.stage !== "Elder") {
            sim.customRelations![coupleA.id] = "Parent";
            coupleA.customRelations![sim.id] = "Child";
          } else if (relationMode === 'familyOnly' || Math.random() < 0.6) {
            sim.customRelations![coupleA.id] = "Sibling";
            coupleA.customRelations![sim.id] = "Sibling";
          } else {
            // Independent roommate living with family!
            sim.customRelations![coupleA.id] = "Not Related";
          }
        }
        i++;
      }
    }
  }

  // --- COMPUTE ALL PAIRWISE RELATIONS & DYNAMICS ---
  household.forEach(s => {
    s.relationsList = [];
    s.pairwiseRelations = {};
  });

  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      let sA = household[i], sB = household[j];
      let relAtoB: string, relBtoA: string;

      if (sA.isPet && sB.isPet) {
        if (sA.species === sB.species) {
          let possible = ["Packmate"];
          let aAdult = sA.stage === "Adult" || sA.stage === "Elder";
          let bAdult = sB.stage === "Adult" || sB.stage === "Elder";

          if (aAdult && bAdult) possible.push("Partner", "Sibling");
          if ((sA.stage === "Baby" && bAdult) || (sA.stage === "Adult" && sB.stage === "Elder")) possible.push("Child");
          if ((sB.stage === "Baby" && aAdult) || (sB.stage === "Adult" && sA.stage === "Elder")) possible.push("Parent");

          relAtoB = roll(possible);

          if (relAtoB === "Partner") relBtoA = "Partner";
          else if (relAtoB === "Sibling") relBtoA = "Sibling";
          else if (relAtoB === "Child") relBtoA = "Parent";
          else if (relAtoB === "Parent") relBtoA = "Child";
          else relBtoA = "Packmate";
        } else {
          relAtoB = "Packmate";
          relBtoA = "Packmate";
        }
      } else if (sA.isPet || sB.isPet) {
        relAtoB = sA.isPet ? "Pet" : "Owner";
        relBtoA = sB.isPet ? "Pet" : "Owner";
      } else if (sA.occult === "Imaginary Friend" && sA.linkedSimId === sB.id) {
        relAtoB = "Imaginary Friend";
        relBtoA = "Creator / Companion";
      } else if (sB.occult === "Imaginary Friend" && sB.linkedSimId === sA.id) {
        relAtoB = "Creator / Companion";
        relBtoA = "Imaginary Friend";
      } else if (sA.occult === "Imaginary Friend" || sB.occult === "Imaginary Friend") {
        relAtoB = "Not Related";
        relBtoA = "Not Related";
      } else {
        relBtoA = getRelation(sA, sB, household);
        relAtoB = getRelation(sB, sA, household);
      }

      let romDyn = "None", famDyn = "None";

      const explicitDynamic = sA.customDynamics?.[sB.id] || sB.customDynamics?.[sA.id];

      if (!sA.isPet && !sB.isPet && sA.occult !== "Imaginary Friend" && sB.occult !== "Imaginary Friend") {
        const aIdx = db.stages.indexOf(sA.stage);
        const bIdx = db.stages.indexOf(sB.stage);
        const isRomance = ["Spouse", "Partner", "Engaged"].includes(relAtoB) && aIdx >= 3 && bIdx >= 3;
        const isFamily = ["Sibling", "Parent", "Child", "Grandchild", "Grandparent", "Aunt/Uncle", "Niece/Nephew", "Cousin"].includes(relAtoB);

        if (explicitDynamic) {
          if (explicitDynamic === "None") {
            romDyn = "None";
            famDyn = "None";
          } else if (db.romanceDynamics.includes(explicitDynamic)) {
            romDyn = explicitDynamic;
            sA.romanticDynamic = explicitDynamic;
            sB.romanticDynamic = explicitDynamic;
          } else {
            famDyn = explicitDynamic;
          }
        } else if (isRomance) {
          // Priority: Synchronize with existing Sim romanticDynamic to prevent conflicting dynamics!
          const synchedRom = (sA.romanticDynamic && db.romanceDynamics.includes(sA.romanticDynamic))
            ? sA.romanticDynamic
            : ((sB.romanticDynamic && db.romanceDynamics.includes(sB.romanticDynamic))
              ? sB.romanticDynamic
              : (preserveManual && sA.pairwiseRelations?.[sB.id]?.dynamic && db.romanceDynamics.includes(sA.pairwiseRelations[sB.id].dynamic!)
                ? sA.pairwiseRelations[sB.id].dynamic!
                : roll(db.romanceDynamics)));
          
          romDyn = synchedRom;
          sA.romanticDynamic = synchedRom;
          sB.romanticDynamic = synchedRom;
          if (!sA.customDynamics) sA.customDynamics = {};
          sA.customDynamics[sB.id] = synchedRom;
          if (!sB.customDynamics) sB.customDynamics = {};
          sB.customDynamics[sA.id] = synchedRom;

          // Always ensure couple has biologically reproducible pairing disregarding gender
          synchronizeCouplePregnancy(sA, sB);
        } else if (preserveManual && sA.pairwiseRelations?.[sB.id]?.dynamic) {
          const prev = sA.pairwiseRelations[sB.id].dynamic;
          if (prev && prev !== "None") {
            if (db.romanceDynamics.includes(prev)) romDyn = prev;
            else famDyn = prev;
          }
        } else if (isFamily) {
          if (["Parent", "Child", "Grandchild", "Grandparent", "Aunt/Uncle", "Niece/Nephew"].includes(relAtoB)) famDyn = roll(db.familyDynamicsAuth);
          else famDyn = roll(db.familyDynamicsPeer);
        }
      }

      const activeDyn = famDyn !== "None" ? famDyn : (romDyn !== "None" ? romDyn : "None");
      let dynStr = "";
      if (romDyn !== "None") dynStr += `<span class="dyn-tag">❤️ ${romDyn}</span>`;
      if (famDyn !== "None") dynStr += `<span class="dyn-tag">👨‍👩‍👧 ${famDyn}</span>`;

      let fBtoA = formatRel(relBtoA, sB.baseGender, sB.isPet);
      let fAtoB = formatRel(relAtoB, sA.baseGender, sA.isPet);

      const formatRelText = (formatted: string) => {
        if (formatted.includes("Household Member") || formatted.includes("Roommate / Housemate") || formatted === "Not Related" || formatted.startsWith("Not Related")) {
          return `<span class="text-emerald-400 font-semibold">Household Member</span> 👤`;
        }
        return formatted;
      };

      sA.relationsList.push(`<div class="rel-item"><b>Sim ${sB.id}:</b> ${formatRelText(fBtoA)} ${dynStr}</div>`);
      sB.relationsList.push(`<div class="rel-item"><b>Sim ${sA.id}:</b> ${formatRelText(fAtoB)} ${dynStr}</div>`);

      // Store structured pairwise relation for rich UI interaction
      sA.pairwiseRelations![sB.id] = { rawRel: relBtoA, formattedRel: fBtoA, dynamicStr: dynStr, dynamic: activeDyn };
      sB.pairwiseRelations![sA.id] = { rawRel: relAtoB, formattedRel: fAtoB, dynamicStr: dynStr, dynamic: activeDyn };
    }
  }

  // --- CONNECTED COMPONENTS & INDEPENDENT FAMILY / ROOMMATE CLUSTERING ---
  const parentMap = new Map<number, number>();
  function find(x: number): number {
    if (!parentMap.has(x)) parentMap.set(x, x);
    if (parentMap.get(x) !== x) {
      parentMap.set(x, find(parentMap.get(x)!));
    }
    return parentMap.get(x)!;
  }
  function union(x: number, y: number) {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parentMap.set(rx, ry);
  }

  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      const sA = household[i], sB = household[j];
      if (sA.isPet || sB.isPet || sA.occult === "Imaginary Friend" || sB.occult === "Imaginary Friend") continue;
      const rel = sA.pairwiseRelations?.[sB.id]?.rawRel;
      if (rel && rel !== "Not Related" && rel !== "Owner" && rel !== "Pet" && rel !== "Roommate") {
        union(sA.id, sB.id);
      }
    }
  }

  const componentMembers = new Map<number, number[]>();
  for (const s of household) {
    if (s.isPet || s.occult === "Imaginary Friend") continue;
    const root = find(s.id);
    if (!componentMembers.has(root)) componentMembers.set(root, []);
    componentMembers.get(root)!.push(s.id);
  }

  // Separate multi-member families from solo roommates
  const multiMemberComponents: [number, number[]][] = [];
  const soloMemberComponents: [number, number[]][] = [];

  for (const entry of componentMembers.entries()) {
    if (entry[1].length > 1) {
      multiMemberComponents.push(entry);
    } else {
      soloMemberComponents.push(entry);
    }
  }

  multiMemberComponents.sort((a, b) => b[1].length - a[1].length || Math.min(...a[1]) - Math.min(...b[1]));
  soloMemberComponents.sort((a, b) => Math.min(...a[1]) - Math.min(...b[1]));

  const colorPalettes = [
    { badge: "bg-indigo-950/80 text-indigo-300 border-indigo-500/50" },
    { badge: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50" },
    { badge: "bg-amber-950/80 text-amber-300 border-amber-500/50" },
    { badge: "bg-rose-950/80 text-rose-300 border-rose-500/50" },
    { badge: "bg-cyan-950/80 text-cyan-300 border-cyan-500/50" },
  ];

  let unitIndex = 1;
  const rootBranchInfo = new Map<number, { name: string; badge: string; unitId: number; isRoommate: boolean }>();

  for (const [root] of multiMemberComponents) {
    const palette = colorPalettes[unitIndex - 1] || {
      badge: "bg-purple-950/80 text-purple-300 border-purple-500/50"
    };

    let displayName = unitIndex === 1
      ? (multiMemberComponents.length > 1 ? "🏡 Family Unit 1" : "🏡 Family Unit 1")
      : `🏡 Family Unit ${unitIndex} (Independent Co-living Family)`;

    rootBranchInfo.set(root, {
      name: displayName,
      badge: palette.badge,
      unitId: unitIndex,
      isRoommate: false
    });
    unitIndex++;
  }

  for (const [root] of soloMemberComponents) {
    rootBranchInfo.set(root, {
      name: "🤝 Independent Roommate (Unrelated to anyone in household)",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      unitId: 0,
      isRoommate: true
    });
  }

  for (const s of household) {
    if (s.isPet) {
      s.branchName = "🐾 Household Pet";
      s.branchBadge = "bg-teal-950/70 text-teal-300 border-teal-600/50";
      s.familyUnitId = 0;
      s.familyUnitName = "🐾 Household Pet";
      s.familyUnitBadge = s.branchBadge;
      s.isIndependentRoommate = false;
    } else if (s.occult === "Imaginary Friend") {
      const boundChild = household.find(other => other.id === s.linkedSimId);
      s.branchName = boundChild ? `🧸 Bound Companion (Sim ${boundChild.id})` : "🧸 Imaginary Companion";
      s.branchBadge = "bg-pink-950/70 text-pink-300 border-pink-600/50";
      s.familyUnitId = boundChild?.familyUnitId || 0;
      s.familyUnitName = s.branchName;
      s.familyUnitBadge = s.branchBadge;
      s.isIndependentRoommate = false;
    } else {
      const root = find(s.id);
      const bInfo = rootBranchInfo.get(root) || {
        name: "🤝 Independent Roommate (Unrelated to anyone in household)",
        badge: "bg-slate-800 text-slate-300 border-slate-700",
        unitId: 0,
        isRoommate: true
      };
      s.branchName = bInfo.name;
      s.branchBadge = bInfo.badge;
      s.familyUnitId = bInfo.unitId;
      s.familyUnitName = bInfo.name;
      s.familyUnitBadge = bInfo.badge;
    }
  }
}

export function getHouseholdStructureSummary(household: Sim[]) {
  const familiesMap = new Map<string, Sim[]>();
  const roommates: Sim[] = [];
  const pets: Sim[] = [];
  const companions: Sim[] = [];

  for (const sim of household) {
    if (sim.isPet) {
      pets.push(sim);
    } else if (sim.occult === 'Imaginary Friend') {
      companions.push(sim);
    } else if (sim.isIndependentRoommate || sim.branchName?.includes('Roommate')) {
      roommates.push(sim);
    } else {
      const unitKey = sim.branchName || '🏡 Family Unit 1';
      if (!familiesMap.has(unitKey)) {
        familiesMap.set(unitKey, []);
      }
      familiesMap.get(unitKey)!.push(sim);
    }
  }

  const units: {
    title: string;
    badge: string;
    sims: Sim[];
    type: 'family' | 'roommates' | 'pets' | 'companions';
  }[] = [];

  familiesMap.forEach((sims, title) => {
    units.push({
      title,
      badge: sims[0]?.branchBadge || 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
      sims,
      type: 'family'
    });
  });

  if (roommates.length > 0) {
    units.push({
      title: roommates.length > 1 ? `🤝 Independent Roommates (${roommates.length})` : '🤝 Independent Roommate',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      sims: roommates,
      type: 'roommates'
    });
  }

  if (pets.length > 0) {
    units.push({
      title: `🐾 Pets (${pets.length})`,
      badge: 'bg-teal-950/70 text-teal-300 border-teal-600/50',
      sims: pets,
      type: 'pets'
    });
  }

  if (companions.length > 0) {
    units.push({
      title: `🧸 Companions (${companions.length})`,
      badge: 'bg-pink-950/70 text-pink-300 border-pink-600/50',
      sims: companions,
      type: 'companions'
    });
  }

  let householdType = "Single Family Household 🏡";
  const numFamilies = familiesMap.size;
  if (numFamilies >= 2) {
    householdType = roommates.length > 0
      ? "Multi-Family & Roommate Co-living 🏡🤝🏡"
      : "Multi-Family Co-living (Multiple Independent Families) 🏡🏡";
  } else if (numFamilies === 1 && roommates.length > 0) {
    householdType = "Family & Roommate Co-living 🏡🤝";
  } else if (numFamilies === 0 && roommates.length > 0) {
    householdType = "Roommate Collective (All Independent) 🤝";
  }

  return { units, householdType, numFamilies, numRoommates: roommates.length };
}

export { masterConflicts };
