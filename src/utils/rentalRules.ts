import { RentalUnitRuleKey, RentalUnitConfig, ResidentialRentalConfig } from '../types';

export interface RentalUnitRuleDefinition {
  name: RentalUnitRuleKey;
  label: string;
  category: string;
  description: string;
  heirEnforcement: string;
  iconType: 'social' | 'noise' | 'occupancy' | 'trash' | 'pets' | 'ghosts';
}

export const ALL_RENTAL_UNIT_RULES: RentalUnitRuleDefinition[] = [
  {
    name: 'No Social Events',
    label: 'No Social Events',
    category: 'Gatherings & Parties',
    description: 'Tenants cannot host social events, parties, birthdays, or public celebrations in this unit.',
    heirEnforcement: 'Heir household may not host any social events or throw house parties in this unit. Violations result in lease fines and tenant friction!',
    iconType: 'social'
  },
  {
    name: 'No Loud Noises',
    label: 'No Loud Noises',
    category: 'Noise Disturbance',
    description: 'No loud music, musical instruments, yelling, booming stereos, or late-night disturbance.',
    heirEnforcement: 'Heir Sims cannot play instruments or blast stereos at high volume. Keep music quiet to avoid noise complaints and landlord visits!',
    iconType: 'noise'
  },
  {
    name: 'Maximum Occupancy',
    label: 'Maximum Occupancy',
    category: 'Household Capacity',
    description: 'Strict limit on the number of Sims who may occupy, sleep, or live in this unit.',
    heirEnforcement: 'Strict occupancy limit enforced! The Heir household cannot exceed the unit cap (default max 4–6 Sims). Move out adult spares via Manage Households to stay compliant!',
    iconType: 'occupancy'
  },
  {
    name: 'No Trash Overload',
    label: 'No Trash Overload',
    category: 'Cleanliness & Sanitation',
    description: 'Trash must be taken out immediately. No overflowing bins, trash piles, or unhygienic conditions.',
    heirEnforcement: 'Heir Sims must immediately dispose of all trash, clean dirty plates, and empty indoor bins. Overflowing trash summons pests and incurs landlord penalties!',
    iconType: 'trash'
  },
  {
    name: 'No Pets',
    label: 'No Pets',
    category: 'Animals',
    description: 'No dogs, cats, or horses permitted inside this residential rental unit.',
    heirEnforcement: 'Heir household cannot adopt, breed, or house pets inside the rental unit. Animal lovers must relocate pets or live elsewhere!',
    iconType: 'pets'
  },
  {
    name: 'No Ghosts',
    label: 'No Ghosts',
    category: 'Supernatural / Occult',
    description: 'No playable or non-playable ghosts, urns, or hauntings permitted inside this unit.',
    heirEnforcement: 'Urns and tombstones must not be placed inside the unit, and ghost Sims are strictly prohibited from residing in this rental unit!',
    iconType: 'ghosts'
  }
];

export const ALL_RENTAL_RULE_NAMES: RentalUnitRuleKey[] = ALL_RENTAL_UNIT_RULES.map(r => r.name);

/**
 * Decreasing probability (degressive) distribution for the number of rules enforced by the landlord.
 * 0 and 1 rules are very common, while 5 and 6 rules are rare.
 */
export const RULE_COUNT_PROBABILITIES = [
  { count: 0, weight: 15, pct: '15%', label: 'Hands-off / Lenient Landlord' },
  { count: 1, weight: 35, pct: '35%', label: 'Standard / Common Landlord' },
  { count: 2, weight: 25, pct: '25%', label: 'Attentive Landlord' },
  { count: 3, weight: 14, pct: '14%', label: 'Strict Landlord' },
  { count: 4, weight: 7, pct: '7%', label: 'Overbearing Landlord (Rare)' },
  { count: 5, weight: 3, pct: '3%', label: 'Tyrannical Landlord (Very Rare)' },
  { count: 6, weight: 1, pct: '1%', label: 'Totalitarian Nightmare (Extreme 1%)' },
];

/**
 * Rolls rule count using the degressive (decreasing probability) curve.
 */
export function rollDegressiveRuleCount(): number {
  const totalWeight = RULE_COUNT_PROBABILITIES.reduce((acc, r) => acc + r.weight, 0); // 100
  let rand = Math.random() * totalWeight;
  for (const item of RULE_COUNT_PROBABILITIES) {
    if (rand < item.weight) return item.count;
    rand -= item.weight;
  }
  return 1;
}

