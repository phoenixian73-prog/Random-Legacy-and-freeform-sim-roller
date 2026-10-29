import { Sim } from "../types";
import { db } from "../data/simData";
import { ASPIRATION_CAREER_RULES, ASPIRATION_SPECIAL_RESTRICTIONS } from "../data/legacyChallengeData";

export interface AspirationRuleCheckResult {
  hasCareerConflict: boolean;
  hasSpecialRestriction: boolean;
  isAllowed: boolean;
  requiredCareerSummary?: string;
  suggestedCareers: string[];
  specialRestrictionText?: string;
  specialRestrictionDetails?: string;
}

// Categorized structure of all adult & teen aspirations for clean UI dropdowns
export interface AspirationGroup {
  category: string;
  icon: string;
  aspirations: {
    name: string;
    requiresCareer?: string;
    specialRestriction?: string;
  }[];
}

export const ASPIRATION_CATEGORIES: AspirationGroup[] = [
  {
    category: "Creativity",
    icon: "🎨",
    aspirations: [
      { name: "Bestselling Author", requiresCareer: "Writer (Author), Freelance Author, Writer (Journalist)" },
      { name: "Painter Extraordinaire", requiresCareer: "Freelance Painter or Painter" },
      { name: "Musical Genius", requiresCareer: "Freelance Musician or Entertainer (Musician)" },
      { name: "Master Actor", requiresCareer: "Acting Career" },
      { name: "Master Maker", requiresCareer: "Freelance Candle Maker, Maker, or Civil Designer" },
      { name: "Lord/Lady of the Knits" },
    ]
  },
  {
    category: "Deviance",
    icon: "😈",
    aspirations: [
      { name: "Public Enemy", requiresCareer: "Criminal (any)" },
      { name: "Chief of Mischief" },
      { name: "Villainous Valentine" },
      { name: "Seeker of Secrets" },
      { name: "Sticky Fingers" },
      { name: "Master of Grudges" },
      { name: "Social Puppeteer" },
    ]
  },
  {
    category: "Family",
    icon: "👨‍👩‍👧‍👦",
    aspirations: [
      { name: "Big Happy Family", specialRestriction: "Must have at least 3 children" },
      { name: "Successful Lineage", specialRestriction: "Must not be a deadbeat parent" },
      { name: "Super Parent", specialRestriction: "Must not be a deadbeat parent" },
      { name: "Vampire Family" },
    ]
  },
  {
    category: "Food",
    icon: "🍳",
    aspirations: [
      { name: "Master Chef", requiresCareer: "Culinary (any)" },
      { name: "Master Mixologist", requiresCareer: "Culinary (Mixologist)" },
      { name: "Expert Nectar Maker" },
      { name: "Appliance Wiz" },
    ]
  },
  {
    category: "Fortune",
    icon: "💰",
    aspirations: [
      { name: "Fabulously Wealthy" },
      { name: "Mansion Baron" },
      { name: "Market Magnate" },
      { name: "Five-Star Property Owner" },
    ]
  },
  {
    category: "Knowledge",
    icon: "🧠",
    aspirations: [
      { name: "Computer Whiz", requiresCareer: "Tech Guru (any)" },
      { name: "Renaissance Sim", requiresCareer: "Career Hopper" },
      { name: "Archaeology Scholar", requiresCareer: "Archaeologist or Treasure Hunter" },
      { name: "Academic", specialRestriction: "Must go to University and get a degree and job" },
      { name: "Spellcraft & Sorcery", specialRestriction: "Must Become a Spellcaster" },
      { name: "Nerd Brain" },
      { name: "Master Vampire" },
      { name: "Ghost Historian" },
      { name: "Master Mentor" },
      { name: "Elixir Enthusiast" },
    ]
  },
  {
    category: "Location",
    icon: "🗺️",
    aspirations: [
      { name: "StrangerVille Mystery", requiresCareer: "Doomsday Preppers or Military" },
      { name: "City Native" },
      { name: "Beach Life" },
      { name: "Mt. Komorebi Sightseer" },
      { name: "Perfectly Pristine" },
      { name: "Fabulously Filthy" },
      { name: "Fount of Tomarani Knowledge" },
    ]
  },
  {
    category: "Love",
    icon: "💖",
    aspirations: [
      { name: "Soulmate", specialRestriction: "Must marry (not single parent)" },
      { name: "Serial Romantic" },
      { name: "Romantic Explorer" },
      { name: "Paragon Partner" },
    ]
  },
  {
    category: "Nature",
    icon: "🌿",
    aspirations: [
      { name: "Jungle Explorer", requiresCareer: "Treasure Hunter or Archaeologist" },
      { name: "Eco Innovator", requiresCareer: "Civil Designer" },
      { name: "Purveyor of Potions", specialRestriction: "Must become a Spellcaster" },
      { name: "Friend of the Animals", specialRestriction: "Must add 2 companion pets to household" },
      { name: "Freelance Botanist" },
      { name: "The Curator" },
      { name: "Angling Ace" },
      { name: "Outdoor Enthusiast" },
      { name: "Country Caretaker" },
      { name: "Crystal Crafter" },
      { name: "Nature Nomad" },
      { name: "Critter Hunter" },
    ]
  },
  {
    category: "Popularity",
    icon: "⭐",
    aspirations: [
      { name: "Joke Star", requiresCareer: "Entertainer (Comedian)" },
      { name: "Party Animal" },
      { name: "Friend of the World" },
      { name: "Neighborhood Confidante" },
      { name: "Leader of the Pack" },
      { name: "Good Vampire" },
      { name: "World-Famous Celebrity" },
      { name: "Discerning Dweller" },
      { name: "Esteemed Entrepreneur" },
    ]
  },
  {
    category: "Athletic & Wellness",
    icon: "🏃‍♂️",
    aspirations: [
      { name: "Bodybuilder" },
      { name: "Extreme Sports Enthusiast" },
      { name: "Championship Rider" },
      { name: "Inner Peace" },
      { name: "Self-Care Specialist" },
      { name: "Zen Guru" },
    ]
  },
  {
    category: "Teen Exclusive",
    icon: "🎒",
    aspirations: [
      { name: "Drama Llama" },
      { name: "Goal Oriented" },
      { name: "Live Fast" },
      { name: "Admired Icon" },
    ]
  },
  {
    category: "Occult & Star Wars",
    icon: "✨",
    aspirations: [
      { name: "Fairy Stories" },
      { name: "Discordant Fairy" },
      { name: "Harmonious Fairy" },
      { name: "Hope VS Order" },
      { name: "Paragon of Hope" },
      { name: "Enforcer of Order" },
      { name: "Galactic Privateer" },
    ]
  }
];

