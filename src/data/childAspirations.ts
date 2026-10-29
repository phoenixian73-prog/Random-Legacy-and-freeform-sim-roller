import { ChildMultiSkills } from "../types";

export type ChildAspirationCategory = "Creativity" | "Motor" | "Social" | "Mental";

export interface ChildMilestone {
  tier: number;
  title: string;
  tasks: string[];
  skillRequirements?: {
    skill: "Creativity" | "Mental" | "Motor" | "Social";
    level: number;
  }[];
}

export interface ChildAspiration {
  id: string;
  name: string;
  category: ChildAspirationCategory;
  description: string;
  pack: string;
  packBadge: string;
  categoryColor: {
    bg: string;
    text: string;
    border: string;
    pill: string;
  };
  rewardTrait: {
    name: string;
    description: string;
  };
  milestones: ChildMilestone[];
}

export const childAspirationsData: ChildAspiration[] = [
  // 1. Creativity Aspirations (2)
  {
    id: "artistic-prodigy",
    name: "Artistic Prodigy",
    category: "Creativity",
    description: "This Sim has dreams of succeeding in the arts!",
    pack: "Base Game",
    packBadge: "TS4 Base Game",
    categoryColor: {
      bg: "bg-amber-950/40",
      text: "text-amber-300",
      border: "border-amber-500/40",
      pill: "bg-amber-500/20 text-amber-300 border-amber-500/40"
    },
    rewardTrait: {
      name: "Creatively Gifted",
      description: "Creatively Gifted Sims learn adult creative skills faster."
    },
    milestones: [
      {
        tier: 1,
        title: "Active Imagination",
        tasks: [
          "Have an Activity Table",
          "Draw 2 pictures while Inspired"
        ]
      },
      {
        tier: 2,
        title: "Daydreamer",
        tasks: [
          "Achieve level 5 Creativity skill",
          "Play with 3 toys"
        ],
        skillRequirements: [{ skill: "Creativity", level: 5 }]
      },
      {
        tier: 3,
        title: "Artistic Prodigy",
        tasks: [
          "Play instruments for 5 total hours",
          "Draw all 5 picture types on the Activity Table",
          "Achieve level 10 Creativity skill"
        ],
        skillRequirements: [{ skill: "Creativity", level: 10 }]
      }
    ]
  },
  {
    id: "creative-genius",
    name: "Creative Genius",
    category: "Creativity",
    description: "This Sim wants to build their creative and mental skills to inspire innovation and play!",
    pack: "Growing Together (EP13)",
    packBadge: "TS4 EP13 Growing Together",
    categoryColor: {
      bg: "bg-amber-950/40",
      text: "text-amber-300",
      border: "border-amber-500/40",
      pill: "bg-amber-500/20 text-amber-300 border-amber-500/40"
    },
    rewardTrait: {
      name: "Idea Person",
      description: "These Sims focused on a combination of mental and creativity skills during their childhood. Due to their efforts they can now paint, write, program, and write songs faster. Any writer's block will also vanish much more quickly!"
    },
    milestones: [
      {
        tier: 1,
        title: "Gifted Fledgling",
        tasks: [
          "Play Pretend in the Treehouse",
          "Achieve Level 3 Creativity Skill"
        ],
        skillRequirements: [{ skill: "Creativity", level: 3 }]
      },
      {
        tier: 2,
        title: "Inspired Visionary",
        tasks: [
          "Achieve Level 3 Mental Skill",
          "Stargaze"
        ],
        skillRequirements: [{ skill: "Mental", level: 3 }]
      },
      {
        tier: 3,
        title: "Best-in-Class",
        tasks: [
          "Sleep in a Treehouse for 6 hours",
          "Achieve Level 6 Creativity Skill",
          "Achieve Level 5 Mental Skill"
        ],
        skillRequirements: [
          { skill: "Creativity", level: 6 },
          { skill: "Mental", level: 5 }
        ]
      }
    ]
  },

  // 2. Motor Aspirations (2)
  {
    id: "rambunctious-scamp",
    name: "Rambunctious Scamp",
    category: "Motor",
    description: "This Sim wants to be playful and nimble!",
    pack: "Base Game",
    packBadge: "TS4 Base Game",
    categoryColor: {
      bg: "bg-emerald-950/40",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    },
    rewardTrait: {
      name: "Physically Gifted",
      description: "Physically Gifted Sims build adult physical skills faster."
    },
    milestones: [
      {
        tier: 1,
        title: "Energetic",
        tasks: [
          "Play on a Jungle Gym while Playful",
          "Achieve level 2 Motor skill"
        ],
        skillRequirements: [{ skill: "Motor", level: 2 }]
      },
      {
        tier: 2,
        title: "Agile Developer",
        tasks: [
          "Achieve level 5 Motor skill",
          "Practice typing for 4 hours"
        ],
        skillRequirements: [{ skill: "Motor", level: 5 }]
      },
      {
        tier: 3,
        title: "Rambunctious Scamp",
        tasks: [
          "Make it across the Monkey Bars 3 times",
          "Earn a High Score on the Typing Game",
          "Achieve level 10 Motor skill"
        ],
        skillRequirements: [{ skill: "Motor", level: 10 }]
      }
    ]
  },
  {
    id: "playtime-captain",
    name: "Playtime Captain",
    category: "Motor",
    description: "This Sim loves to seek out active play - with friends!",
    pack: "Growing Together (EP13)",
    packBadge: "TS4 EP13 Growing Together",
    categoryColor: {
      bg: "bg-emerald-950/40",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    },
    rewardTrait: {
      name: "Pack Animal",
      description: "These Sims love improving themselves and others together. They have faster relationship and skill gain when training with friends!"
    },
    milestones: [
      {
        tier: 1,
        title: "Silly Stomper",
        tasks: [
          "Stomp Playfully on a Splash Pad",
          "Achieve Level 3 Motor Skill"
        ],
        skillRequirements: [{ skill: "Motor", level: 3 }]
      },
      {
        tier: 2,
        title: "Talky-Talker",
        tasks: [
          "Achieve Level 3 Social Skill",
          "Become Friends with 3 Other Children"
        ],
        skillRequirements: [{ skill: "Social", level: 3 }]
      },
      {
        tier: 3,
        title: "Playground Royalty",
        tasks: [
          "Ride a Bike for 4 hours",
          "Achieve Level 6 Motor Skill",
          "Achieve Level 5 Social Skill"
        ],
        skillRequirements: [
          { skill: "Motor", level: 6 },
          { skill: "Social", level: 5 }
        ]
      }
    ]
  },

  // 3. Social Aspirations (2)
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    category: "Social",
    description: "This Sim wants to talk to everyone and make friends!",
    pack: "Base Game",
    packBadge: "TS4 Base Game",
    categoryColor: {
      bg: "bg-purple-950/40",
      text: "text-purple-300",
      border: "border-purple-500/40",
      pill: "bg-purple-500/20 text-purple-300 border-purple-500/40"
    },
    rewardTrait: {
      name: "Socially Gifted",
      description: "Socially Gifted Sims build adult social skills faster."
    },
    milestones: [
      {
        tier: 1,
        title: "Chatterbox",
        tasks: [
          "Make a friend",
          "Meet 5 new Sims"
        ]
      },
      {
        tier: 2,
        title: "Popular Kid",
        tasks: [
          "Achieve level 5 Social skill",
          "Make a BFF"
        ],
        skillRequirements: [{ skill: "Social", level: 5 }]
      },
      {
        tier: 3,
        title: "Social Butterfly",
        tasks: [
          "Become friends with 3 other children",
          "Become friends with 2 adults",
          "Achieve level 10 Social skill"
        ],
        skillRequirements: [{ skill: "Social", level: 10 }]
      }
    ]
  },
  {
    id: "slumber-party-animal",
    name: "Slumber Party Animal",
    category: "Social",
    description: "This Sim wants to be the life of the party - in a uniquely creative way!",
    pack: "Growing Together (EP13)",
    packBadge: "TS4 EP13 Growing Together",
    categoryColor: {
      bg: "bg-purple-950/40",
      text: "text-purple-300",
      border: "border-purple-500/40",
      pill: "bg-purple-500/20 text-purple-300 border-purple-500/40"
    },
    rewardTrait: {
      name: "Practiced Host",
      description: "These Sims are some of the best event hosts. Their friendly and funny socials during parties will always succeed."
    },
    milestones: [
      {
        tier: 1,
        title: "Pajama Wearer",
        tasks: [
          "Attend a Slumber Party",
          "Achieve Level 3 Social Skill"
        ],
        skillRequirements: [{ skill: "Social", level: 3 }]
      },
      {
        tier: 2,
        title: "Storyteller",
        tasks: [
          "Achieve Level 3 Creativity Skill",
          "Tell 3 Stories from a Sleeping Bag",
          "Exchange a Friendship Bracelet"
        ],
        skillRequirements: [{ skill: "Creativity", level: 3 }]
      },
      {
        tier: 3,
        title: "Host with the Most",
        tasks: [
          "Achieve Gold in a Slumber Party Event",
          "Achieve Level 6 Social Skill",
          "Achieve Level 5 Creativity Skill"
        ],
        skillRequirements: [
          { skill: "Social", level: 6 },
          { skill: "Creativity", level: 5 }
        ]
      }
    ]
  },

  // 4. Mental Aspirations (2)
  {
    id: "whiz-kid",
    name: "Whiz Kid",
    category: "Mental",
    description: "This Sim wants to be the smartest kid in school!",
    pack: "Base Game",
    packBadge: "TS4 Base Game",
    categoryColor: {
      bg: "bg-sky-950/40",
      text: "text-sky-300",
      border: "border-sky-500/40",
      pill: "bg-sky-500/20 text-sky-300 border-sky-500/40"
    },
    rewardTrait: {
      name: "Mentally Gifted",
      description: "Mentally Gifted Sims build adult mental skills faster."
    },
    milestones: [
      {
        tier: 1,
        title: "Precocious",
        tasks: [
          "Read with an Adult for 2 hours",
          "Play 3 Games of Chess"
        ]
      },
      {
        tier: 2,
        title: "Junior Scientist",
        tasks: [
          "Achieve level 5 Mental skill",
          "Finish Homework 2 times while Focused"
        ],
        skillRequirements: [{ skill: "Mental", level: 5 }]
      },
      {
        tier: 3,
        title: "Whiz Kid",
        tasks: [
          "Achieve a grade of \"A\" at school",
          "Craft 3 Emotional Potions",
          "Achieve level 10 Mental skill"
        ],
        skillRequirements: [{ skill: "Mental", level: 10 }]
      }
    ]
  },
  {
    id: "mind-and-body",
    name: "Mind and Body",
    category: "Mental",
    description: "This Sim wants to master both their mind and body!",
    pack: "Growing Together (EP13)",
    packBadge: "TS4 EP13 Growing Together",
    categoryColor: {
      bg: "bg-sky-950/40",
      text: "text-sky-300",
      border: "border-sky-500/40",
      pill: "bg-sky-500/20 text-sky-300 border-sky-500/40"
    },
    rewardTrait: {
      name: "Headstrong",
      description: "These Sims have learned to discipline their body and minds. Their Focused and Confident moodlets will last longer!"
    },
    milestones: [
      {
        tier: 1,
        title: "Confident Kiddo",
        tasks: [
          "Become Confident",
          "Achieve Level 3 Mental Skill"
        ],
        skillRequirements: [{ skill: "Mental", level: 3 }]
      },
      {
        tier: 2,
        title: "Super Bike Tyke",
        tasks: [
          "Achieve Level 3 Motor Skill",
          "Learn to ride a Bike"
        ],
        skillRequirements: [{ skill: "Motor", level: 3 }]
      },
      {
        tier: 3,
        title: "Master of Control",
        tasks: [
          "Go 12 Hours without a Negative Need Moodlet",
          "Achieve Level 6 Mental Skill",
          "Achieve Level 5 Motor Skill"
        ],
        skillRequirements: [
          { skill: "Mental", level: 6 },
          { skill: "Motor", level: 5 }
        ]
      }
    ]
  }
];