/**
 * Gets probability info for a given rule count.
 */
export function getRuleCountOddsInfo(count: number) {
  const clamped = Math.max(0, Math.min(6, count));
  return RULE_COUNT_PROBABILITIES.find(p => p.count === clamped) || RULE_COUNT_PROBABILITIES[1];
}

/**
 * Rolls 0 to 6 rules for a specific rental unit using decreasing probability.
 */
export function rollUnitRules(
  unitNumber: number,
  ruleCount?: number,
  useDegressive: boolean = true
): RentalUnitConfig {
  const count = ruleCount !== undefined
    ? Math.max(0, Math.min(6, ruleCount))
    : (useDegressive ? rollDegressiveRuleCount() : Math.floor(Math.random() * 7));

  const shuffled = [...ALL_RENTAL_RULE_NAMES].sort(() => 0.5 - Math.random());
  const activeRules = shuffled.slice(0, count);

  return {
    unitNumber,
    activeRules,
    maxOccupancyLimit: activeRules.includes('Maximum Occupancy') ? 4 : undefined
  };
}

/**
 * Generates or synchronizes Residential Rental configuration.
 * - Total units ranges from 1 to 10 (default 4-6).
 * - Heir is assigned to a valid unit within 1..totalUnits.
 * - Only the Heir's unit rolls rules of the owner/landlord (using degressive probability).
 * - Other units don't need a set of rules rolled (kept clean/empty).
 */
export function generateResidentialRentalConfig(
  existing?: Partial<ResidentialRentalConfig>,
  ensureHeirHasAdequateRules: boolean = true
): ResidentialRentalConfig {
  const totalUnits = existing?.totalUnits && existing.totalUnits >= 1 && existing.totalUnits <= 10
    ? existing.totalUnits
    : 4; // Default 4 units for standard TS4 rental plot

  const heirUnitNumber = existing?.heirUnitNumber && existing.heirUnitNumber >= 1 && existing.heirUnitNumber <= totalUnits
    ? existing.heirUnitNumber
    : (Math.floor(Math.random() * totalUnits) + 1); // Dynamic unit 1..totalUnits

  const selectedUnitNumber = existing?.selectedUnitNumber && existing.selectedUnitNumber >= 1 && existing.selectedUnitNumber <= totalUnits
    ? existing.selectedUnitNumber
    : heirUnitNumber;

  const units: Record<number, RentalUnitConfig> = {};

  for (let u = 1; u <= totalUnits; u++) {
    if (u === heirUnitNumber) {
      if (existing?.units && existing.units[u] && existing.units[u].activeRules.length > 0) {
        units[u] = { ...existing.units[u], unitNumber: u };
      } else {
        // Roll for Heir using decreasing probability (ensure at least 1-3 if requested)
        const count = ensureHeirHasAdequateRules ? Math.max(1, rollDegressiveRuleCount()) : rollDegressiveRuleCount();
        units[u] = rollUnitRules(u, count, true);
      }
    } else {
      // Other neighbor units don't need a set of rules rolled
      units[u] = {
        unitNumber: u,
        activeRules: []
      };
    }
  }

  return {
    heirUnitNumber,
    selectedUnitNumber,
    totalUnits,
    units
  };
}

/**
 * Dynamically assigns the Heir to a random unit among the available total units (1..totalUnits)
 * and rolls the landlord rules for that unit.
 */
export function assignRandomHeirUnit(
  config: ResidentialRentalConfig,
  customRuleCount?: number
): ResidentialRentalConfig {
  const total = Math.max(1, Math.min(10, config.totalUnits || 4));
  const newHeirUnit = Math.floor(Math.random() * total) + 1;
  const count = customRuleCount !== undefined ? customRuleCount : Math.max(1, rollDegressiveRuleCount());
  const heirRules = rollUnitRules(newHeirUnit, count, true);

  const updatedUnits: Record<number, RentalUnitConfig> = {};
  for (let u = 1; u <= total; u++) {
    if (u === newHeirUnit) {
      updatedUnits[u] = heirRules;
    } else {
      updatedUnits[u] = {
        unitNumber: u,
        activeRules: []
      };
    }
  }

  return {
    ...config,
    totalUnits: total,
    heirUnitNumber: newHeirUnit,
    selectedUnitNumber: newHeirUnit,
    units: updatedUnits
  };
}
