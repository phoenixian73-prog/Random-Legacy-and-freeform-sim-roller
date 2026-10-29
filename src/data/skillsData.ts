export type SkillType = 
  | 'Major (Level 10)'
  | 'Minor (Level 5)'
  | 'Special (Level 15)'
  | 'Toddler Fundamental (Level 5)'
  | 'Toddler Potty (Level 3)'
  | 'Child Fundamental (Level 10)'
  | 'Horse Skill (Level 10)';

export type SkillCategory =
  | 'Base Game'
  | 'Fundamental Skills'
  | 'Expansion Packs'
  | 'Game & Stuff Packs'
  | 'Horse Skills';

export type TargetLifeStage = 
  | 'Toddler' 
  | 'Child' 
  | 'Teen' 
  | 'Young Adult' 
  | 'Adult' 
  | 'Elder' 
  | 'Horse';

export interface SkillItem {
  id: string;
  name: string;
  pack: string;
  packType: 'Base Game' | 'Expansion Pack' | 'Game Pack' | 'Stuff Pack';
  category: SkillCategory;
  skillType: SkillType;
  maxLevel: number;
  mentorLevel: number | null;
  mentorFrom: string | null;
  description: string;
  howToImprove: string;
  icon: string;
  targetStages: TargetLifeStage[];
  correspondingChildSkill?: string; // For toddler skills
  unlockedAdultSkills?: string[]; // For child skills
}

export interface ToddlerConversionRule {
  toddlerSkill: string;
  childSkill: string;
  notes: string;
}

export const toddlerConversionTable: ToddlerConversionRule[] = [
  { toddlerSkill: "Communication", childSkill: "Social", notes: "Builds foundation for Social skill." },
  { toddlerSkill: "Imagination", childSkill: "Creativity", notes: "Builds foundation for Creativity skill." },
  { toddlerSkill: "Movement", childSkill: "Motor", notes: "Builds foundation for Motor skill." },
  { toddlerSkill: "Thinking", childSkill: "Mental", notes: "Builds foundation for Mental skill." },
  { toddlerSkill: "Potty", childSkill: "N/A", notes: "No direct child skill, but saves Sims from messy accidents!" }
];

export interface AgingLevelConversion {
  toddlerLevel: number;
  childLevelCompleted: string;
  percentToNextLevel: string;
}

export const agingConversionBreakdown: AgingLevelConversion[] = [
  { toddlerLevel: 1, childLevelCompleted: "None", percentToNextLevel: "0% (Starts at Level 1)" },
  { toddlerLevel: 2, childLevelCompleted: "Level 1 and 45% of next level", percentToNextLevel: "55% to Level 2" },
  { toddlerLevel: 3, childLevelCompleted: "Level 1 and 90% of next level", percentToNextLevel: "10% to Level 2" },
  { toddlerLevel: 4, childLevelCompleted: "Level 2 and 44% of next level", percentToNextLevel: "56% to Level 3" },
  { toddlerLevel: 5, childLevelCompleted: "Level 2 and 94% of next level", percentToNextLevel: "6% to Level 3" }
];

export interface ToddlerBonusTrait {
  name: string;
  requirement: string;
  benefit: string;
  icon: string;
}

export const toddlerBonusTraits: ToddlerBonusTrait[] = [
  {
    name: "Happy Toddler",
    requirement: "Reached at least Level 3 in four fundamental skills",
    benefit: "Boosts all skill gains by 10% for the rest of their life.",
    icon: "😊"
  },
  {
    name: "Top Notch Toddler",
    requirement: "Reached maximum Level 5 in all four core fundamentals (Communication, Imagination, Movement, Thinking; except Potty)",
    benefit: "Boosts all skill gains and career performance gains by 25% for the rest of their life.",
    icon: "🌟"
  }
];

