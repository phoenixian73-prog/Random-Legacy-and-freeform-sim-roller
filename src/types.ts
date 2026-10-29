export interface TraitConflict {
  name: string;
  conflicts: string[];
}

export interface Sim {
  id: number;
  isPet: boolean;
  isFunctional: boolean;
  species: string;
  stage: string;
  ghost: boolean;
  cause: string;
  occult: string;
  modules: string[];
  baseGender: string;
  genderIdentity?: string;
  pronouns?: string;
  gender: string;
  pref: string;
  pregnancy: string;
  milk: string;
  toilet: string;
  attracted: string;
  exploring: string;
  woohoo: string;
  traits: string[];
  supplementaryTraits?: string[]; // For pets to have backup choices
  hobby: string;
  asp: string;
  career: string;
  bounds: {
    phys: string;
    nonphys: string;
    woo: string;
    flex: string;
  } | null;
  relationsList: string[];
  baseRel?: string;
  linkedSimId?: number;
  childSkills?: ChildMultiSkills;
  toddlerSkills?: ToddlerSkills;
  horseSkills?: HorseSkills;
  unlockedAdultSkills?: string[];
  rewardTraits?: string[];
  customRelations?: Record<number, string>;
  customDynamics?: Record<number, string>;
  branchName?: string;
  branchBadge?: string;
  familyUnitId?: number;
  familyUnitName?: string;
  familyUnitBadge?: string;
  familyUnitRole?: string;
  isIndependentRoommate?: boolean;
  pairwiseRelations?: Record<number, { rawRel: string; formattedRel: string; dynamicStr: string; dynamic?: string }>;
  familyDynamic?: string;
  romanticDynamic?: string;
  isNextHeir?: boolean;
  isAdopted?: boolean;
  isDoll?: boolean;
  isMadeReal?: boolean;
  isDeceased?: boolean;
  partnerStatus?: 'Married' | 'Engaged' | 'Dating' | 'Domestic Partner' | 'WooHoo Partner' | 'Divorced / Co-parent';
  helperType?: 'Roommate' | 'Brother' | 'Sister' | 'Uncle' | 'Aunt' | 'Cousin' | 'Grandparent' | 'Royal Retainer';
  isMovedOutSpare?: boolean;
  movedOutTo?: string;
  movedOutGen?: number;
  movedOutRelationToHeir?: string;
}

export type RelationMode = 'mixed' | 'multiFamily' | 'familyOnly' | 'unrelatedOnly';

export interface ChildMultiSkills {
  Creativity: number;
  Mental: number;
  Motor: number;
  Social: number;
}

export interface ToddlerSkills {
  Communication: number;
  Imagination: number;
  Movement: number;
  Potty: number;
  Thinking: number;
}

export interface HorseSkills {
  Agility: number;
  Endurance: number;
  Jumping: number;
  Temperament: number;
}

export type DwellingType = 
  | 'Standard Residential'
  | 'Tiny Home'
  | 'Haunted Home'
  | 'Residential Rental'
  | 'Apartment'
  | 'Penthouse';

export type TinyHomeTier = 
  | 'Tier 1: Micro Home (Max 32 tiles)'
  | 'Tier 2: Tiny Home (Max 64 tiles)'
  | 'Tier 3: Small Home (Max 100 tiles)';

export type RentalUnitRuleKey =
  | 'No Social Events'
  | 'No Loud Noises'
  | 'Maximum Occupancy'
  | 'No Trash Overload'
  | 'No Pets'
  | 'No Ghosts';

export interface RentalUnitConfig {
  unitNumber: number;
  activeRules: RentalUnitRuleKey[];
  maxOccupancyLimit?: number;
}

export interface ResidentialRentalConfig {
  heirUnitNumber: number; // 1 to 10 (which unit the Heir occupies)
  selectedUnitNumber: number; // 1 to 10 (slider selected unit)
  totalUnits: number; // 1 to 10
  units: Record<number, RentalUnitConfig>;
}

export interface Lot {
  world: string;
  neighborhood: string; // The sub-neighbourhood
  lotName?: string; // Optional/legacy
  dwellingType: DwellingType;
  tinyHomeTier?: TinyHomeTier;
  dwellingDescription?: string;
  dwellingPerks?: string[];
  isApartmentApplicable?: boolean;
  lotTraits: string[];
  lotChallenges: string[];
  lotType?: 'Residential' | 'Community';
  isGalleryRegeneration?: boolean;
  redesignResidential?: boolean;
  rentalConfig?: ResidentialRentalConfig;
}

export interface Memory {
  lot: Lot;
  household: Sim[];
  timestamp: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: 'major' | 'minor';
  tag: string;
  highlights: string[];
  details: string[];
}

export type { ChildAspirationCategory, ChildMilestone, ChildAspiration } from "./data/childAspirations";