export const childAspirationMap: Record<string, ChildAspiration> = {};
childAspirationsData.forEach(asp => {
  childAspirationMap[asp.name] = asp;
});

export const childAspirationCategories: ChildAspirationCategory[] = [
  "Creativity",
  "Motor",
  "Social",
  "Mental"
];

export const childAspirationsByCategory: Record<ChildAspirationCategory, ChildAspiration[]> = {
  Creativity: childAspirationsData.filter(a => a.category === "Creativity"),
  Motor: childAspirationsData.filter(a => a.category === "Motor"),
  Social: childAspirationsData.filter(a => a.category === "Social"),
  Mental: childAspirationsData.filter(a => a.category === "Mental"),
};

/**
 * Checks milestone skill fulfillment based on a child's current 4 multi-skills
 */
export function checkMilestoneSkillCompletion(
  milestone: ChildMilestone,
  skills?: ChildMultiSkills
): { fulfilled: boolean; details: { skill: string; required: number; current: number; met: boolean }[] } {
  if (!milestone.skillRequirements || milestone.skillRequirements.length === 0) {
    return { fulfilled: true, details: [] };
  }
  if (!skills) {
    return {
      fulfilled: false,
      details: milestone.skillRequirements.map(sr => ({
        skill: sr.skill,
        required: sr.level,
        current: 1,
        met: false
      }))
    };
  }

  const details = milestone.skillRequirements.map(sr => {
    const current = skills[sr.skill] || 1;
    return {
      skill: sr.skill,
      required: sr.level,
      current,
      met: current >= sr.level
    };
  });

  const fulfilled = details.every(d => d.met);
  return { fulfilled, details };
}

/**
 * Checks if the child's multi-skills satisfy the Tier 3 requirements for their aspiration reward trait
 */
export function checkChildAspirationTier3Met(
  aspirationName: string,
  skills?: ChildMultiSkills
): boolean {
  const asp = childAspirationMap[aspirationName];
  if (!asp) return false;
  const tier3 = asp.milestones.find(m => m.tier === 3);
  if (!tier3) return false;
  return checkMilestoneSkillCompletion(tier3, skills).fulfilled;
}