export const allSkillsData: SkillItem[] = [
  // 1. The Sims 4 - Base Game (20 skills)
  {
    id: "charisma",
    name: "Charisma",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Mirror or Podium (City Living)",
    description: "When in a conversation, Charisma skill can be your best friend. Whether making friends, romancing, or calming down strangers, the charismatic Sim knows how to proceed.",
    howToImprove: "Charisma can be worked on in the mirror or in conversations with other Sims. Increasing this skill will unlock new Socials as well as Social Media Interactions on the Computer. Charisma can be mentored at Skill level 5 from a Mirror or Podium (City Living).",
    icon: "💬",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "comedy",
    name: "Comedy",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Microphone",
    description: "As soon as one realizes that everything is a joke, being a comedian is the only thing that makes sense.",
    howToImprove: "Comedy skill is useful when talking with other Sims and with the microphone stand. Increasing this skill will unlock new Joke Socials, Comedy Routines, and the ability to Improvise Routines on a Microphone. Comedy can be mentored at Skill level 5 from a Microphone.",
    icon: "🎭",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "cooking",
    name: "Cooking",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Fridge, Stove, or Oven",
    description: "Anyone can cook, but Sims who are epicurious will benefit from spending a little extra time and attention in the kitchen.",
    howToImprove: "Cooking skill is built primarily by cooking with the fridge, stove, and counter. Increasing this skill will unlock new Cooking Tricks, Moodlets, and Recipes. Homestyle Cooking can be mentored at Skill level 5 from a Fridge, Stove, or Oven.",
    icon: "🍳",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "fishing",
    name: "Fishing",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Fishing Sign",
    description: "Most Sims with this skill aren't shy to admit they're hooked on fishing. Others who say otherwise are just koi.",
    howToImprove: "The fishing skill is improved via fishing, more fishing, and reading about fishing. Increasing this skill will unlock Fishing with Bait and increases the likelihood of catching bigger and better fish. Fishing can be mentored at Skill level 5 from a Fishing Sign.",
    icon: "🎣",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "fitness",
    name: "Fitness",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Treadmill, Workout Machine, or Punching Bag",
    description: "While all Sims want to stay healthy, fitness-minded Sims frequently go above and beyond the call of duty to keep their bodies in tip-top shape.",
    howToImprove: "Fitness can be worked on via the Treadmill, Workout Machine, or Punching bag. Increasing this Skill will unlock new Workout Interactions and Socials. Fitness can be mentored at Skill level 5 from a Treadmill, Workout Machine, or Punching Bag.",
    icon: "💪",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "gardening",
    name: "Gardening",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Gardening Plant",
    description: "How does your garden grow? It can bloom with flowers and fruits galore, but such an endeavor takes time and effort, and more than a bit of Gardening Skill.",
    howToImprove: "Gardening Skill is built by working with plants, seeds, and planters. Increasing this skill will allow Sims to be more efficient when Gardening as well as unlock new Gardening Interactions and Socials. Gardening can be mentored at Skill level 5 from a Gardening Plant.",
    icon: "🌱",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "gourmet-cooking",
    name: "Gourmet Cooking",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Fridge, Stove, or Oven",
    description: "Ready to take your culinary creations to new heights? The Gourmet Cooking skill can help deliver some fancy foods to your mouth and your guests.",
    howToImprove: "Gourmet Cooking is developed through cooking gourmet foods on the fridge, stove, and countertop. Increasing this skill will unlock new Gourmet Cooking Tricks, Moodlets, and Recipes. Gourmet Cooking can be mentored at Skill level 5 from a Fridge, Stove, or Oven.",
    icon: "🍲",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "guitar",
    name: "Guitar",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Guitar",
    description: "Guitar: the one instrument that defies class, genre, and boundaries. A guitar can be a good fit for a romantic evening, a casual get-together, or a sold-out performance.",
    howToImprove: "Use the guitar to improve Guitar Skill. Increasing this skill will unlock new Songs and Interactions on the Guitar, including the ability to Write Songs and Serenade Sims. Guitar can be mentored at Skill level 5 from a Guitar.",
    icon: "🎸",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "handiness",
    name: "Handiness",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Woodworking Table or when repairing/upgrading",
    description: "Do it yourself! That's the motto of a handy Sim. Handy Sims aren't afraid to repair things when they break, can upgrade regular household objects, and may even dabble with a bit of woodworking.",
    howToImprove: "Handiness is built by repairing and upgrading objects, or using the woodworking table. Increasing this skill unlocks new craftables on the Woodworking Table and improves Sims' ability to Repair and Upgrade objects. Handiness can be mentored at Skill level 5 from a Woodworking Table or when Sims are upgrading or repairing various objects.",
    icon: "🔧",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "logic",
    name: "Logic",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Chess Table, Small Telescope, Microscope, or Science Table",
    description: "A practiced mind can be a wonderful thing, and Sims who focus on Logic want to hone their minds until they're sharper than a llamacorn's horn.",
    howToImprove: "Logic is built on a Chess Table, Telescope, Microscope, and Science Table (Children only). Increasing this skill will unlock new Interactions on the Microscope, Observatory, and various collectibles. Logic can be mentored at Skill level 5 from a Chess Table, Small Telescope, Microscope, or Science Table.",
    icon: "♟️",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "mischief",
    name: "Mischief",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Computer or Tablet",
    description: "Mischief-oriented Sims tend to be sly devils, delightful at tricking, pranking, and otherwise mocking their fellow Sims. Life's a party, and a Mischief Sim is out to crash it.",
    howToImprove: "Mischief is mainly tied to social interactions and the Voodoo Doll. Increasing this skill will unlock new Mischievous Social on Sims as well as mischievous interactions on the Voodoo Doll, Computer, Tablet, and Phone. Mischief can be mentored at Skill level 5 from a Computer or Tablet.",
    icon: "🃏",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "mixology",
    name: "Mixology",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Bar",
    description: "Mixing drinks and making small talk seems easy enough, but the right proportions of juices and the right amount of chatter is a subtle skill.",
    howToImprove: "Mixologists primarily use the Bar. Increasing this skill will unlock the ability to make new Drinks, Bar Tricks, and Mixology Socials! Mixology can be mentored at Skill level 5 from a Bar.",
    icon: "🍸",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "painting",
    name: "Painting",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Easel, Digital Sketchpad, or Mural (City Living)",
    description: "The art of putting brush to canvas and creating something that can evoke an emotional response is not easy. For those Sims that explore the Painting Skill, colorful creations—and maybe some big sales—lie in their future.",
    howToImprove: "Painting is primarily tied to the Easel and Digital Sketchpad. Increasing this skill will unlock new Painting Genres and sizes! Painting can be mentored at Skill level 5 from an Easel, Digital Sketchpad, or Mural (City Living).",
    icon: "🎨",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "photography",
    name: "Photography",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "From a phone to a fancy camera, Sims who are skilled in Photography will have greater success as they hone their skills.",
    howToImprove: "Hone skills by taking lots of pictures, upgrading equipment, experimenting with picture settings and using the In a Flash Photo Studio.",
    icon: "📷",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "piano",
    name: "Piano",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Piano",
    description: "When ivories need tickling and aural senses need soothing, a pianist is the only Sim that can help. Practice, practice, practice that Piano Skill and while you may never be a rock star, you'll be played in elevators forever.",
    howToImprove: "Piano Skill is improved on the Piano, and can be mentored from said object at Skill level 5.",
    icon: "🎹",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "programming",
    name: "Programming",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Computer",
    description: "Almost like speaking a second language in today's world, programming is becoming more and more essential. Get ahead by learning how to make machines do your bidding!",
    howToImprove: "Programming is done on the computer. Increasing this skill will allow Sims to create Plugins, Games, Mods, and Mobile Phone Apps. Sims will also be able to Hack on the Computer! Programming can be mentored at Skill level 5 from a Computer.",
    icon: "💻",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "rocket-science",
    name: "Rocket Science",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Rocketship",
    description: "There are those who'd rather keep their feet on the ground, their eyes looking down. Not you! Throw off the shackles of what-can-be. Build, upgrade, and fly where no Sim has gone before with the Rocket Science Skill.",
    howToImprove: "The Rocket Science Skill is built using the rocket ship. Increasing this skill will increase build speed and unlock new Upgrades on the Rocket Ship. Rocket Science can be mentored at Skill level 5 from a Rocketship.",
    icon: "🚀",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "video-gaming",
    name: "Video Gaming",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Computer, Gaming Mat, Arcade Machine (Get Together), or Video Game Console (City Living)",
    description: "Being good at video games used to only be good for bragging rights against your siblings, but in this brave new world, video game prowess can actually make money and bring fame! What wacky times we live in.",
    howToImprove: "Video Gaming Skill is improved via the computer, motion game system, and tablet. Increasing this skill will unlock new Video Gaming Socials as well as new Interactions on the Computer. Video Gaming can be mentored at Skill level 5 from a Computer, Gaming Mat, Arcade Machine, or Console.",
    icon: "🎮",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "violin",
    name: "Violin",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Violin",
    description: "Whether a haunting dirge or a lively dance, the violin can evoke a myriad of emotions. Work up from unpleasant screeching to dulcet chords with the Violin Skill.",
    howToImprove: "Violin Skill is improved via the Violin. Increasing this skill will unlock new Songs and Interactions on the Violin, including the ability to Write Songs and Serenade Sims. Violin Skill can be mentored at Skill level 5 from a Violin.",
    icon: "🎻",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "writing",
    name: "Writing",
    pack: "The Sims 4 - Base Game",
    packType: "Base Game",
    category: "Base Game",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Computer",
    description: "Putting pen to paper (or more likely, fingers to keys) is no easy task. The blank page can be one of the most daunting foes, but writers take on the challenge of finding a way to put emotions into words day after day.",
    howToImprove: "Writing is primarily done on the computer. Increasing this skill will unlock new Writing Interactions on the Computer as well as the ability to Publish and Self-Publish books! Writing can be mentored at Skill Level 5 from a Computer.",
    icon: "✍️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 2. Fundamental Skills - Toddler (5 skills)
  {
    id: "toddler-communication",
    name: "Communication",
    pack: "Fundamental Skills (Toddler)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Toddler Fundamental (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    correspondingChildSkill: "Social",
    description: "Talking is a huge step for any Toddler.",
    howToImprove: "Communication skill teaches Toddlers advanced socials. Improve it by talking with others, and studying advanced Flash Cards. Directly impacts Child Social skill when aging up.",
    icon: "🗣️",
    targetStages: ["Toddler"]
  },
  {
    id: "toddler-imagination",
    name: "Imagination",
    pack: "Fundamental Skills (Toddler)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Toddler Fundamental (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    correspondingChildSkill: "Creativity",
    description: "Toddlers with Imagination play in their own world.",
    howToImprove: "Imagination skill teaches Toddlers to read and create fantastical worlds with their toys. Gain Imagination skill by playing with Toys and Dolls, listening to music, or looking at Toddler Books. Directly impacts Child Creativity skill when aging up.",
    icon: "🦄",
    targetStages: ["Toddler"]
  },
  {
    id: "toddler-movement",
    name: "Movement",
    pack: "Fundamental Skills (Toddler)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Toddler Fundamental (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    correspondingChildSkill: "Motor",
    description: "Toddlers who focus on Movement really get around.",
    howToImprove: "Movement skill helps Toddlers walk faster, run, climb stairs, and dance, dance, dance. Improve it by walking around, building with Nesting Blocks, dancing, or via Play wrestling with adults. Directly impacts Child Motor skill when aging up.",
    icon: "🏃‍♂️",
    targetStages: ["Toddler"]
  },
  {
    id: "toddler-potty",
    name: "Potty",
    pack: "Fundamental Skills (Toddler)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Toddler Potty (Level 3)",
    maxLevel: 3,
    mentorLevel: null,
    mentorFrom: null,
    description: "Toilet training makes dirty diapers a thing of the past.",
    howToImprove: "Potty skill teaches toddlers to use the Potty Chair. Improve it by having an adult Train the toddler. Maxing Potty eliminates dirty diapers!",
    icon: "🚽",
    targetStages: ["Toddler"]
  },
  {
    id: "toddler-thinking",
    name: "Thinking",
    pack: "Fundamental Skills (Toddler)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Toddler Fundamental (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    correspondingChildSkill: "Mental",
    description: "Thinking Skill helps toddlers throw fewer tantrums and be more capable of taking care of themselves. It reduces defiance, and helps to solve needs.",
    howToImprove: "Thinking Skill is improved by being curious, or by playing with Flash Cards, Nesting Blocks, or the Tablet. Directly impacts Child Mental skill when aging up.",
    icon: "💡",
    targetStages: ["Toddler"]
  },

  // 2. Fundamental Skills - Child (4 skills)
  {
    id: "child-creativity",
    name: "Creativity",
    pack: "Fundamental Skills (Child)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Child Fundamental (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    unlockedAdultSkills: ["Piano", "Violin"],
    description: "Using imagination is one of the hallmarks of childhood, and developing that imagination can pay big dividends in the future.",
    howToImprove: "The Creativity Skill can be developed on the activity table as a child sim and easel as an adult. Increasing this skill will unlock new Activity Table Drawings, Dollhouse Interactions, and Socials! Maxing Level 10 unlocks Piano & Violin adult skills.",
    icon: "🎨",
    targetStages: ["Child"]
  },
  {
    id: "child-mental",
    name: "Mental",
    pack: "Fundamental Skills (Child)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Child Fundamental (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    unlockedAdultSkills: ["Logic", "Video Gaming", "Fishing"],
    description: "The minds of children may be physically smaller, but they are also less cluttered with junk, like fun facts about llamas or algebra. Kids that can hone their mental muscle early may find themselves more easily able to grasp more complex logic later in life.",
    howToImprove: "Mental skill can be developed on the science table and chessboard. Increasing this skill will unlock new Science Table Potions, Computer Interactions, and Socials. Maxing Level 10 unlocks Logic, Video Gaming, and Fishing adult skills.",
    icon: "🧠",
    targetStages: ["Child"]
  },
  {
    id: "child-motor",
    name: "Motor",
    pack: "Fundamental Skills (Child)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Child Fundamental (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    unlockedAdultSkills: ["Fitness"],
    description: "Motor Skill is essential for all children, but beyond simply enabling them to walk, run, and jump, Motor Skill can be focused on to build early muscles and prepare for a lifetime of fitness.",
    howToImprove: "Motor Skill can be developed on monkey bars and jungle gyms. Maxing Level 10 unlocks the adult Fitness skill.",
    icon: "🏃",
    targetStages: ["Child"]
  },
  {
    id: "child-social",
    name: "Social",
    pack: "Fundamental Skills (Child)",
    packType: "Base Game",
    category: "Fundamental Skills",
    skillType: "Child Fundamental (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    unlockedAdultSkills: ["Charisma", "Mischief"],
    description: "Learning to talk is the first step in every child's journey to becoming a social creature. For those children who decide to focus on Social Skill, friendships are sure to come easier to them throughout life.",
    howToImprove: "Social Skill can be developed on the dollhouse and stuffed animal. Increasing this skill will unlocks Sim.tv on the computer, Doll Interactions, and Socials! Maxing Level 10 unlocks Charisma & Mischief adult skills.",
    icon: "🗣️",
    targetStages: ["Child"]
  },

  // 3. Outdoor Retreat
  {
    id: "herbalism",
    name: "Herbalism",
    pack: "Outdoor Retreat",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "How can a nature lover best take advantage of the gifts of the forest? Rare and wondrous Herbs aren't just leafy greens, but precious ingredients!",
    howToImprove: "The Herbalism skill is built by Identifying Herbs after collecting them and Brewing Remedies on the Grill or Stove.",
    icon: "🌿",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 4. Get to Work
  {
    id: "baking",
    name: "Baking",
    pack: "Get to Work",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Fridge, Oven, or Cupcake Machine",
    description: "Baking is science in action. You can't just throw random ingredients into a bowl like some chef. You have to plan. Fortunately, the plan involves large helpings of sugar.",
    howToImprove: "Increasing your baking skill will unlock new Baked Goods for your Oven and Cupcake Factory. Baking can be mentored at Skill level 5 from a Fridge, Oven, or Cupcake Machine.",
    icon: "🧁",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 5. Spa Day
  {
    id: "wellness",
    name: "Wellness",
    pack: "Spa Day",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "A Sim that acquires Wellness is a Sim that can regulate their moods and sensations as they sway through the gales of life's enduring dilemmas.",
    howToImprove: "Wellness is primarily increased through Meditation, Yoga, and Massages. Increasing this skill will unlock new Yoga poses, massage types, and some transcendent meditation techniques!",
    icon: "🧘",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 6. Get Together
  {
    id: "dancing",
    name: "Dancing",
    pack: "Get Together",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Sims with this skill can never resist the urge to bust a move. They love to move and are always ready to hit the dance floor.",
    howToImprove: "Dancing can be improved by shaking it on the dance floor, moving along to the music of a DJ booth or stereo, and even by practicing in a mirror. Improving the Dancing Skill unlocks new dance moves for your Sim to use.",
    icon: "💃",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "dj-mixing",
    name: "DJ Mixing",
    pack: "Get Together",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Anyone can scratch a record, but only Sims with the DJ Skill are always ready to drop a beat. They can play on the DJ Booth, create mixtapes, and entertain a crowd.",
    howToImprove: "DJ Skill is gained by practicing on a DJ Booth or by playing for a crowd. Increasing this skill unlocks new genres and interactions on the DJ Booth.",
    icon: "🎧",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 7. City Living
  {
    id: "singing",
    name: "Singing",
    pack: "City Living",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Microphone",
    description: "While any Sim can sing, can they sing well? Sims with Singing skill love to belt it, no matter where they are at.",
    howToImprove: "Sims love to sing using the Karaoke Machine, but they can also sing using instruments or the Microphone. Skilled singers will unlock more songs, have the ability to Sing in Shower, and serenade other Sims. Highly skilled singers can write lyrics on instruments and even license lyrics. Singing can be mentored at Skill level 5 from a Microphone.",
    icon: "🎤",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },

  // 8. Vampires
  {
    id: "pipe-organ",
    name: "Pipe Organ",
    pack: "Vampires",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Pipe Organ",
    description: "The Pipe Organ is the instrument for the pianist who wants to crank it up to 11. Notable as the largest instrument in the world. This is sure to make an impression at your next jam session.",
    howToImprove: "Use the Pipe Organ to improve Pipe Organ Skill. Increasing this skill will unlock new Songs and Interactions on the Pipe Organ, including the ability to Write Songs. The Skill can be mentored from a Pipe Organ at Skill Level 5.",
    icon: "🎹",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "vampire-lore",
    name: "Vampire Lore",
    pack: "Vampires",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Special (Level 15)",
    maxLevel: 15,
    mentorLevel: null,
    mentorFrom: null,
    description: "Sims with a thirst for knowledge will sink their teeth into these books. Sims would be batty to pass up on the helpful tips contained within.",
    howToImprove: "Vampire Lore skill is improved by researching into Vampires on the computer or reading unlocked Vampire Tomes. Reaches an exceptional maximum of Level 15!",
    icon: "🧛",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 9. Bowling Night Stuff
  {
    id: "bowling",
    name: "Bowling",
    pack: "Bowling Night Stuff",
    packType: "Stuff Pack",
    category: "Game & Stuff Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Some would call Bowling a minor skill, but they'd only be technically correct. While it may only have five levels of advancement, Sims who put in the work to skill up will look undeniably cool.",
    howToImprove: "They'll acquire additional bowling balls as they go, and you may just bowl a Perfect Llama game of all strikes someday. Bowling Skill is improved via bowling on the lane.",
    icon: "🎳",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 10. Parenthood
  {
    id: "parenting",
    name: "Parenting",
    pack: "Parenthood",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "A skilled parent knows when to influence, when to encourage, and when to discipline children. They know the best way to clean a kid up and how to solve their needs.",
    howToImprove: "Parenting skill is built by caring for children, talking to other parents, and researching on the computer. Increasing this skill will unlock new ways to parent children and solve their motives.",
    icon: "👪",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 11. Cats & Dogs
  {
    id: "pet-training",
    name: "Pet Training",
    pack: "Cats & Dogs",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Dogs being able to perform tricks is a basic expectation. Once trained, the dog can perform the trick on command.",
    howToImprove: "Train dogs to sit, speak, play dead, heel, roll over, fetch, or tackle the obstacle course.",
    icon: "🐕",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "veterinarian",
    name: "Veterinarian",
    pack: "Cats & Dogs",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "It takes a steady hand, compassionate heart, and good knowledge of animal medical anatomy to be a great Veterinarian.",
    howToImprove: "Examine and Treat pets at your Vet Clinic to increase this skill!",
    icon: "🩺",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 12. Jungle Adventure
  {
    id: "archaeology",
    name: "Archaeology",
    pack: "Jungle Adventure",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Some Sims are driven by the search for knowledge and treasures lost to time. Spending a little bit of time in the dirt can be very rewarding.",
    howToImprove: "Archaeology Skill is built by digging up, authenticating, and studying ancient artifacts. Increasing this skill unlocks new interactions on the Archaeology Table.",
    icon: "🏺",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "selvadoradian-culture",
    name: "Selvadoradian Culture",
    pack: "Jungle Adventure",
    packType: "Game Pack",
    category: "Game & Stuff Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Sims who are passionate about the Selvadoradian culture immerse themselves in it. They are less likely to make awkward comments and more likely to nail those tricky dance moves.",
    howToImprove: "Selvadoradian Culture Skill is built by socializing with the locals in Selvadorada, tasting the local cuisine, and interacting with local vendors.",
    icon: "🗿",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 13. Seasons
  {
    id: "flower-arranging",
    name: "Flower Arranging",
    pack: "Seasons",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Flower Arranging Table",
    description: "Arranging flowers in intricate ways takes some mad floral skills. Develop these skills to not only create beautiful organic creations, but also create feelings in Sims they might not even understand themselves.",
    howToImprove: "Flower Arranging Skill is built by using Violets are Blue Flower Arranging Table. Increasing this skill will allow sims to create different types of arrangements with different flowers. High-skilled Sims will also be able to Scent arrangements with flowers, allowing Sims to have an emotional response. Flower Arranging can be mentored at Skill level 5 from a Flower Arranging Table.",
    icon: "💐",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 14. Get Famous
  {
    id: "acting",
    name: "Acting",
    pack: "Get Famous",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "The ability to bring a character to life, to tell a story, and to move Sims to tears is a genuine art. To these artists, life is the canvas.",
    howToImprove: "Acting skill is built by practicing in a mirror. As this skill increases, Sims will be able to perform scenes in public, and for tips to make extra Simoleons.",
    icon: "🎬",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "media-production",
    name: "Media Production",
    pack: "Get Famous",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "A Sim with Media Production Skill is well-versed in current technology, as it applies to producing music and videos. These Sims stream and upload content to share to the world or make some Simoleons on the side.",
    howToImprove: "Media Production Skill can be built using the Mix Master Music Production Station, the More Views Video Station, or either Streaming Drone.",
    icon: "📹",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 15. Discover University
  {
    id: "research-debate",
    name: "Research & Debate",
    pack: "Discover University",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Mirror or Podium Set",
    description: "Research & Debate is all about learning information and then utilizing it—whether that be in a debate or through social influence.",
    howToImprove: "This skill can be improved and used with the Research Archive Machine to Research varying topics, and the Mirror or Podium Set to Practice Debating. Research & Debate can be mentored at Skill level 5 from a Mirror or Podium Set.",
    icon: "🗣️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "robotics",
    name: "Robotics",
    pack: "Discover University",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Robotics Workstation",
    description: "Technology should help make a Sim's life better. By creating robots to do chores, protect, and entertain the masses Sims are freed up to do... other Sims specific things!",
    howToImprove: "Robotics Skill is built by Tinkering at the Robotics Workstation and repairing Utili-Bots and Servos. Increasing this skill unlocks new craftables on the Robotics Workstation. Robotics can be mentored at Skill level 5 from a Robotics Workstation.",
    icon: "🤖",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 16. Eco Lifestyle
  {
    id: "fabrication",
    name: "Fabrication",
    pack: "Eco Lifestyle",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Fabricator or Candle Making Table",
    description: "Why buy brand name when you can make it yourself? Recycle old stuff that would be thrown out otherwise and use the Bits and Pieces to make something all your own!",
    howToImprove: "Fabrication Skill is built by using the Fabricator and by creating candles at the Candle Making Table. Increasing the skill unlocks new recipes to explore! Fabrication can be mentored at Skill level 5 from a Fabricator or Candle Making Table.",
    icon: "🕯️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "juice-fizzing",
    name: "Juice Fizzing",
    pack: "Eco Lifestyle",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Sims with this skill have a natural curiosity for the art of the fizz. Whether it's a hobby or a side hustle, experimentation is key. These Sims can be found trying different ingredients and processes to hone their craft.",
    howToImprove: "Load ingredients into the Juice Fizzing Station to brew carbonated juices, kombucha, and grimy seltzers.",
    icon: "🍾",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 17. Nifty Knitting Stuff
  {
    id: "knitting",
    name: "Knitting",
    pack: "Nifty Knitting Stuff",
    packType: "Stuff Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Yarn Basket",
    description: "Get comfortable and turn on some tunes, because it's time to knit! Use your talents to dress your family, decorate your house, or make some Simoleons on the side. No wrong answers here, just get to stitching!",
    howToImprove: "Knitting is primarily tied to the Yarn Basket. Your Sim must have a Yarn Basket in their inventory to start knitting. Increasing this skill will allow new Knitting recipes, both clothing and objects! Knitting can be mentored at Skill level 5 from a Yarn Basket.",
    icon: "🧶",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },

  // 18. Snowy Escape
  {
    id: "rock-climbing",
    name: "Rock Climbing",
    pack: "Snowy Escape",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Adventurous Sims love the challenge of scaling mountain cliffs, and getting better at this physical skill will unlock new ways to climb as well as allow access to new areas and vistas.",
    howToImprove: "Rock Climbing Skill is built up by tackling Climbing Routes as well as researching climbing techniques with Skill Books and the Computer.",
    icon: "🧗",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "skiing",
    name: "Skiing",
    pack: "Snowy Escape",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Sims with the Skiing Skill live for the feeling of the crisp wind in their face and gliding smoothly down the slopes.",
    howToImprove: "Skiing Skill is built by practicing runs on the slope or can be done at home on the computer by 'Researching the Art of Skiing'. Leveling up in this skill unlocks new slope Interactions, Tricks, Outfits, Skis, Solo Interactions, and Socials.",
    icon: "🎿",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "snowboarding",
    name: "Snowboarding",
    pack: "Snowy Escape",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Feel like getting tricky? Sims can level up their Snowboarding Skill for a rush like no other!",
    howToImprove: "Snowboarding is built by practicing runs on the slopes or reading about Snowboarding. Leveling up grants access to harder slopes, more tricks, or becoming Snow Bros with other skilled Sims.",
    icon: "🏂",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 19. Paranormal Stuff
  {
    id: "medium",
    name: "Medium",
    pack: "Paranormal Stuff",
    packType: "Stuff Pack",
    category: "Game & Stuff Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Hone your spiritual power! Sims embarking on this journey will eventually be able to do things like summon the dead, or host their own Séance with other Sims.",
    howToImprove: "The Medium Skill is increased by using interactions on the Séance Table.",
    icon: "🔮",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 20. Cottage Living
  {
    id: "cross-stitch",
    name: "Cross-stitch",
    pack: "Cottage Living",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Nothing says love and patience like a carefully stitched piece of art! Cross-stitch pieces are perfect for decorations, selling, or as a gift for the little critter hanging around your garden. Choose from three different size hoops and get stitching! Just beware of resting stitch face!",
    howToImprove: "Your Sim can learn new patterns with each level up but maybe talking to a few folks in town will give them some inspiration. Some of the small critters might even give them something new to stitch, but only if you give them something nice in return!",
    icon: "🪡",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },

  // 21. High School Years
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    pack: "High School Years",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Want to take your ideas on a journey from spark to small business to business empire? Build your Entrepreneur skill by progressing your Side Hustles and excelling in Odd Jobs and Freelance Careers!",
    howToImprove: "Build your Entrepreneur skill by progressing your Side Hustles, excelling in Odd Jobs, selling outfits on Trendi, and working Freelance careers.",
    icon: "💼",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 22. Horse Ranch - Sim skills & Horse skills
  {
    id: "horse-riding",
    name: "Horse Riding",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Horse Riding can be a recreational activity, a mode of travel, or a means for winning Competitions. The Skill reflects the riding Sim's capabilities rather than the horse's capabilities.",
    howToImprove: "The best way to learn this skill is to mount up and get riding! All of a Sim's time spent riding improves their Horse Riding Skill, whether out for a leisurely ride or training the Horse's Agility, Jumping, or Endurance Skills.",
    icon: "🏇",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "nectar-making",
    name: "Nectar Making",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Nectar Making combines the subtle art of extracting flavors from a wide variety of ingredients with the not-so-subtle art of smashing those ingredients to a pulp.",
    howToImprove: "Nectar Making can be improved by crafting bottles at the Nectar Maker. Improving the Nectar Making Skill increases how quickly Sims can craft Nectar, and unlocks access to new recipes.",
    icon: "🍇",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "agility-horse",
    name: "Agility - (Horse Skill)",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Horse Skills",
    skillType: "Horse Skill (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Agility affects how quickly and easily a Horse can move! Horses with high Agility are better at using Horse Barrels, completing certain Community Jobs, and performing in the Barrel Racing, Western Pleasure, and Ultimate Horse Championship competitions.",
    howToImprove: "A Horse's Agility Skill is built by training with Horse Barrels. Skill can also be acquired by sending a Horse for training using the Community Board.",
    icon: "🐎",
    targetStages: ["Horse"]
  },
  {
    id: "endurance-horse",
    name: "Endurance - (Horse Skill)",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Horse Skills",
    skillType: "Horse Skill (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Endurance is all about how resilient a Horse is! A horse with high Skill in Endurance will become Fatigued less often, do better at certain Community Jobs and the Endurance Race, Show Jumping, and Ultimate Horse Championship competitions.",
    howToImprove: "Endurance Skill is built by going for rides. Skill can also be acquired by sending a Horse for training using the Community Board.",
    icon: "🏃‍♂️",
    targetStages: ["Horse"]
  },
  {
    id: "jumping-horse",
    name: "Jumping - (Horse Skill)",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Horse Skills",
    skillType: "Horse Skill (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Horses with high Jumping Skill love to reach for new heights! They are better at using Horse Jumps, certain Community Jobs, and the Show Jumping, Endurance Racing, and Ultimate Horse Championship competitions.",
    howToImprove: "A Horse's Jumping Skill is built by training with the Horse Jumps. Skill can also be acquired by sending a Horse for training using the Community Board.",
    icon: "🚧",
    targetStages: ["Horse"]
  },
  {
    id: "temperament-horse",
    name: "Temperament - (Horse Skill)",
    pack: "Horse Ranch",
    packType: "Expansion Pack",
    category: "Horse Skills",
    skillType: "Horse Skill (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Horses with high Temperament Skill buck less often when being ridden and get along more easily with Sims and other Horses. They also perform better at certain Community Jobs and the Western Pleasure, Show Jumping, and Ultimate Horse Championship competitions.",
    howToImprove: "A Horse's Temperament Skill is built when a Sim cares for and socializes with that Horse. Skill can also be acquired by sending a Horse for training using the Community Board.",
    icon: "❤️",
    targetStages: ["Horse"]
  },

  // 23. Crystal Creations Stuff
  {
    id: "gemology",
    name: "Gemology",
    pack: "Crystal Creations Stuff",
    packType: "Stuff Pack",
    category: "Game & Stuff Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Gemology Table",
    description: "While every Sim may appreciate a shiny gem, those with Gemology skill learn to create their own gem-based creations for wearing, gifting, or turning a little profit.",
    howToImprove: "Gemology is built primarily by crafting on the Gemology Table, supplemented by finding metals and crystals. Increasing this skill will unlock new jewelry designs and gemstone cuts, as well as increase the number of metals and crystals a Sim finds! Gemology can be mentored at Skill level 5 from a Gemology Table.",
    icon: "💎",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 24. Lovestruck
  {
    id: "romance",
    name: "Romance",
    pack: "Lovestruck",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Anyone can be romantic, but soon these Sims will exude romance. Romance Sims will find that they succeed more often in matters of the heart.",
    howToImprove: "Romance Skill can be improved through most romantic or flirty interactions, including new ones that they gain with this skill.",
    icon: "💖",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 25. Life & Death
  {
    id: "thanatology",
    name: "Thanatology",
    pack: "Life & Death",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Dip your toe into the Baleful Bog of knowledge by studying death and loss. Sims enticed by this grim calling will eventually be able to partake in the vocalization of a dying tongue or the creation of a soulful treat meant to boost a Sim's motivations. It's really a skill to die for!",
    howToImprove: "The Thanatology Skill is increased by Reading Skill books, Reading Theories on a Computer, or Progressing in the Deathly Career.",
    icon: "⚰️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 26. Businesses & Hobbies
  {
    id: "pottery",
    name: "Pottery",
    pack: "Businesses & Hobbies",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Pottery Wheel or Pottery Kiln",
    description: "From blobs of clay to beautiful masterpieces! Those with the Pottery skill make their own ceramic creations that can enhance a home or be sold to eager customers!",
    howToImprove: "Pottery skill can be gained from molding a Lump of Clay, making ceramics at the Pottery Wheel or glazing them at the Pottery Kiln. Increasing this skill will unlock new ceramic designs the Sim can explore! Pottery can be mentored at Skill level 5 from the Pottery Wheel or Pottery Kiln.",
    icon: "🏺",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "tattooing",
    name: "Tattooing",
    pack: "Businesses & Hobbies",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Tattoo Table or Digital Sketchpad",
    description: "The art of Tattooing allows Sims to adorn the bodies of others with beautiful ink, while making a pretty Simoleon along the way. Tattoos can even be a permanent dedication to a loved one (at least until they pay for Tattoo Removal).",
    howToImprove: "Tattooing can be learned by using a Tattoo Table or a Digital Sketchpad. Increasing this skill unlocks new Tattoo Designs, higher Tattooing service profits, and additional Tattooing interactions. Tattooing can be mentored at Skill level 5 from a Tattoo Table or Digital Sketchpad.",
    icon: "🖋️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 27. Enchanted by Nature
  {
    id: "apothecary",
    name: "Apothecary",
    pack: "Enchanted by Nature",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Apothecary Table",
    description: "Turn commonplace harvestables into fantastic Apothecary Elixirs that cure a variety of Ailments and enhance life.",
    howToImprove: "The Apothecary Skill can be improved by crafting at the Apothecary Table, Researching at the Computer, or Reading Skill Books. Increasing this skill unlocks new craftables on the Apothecary Table, as well as new social interactions. Apothecary can be mentored at Skill level 5 from the Apothecary Table.",
    icon: "🧪",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "natural-living",
    name: "Natural Living",
    pack: "Enchanted by Nature",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: null,
    mentorFrom: null,
    description: "Embrace the bohemian life with this Skill that erases the boundary between 'in here' and 'out there'. Sims can start by sleeping outdoors, doing basic Foraging, and bathing in rivers, lakes, oceans, and even ponds. With practice, Sims unlock ways to solve any and all of their Needs naturally. High-skilled Sims may choose to live without a bed, kitchen, bathroom, or even any house at all. Natural Living is more than just surviving, it's thriving—whether travelling out in the world or bedding down on the grass in your own beautiful garden!",
    howToImprove: "Natural Living is improved best by first hand practice outdoors but can also be studied at the Computer or by reading a Natural Living Skill Book.",
    icon: "🍃",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },

  // 28. Adventure Awaits
  {
    id: "archery",
    name: "Archery",
    pack: "Adventure Awaits",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: 4,
    mentorFrom: "Archery Target",
    description: "Hitting bullseyes isn't as simple as nocking arrows and sending them flying! It can take hours of practice with a bow to be the best archer around.",
    howToImprove: "The Archery Skill can be improved by practicing at an Archery Target or participating in Archery Competitions. Improved Archery Skill means more bullseye, better competition performance, and cooler bows. It also unlocks new interactions, catching fish via Bowfishing, and some sweet archery-related accessories in Create a Sim. Archery can be mentored from Skill level 4 at an Archery Target.",
    icon: "🏹",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "diving",
    name: "Diving",
    pack: "Adventure Awaits",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "For Sims who wish they could fly through the air (and look super cool while doing it) diving is the ideal water sport!",
    howToImprove: "Diving can be practiced at both tall and short diving boards placed beside pools. Increasing this skill will unlock new, more complex dives to perform.",
    icon: "🏊",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "entomology",
    name: "Entomology",
    pack: "Adventure Awaits",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Minor (Level 5)",
    maxLevel: 5,
    mentorLevel: null,
    mentorFrom: null,
    description: "Master the Entomology Skill by learning how to catch and examine butterflies and moths in their natural habitats. Gain hands-on experience in nurturing these insects through incubation, observing their fascinating life cycles. Progressing in this Skill will unlock advanced techniques to raise new generations of butterflies and moths, enhancing your expertise in their care and conservation.",
    howToImprove: "Catch and examine butterflies and moths in nature, and nurture insects through incubation in an incubator habitat.",
    icon: "🦋",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  },
  {
    id: "papercraft",
    name: "Papercraft",
    pack: "Adventure Awaits",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Papercraft Kit",
    description: "The art of making two- or three-dimensional objects and designs using paper. Creations are made in a variety of ways, which can include cutting, folding, bending, stitching, layering, and gluing. Sims can gift their papercrafts to other Sims or proudly display them around the house.",
    howToImprove: "This Skill can be developed using a Papercraft Kit. Increasing this Skill will unlock new paper creations and paper colors. Papercrafting can be mentored at Skill level 5 from the Papercraft Kit.",
    icon: "📄",
    targetStages: ["Child", "Teen", "Young Adult", "Adult", "Elder"]
  },

  // 29. Royalty & Legacy
  {
    id: "swordsmanship",
    name: "Swordsmanship",
    pack: "Royalty & Legacy",
    packType: "Expansion Pack",
    category: "Expansion Packs",
    skillType: "Major (Level 10)",
    maxLevel: 10,
    mentorLevel: 5,
    mentorFrom: "Practice Dummy",
    description: "A skill perfect for Sims that want to challenge others to Duels and earn rewards through their prowess with a sword!",
    howToImprove: "Swordsmanship can be improved via Training at the Practice Dummy, Duels with other Sims, or by participating in Swordsmanship Tournaments from the Gazebos in Ondarion. Increasing this Skill will unlock new Duel interactions, Swords at the Blacksmith in the workshop in Ondarion and unlock different Swordsmanship Tournament levels. Swordsmanship can be mentored at the Practice Dummy.",
    icon: "⚔️",
    targetStages: ["Teen", "Young Adult", "Adult", "Elder"]
  }
];

// Helper dictionaries and lists
export const skillsByName: Record<string, SkillItem> = allSkillsData.reduce((acc, skill) => {
  acc[skill.name] = skill;
  return acc;
}, {} as Record<string, SkillItem>);

export const adultMajorMinorSkills = allSkillsData
  .filter(s => s.targetStages.includes("Teen") || s.targetStages.includes("Adult"))
  .map(s => s.name);

export const toddlerFundamentalSkillNames = ["Communication", "Imagination", "Movement", "Potty", "Thinking"];
export const childFundamentalSkillNames = ["Creativity", "Mental", "Motor", "Social"];
export const horseSkillNames = [
  "Agility - (Horse Skill)", 
  "Endurance - (Horse Skill)", 
  "Jumping - (Horse Skill)", 
  "Temperament - (Horse Skill)"
];

/**
 * Calculates Child starting skill status based on Toddler skill levels.
 */
export function calculateChildSkillsFromToddler(toddlerSkills: {
  Communication: number;
  Imagination: number;
  Movement: number;
  Potty: number;
  Thinking: number;
}) {
  const getChildProgress = (level: number) => {
    switch (level) {
      case 1:
        return { completedLevel: 0, percentToNext: 0, label: "Level 1 (0% towards Level 2)" };
      case 2:
        return { completedLevel: 1, percentToNext: 45, label: "Level 1 + 45% (55% to Level 2)" };
      case 3:
        return { completedLevel: 1, percentToNext: 90, label: "Level 1 + 90% (10% to Level 2)" };
      case 4:
        return { completedLevel: 2, percentToNext: 44, label: "Level 2 + 44% (56% to Level 3)" };
      case 5:
        return { completedLevel: 2, percentToNext: 94, label: "Level 2 + 94% (6% to Level 3)" };
      default:
        return { completedLevel: 0, percentToNext: 0, label: "Level 1" };
    }
  };

  const social = getChildProgress(toddlerSkills.Communication);
  const creativity = getChildProgress(toddlerSkills.Imagination);
  const motor = getChildProgress(toddlerSkills.Movement);
  const mental = getChildProgress(toddlerSkills.Thinking);

  // Bonus traits check:
  // Reached at least level 3 in four fundamental skills: Happy Toddler (+10% skill gain)
  // Reached level 5 in all four core fundamentals (Communication, Imagination, Movement, Thinking): Top Notch Toddler (+25% skill & career gain)
  const coreLevels = [
    toddlerSkills.Communication,
    toddlerSkills.Imagination,
    toddlerSkills.Movement,
    toddlerSkills.Thinking
  ];

  const level3Count = coreLevels.filter(lvl => lvl >= 3).length;
  const isTopNotch = coreLevels.every(lvl => lvl >= 5);
  const isHappyToddler = !isTopNotch && level3Count >= 4;

  let awardedBonusTrait: string | null = null;
  if (isTopNotch) awardedBonusTrait = "Top Notch Toddler";
  else if (isHappyToddler) awardedBonusTrait = "Happy Toddler";

  return {
    social,
    creativity,
    motor,
    mental,
    awardedBonusTrait,
    isTopNotch,
    isHappyToddler
  };
}