/**
 * Strips HTML tags and normalizes career text
 */
export function cleanCareerText(career: string | undefined): string {
  if (!career || career === "N/A") return "";
  return career.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Check if a Sim's current career satisfies the PieceOfPrincess rules for the given aspiration.
 */
export function isAspirationAllowedForCareer(aspiration: string, career: string | undefined): boolean {
  if (!aspiration || aspiration === "N/A") return true;
  const cleanAsp = aspiration.trim().toLowerCase();
  const cText = cleanCareerText(career);

  // If Sim has no career yet (e.g. child, unemployed), check if aspiration strictly demands a career
  // 15 specific rules from PieceOfPrincess:
  if (cleanAsp.includes("bestselling author")) {
    return cText.includes("writer") || cText.includes("author") || cText.includes("journalist");
  }
  if (cleanAsp.includes("painter extraordinaire")) {
    return cText.includes("painter");
  }
  if (cleanAsp.includes("musical genius")) {
    return cText.includes("musician") || (cText.includes("entertainer") && !cText.includes("comedian"));
  }
  if (cleanAsp.includes("master actor") || cleanAsp.includes("master actress")) {
    return cText.includes("acting") || cText.includes("actor") || cText.includes("actress");
  }
  if (cleanAsp.includes("master maker")) {
    return cText.includes("candle maker") || cText.includes("maker") || cText.includes("civil designer");
  }
  if (cleanAsp.includes("public enemy")) {
    return cText.includes("criminal");
  }
  if (cleanAsp.includes("master chef")) {
    return cText.includes("culinary") || cText.includes("chef");
  }
  if (cleanAsp.includes("master mixologist")) {
    return cText.includes("mixologist");
  }
  if (cleanAsp.includes("computer whiz")) {
    return cText.includes("tech guru");
  }
  if (cleanAsp.includes("renaissance sim")) {
    return cText.includes("career hopper") || cText.includes("hopper");
  }
  if (cleanAsp.includes("archaeology scholar")) {
    return cText.includes("archaeolog") || cText.includes("treasure hunter");
  }
  if (cleanAsp.includes("strangerville mystery")) {
    return cText.includes("doomsday preppers") || cText.includes("military");
  }
  if (cleanAsp.includes("jungle explorer")) {
    return cText.includes("treasure hunter") || cText.includes("archaeolog");
  }
  if (cleanAsp.includes("eco innovator")) {
    return cText.includes("civil designer");
  }
  if (cleanAsp.includes("joke star")) {
    return cText.includes("comedian");
  }

  // Any other aspiration has NO career restriction!
  return true;
}

/**
 * Filter an aspiration pool so that only aspirations compatible with the Sim's career are returned.
 */
export function getCompatibleAspirationsForCareer(career: string | undefined, pool: string[]): string[] {
  const filtered = pool.filter(asp => isAspirationAllowedForCareer(asp, career));
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Inverted Mode Helper:
 * Given an aspiration, return the canonical career that should be assigned to the Sim.
 */
export function getMatchingCareerForAspiration(aspiration: string): string | null {
  const cleanAsp = aspiration.trim().toLowerCase();
  
  if (cleanAsp.includes("bestselling author")) {
    return `<strong>Conventional Career:</strong> Writer (Author)`;
  }
  if (cleanAsp.includes("painter extraordinaire")) {
    return `<strong>Unconventional Career:</strong> Freelance Painter [BG] — Sell canvases directly or via easel`;
  }
  if (cleanAsp.includes("musical genius")) {
    return `<strong>Unconventional Career:</strong> Freelance Musician [BG] — License songs and write jingles`;
  }
  if (cleanAsp.includes("master actor") || cleanAsp.includes("master actress")) {
    return `<strong>Conventional Career:</strong> Acting Career (Get Famous)`;
  }
  if (cleanAsp.includes("master maker")) {
    return `<strong>Unconventional Career:</strong> Freelance Candle Maker [EL] — Craft and sell eco candles`;
  }
  if (cleanAsp.includes("public enemy")) {
    return `<strong>Conventional Career:</strong> Criminal (Boss)`;
  }
  if (cleanAsp.includes("master chef")) {
    return `<strong>Conventional Career:</strong> Culinary (Chef)`;
  }
  if (cleanAsp.includes("master mixologist")) {
    return `<strong>Conventional Career:</strong> Culinary (Mixologist)`;
  }
  if (cleanAsp.includes("computer whiz")) {
    return `<strong>Conventional Career:</strong> Tech Guru (Start-up Entrepreneur)`;
  }
  if (cleanAsp.includes("renaissance sim")) {
    return `<strong>Career Hopper:</strong> Reach Level 3 in 5 different careers before aging up!`;
  }
  if (cleanAsp.includes("archaeology scholar")) {
    return `<strong>Unconventional Career:</strong> Archaeologist [JA] — Authenticate and sell relics`;
  }
  if (cleanAsp.includes("strangerville mystery")) {
    return `<strong>Unconventional Career:</strong> Doomsday Preppers [SV] — Stockpile rations and study anomalies`;
  }
  if (cleanAsp.includes("jungle explorer")) {
    return `<strong>Unconventional Career:</strong> Treasure Hunter [JA] — Explore Selvadorada temples`;
  }
  if (cleanAsp.includes("eco innovator")) {
    return `<strong>Conventional Career:</strong> Civil Designer (Green Technician)`;
  }
  if (cleanAsp.includes("joke star")) {
    return `<strong>Conventional Career:</strong> Entertainer (Comedian)`;
  }

  return null;
}

/**
 * Inverted Mode: Check if a career is allowed for a Sim who already holds this aspiration.
 */
export function isCareerAllowedForAspiration(career: string | undefined, aspiration: string): boolean {
  return isAspirationAllowedForCareer(aspiration, career);
}

/**
 * Full check for UI display, tooltips, warnings, and auto-align buttons.
 */
export function checkAspirationRuleStatus(
  aspiration: string,
  career: string | undefined,
  sim?: Sim,
  household?: Sim[]
): AspirationRuleCheckResult {
  const norm = aspiration.trim().toLowerCase();
  const careerRule = ASPIRATION_CAREER_RULES.find(r => 
    norm.includes(r.aspiration.toLowerCase()) || r.aspiration.toLowerCase().includes(norm)
  );
  const specialRule = ASPIRATION_SPECIAL_RESTRICTIONS.find(r => 
    norm.includes(r.aspiration.toLowerCase()) || r.aspiration.toLowerCase().includes(norm)
  );

  const isCareerOk = careerRule ? isAspirationAllowedForCareer(aspiration, career) : true;
  let isSpecialOk = true;
  let specialReason = "";

  if (specialRule) {
    if (specialRule.aspiration === "Soulmate") {
      // If sim is Heir and household is Single with no partner
      if (sim && household) {
        const hasPartner = household.some(s => s.id !== sim.id && (s.familyUnitRole === "Partner" || sim.customRelations?.[s.id] === "Spouse" || sim.customRelations?.[s.id] === "Partner"));
        if (!hasPartner && sim.familyUnitRole === "Heir") {
          isSpecialOk = false;
          specialReason = "Soulmate requires marrying a spouse (cannot remain Single Parent).";
        }
      }
    }
  }

  const hasCareerConflict = !isCareerOk;
  const hasSpecialConflict = !isSpecialOk;

  return {
    hasCareerConflict,
    hasSpecialRestriction: !!specialRule,
    isAllowed: isCareerOk && isSpecialOk,
    requiredCareerSummary: careerRule?.description,
    suggestedCareers: careerRule?.allowedCareers || [],
    specialRestrictionText: specialRule?.restriction,
    specialRestrictionDetails: specialReason || specialRule?.details,
  };
}
