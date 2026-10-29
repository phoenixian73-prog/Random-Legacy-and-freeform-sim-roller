export interface PackInfo {
  code: string;
  name: string;
  type: 'Expansion' | 'Game Pack' | 'Stuff Pack' | 'Base Game';
}

export const packsList: PackInfo[] = [
  { code: 'BG', name: 'Base Game', type: 'Base Game' },
  { code: 'GTW', name: 'Get to Work', type: 'Expansion' },
  { code: 'GT', name: 'Get Together', type: 'Expansion' },
  { code: 'CL', name: 'City Living', type: 'Expansion' },
  { code: 'C&D', name: 'Cats & Dogs', type: 'Expansion' },
  { code: 'S', name: 'Seasons', type: 'Expansion' },
  { code: 'GF', name: 'Get Famous', type: 'Expansion' },
  { code: 'SV', name: 'StrangerVille', type: 'Game Pack' },
  { code: 'IL', name: 'Island Living', type: 'Expansion' },
  { code: 'DU', name: 'Discover University', type: 'Expansion' },
  { code: 'EL', name: 'Eco Lifestyle', type: 'Expansion' },
  { code: 'SE', name: 'Snowy Escape', type: 'Expansion' },
  { code: 'COL', name: 'Cottage Living', type: 'Expansion' },
  { code: 'HSY', name: 'High School Years', type: 'Expansion' },
  { code: 'GRO', name: 'Growing Together', type: 'Expansion' },
  { code: 'HR', name: 'Horse Ranch', type: 'Expansion' },
  { code: 'FR', name: 'For Rent', type: 'Expansion' },
  { code: 'LS', name: 'Lovestruck', type: 'Expansion' },
  { code: 'L&D', name: 'Life & Death', type: 'Expansion' },
  { code: 'EBN', name: 'Enchanted by Nature', type: 'Expansion' },
  { code: 'AA', name: 'Adventure Awaits', type: 'Expansion' },
  { code: 'R&L', name: 'Royalty & Legacy', type: 'Expansion' },
  { code: 'B&H', name: 'Businesses & Hobbies', type: 'Expansion' },
  { code: 'OR', name: 'Outdoor Retreat', type: 'Game Pack' },
  { code: 'SD', name: 'Spa Day', type: 'Game Pack' },
  { code: 'DO', name: 'Dine Out', type: 'Game Pack' },
  { code: 'V', name: 'Vampires', type: 'Game Pack' },
  { code: 'P', name: 'Parenthood', type: 'Game Pack' },
  { code: 'JA', name: 'Jungle Adventure', type: 'Game Pack' },
  { code: 'ROM', name: 'Realm of Magic', type: 'Game Pack' },
  { code: 'JTB', name: 'Journey to Batuu', type: 'Game Pack' },
  { code: 'DHD', name: 'Dream Home Decorator', type: 'Game Pack' },
  { code: 'W', name: 'Werewolves', type: 'Game Pack' },
  { code: 'MFP', name: 'My First Pet', type: 'Stuff Pack' },
  { code: 'TL', name: 'Tiny Living', type: 'Stuff Pack' },
  { code: 'KN', name: 'Nifty Knitting', type: 'Stuff Pack' },
  { code: 'PAR', name: 'Paranormal', type: 'Stuff Pack' },
  { code: 'HSH', name: 'Home Chef Hustle', type: 'Stuff Pack' },
  { code: 'CC', name: 'Crystal Creations', type: 'Stuff Pack' },
  { code: 'MWS', name: 'My Wedding Stories', type: 'Game Pack' },
  { code: 'BtD', name: 'Bust the Dust', type: 'Stuff Pack' },
  { code: 'RG', name: 'Romantic Garden', type: 'Stuff Pack' },
  { code: 'CA', name: 'Castle Estate', type: 'Stuff Pack' },
  { code: 'RW', name: 'Retro Living', type: 'Stuff Pack' },
];

export interface MaritalStatusEntry {
  diceRange: string;
  minRoll: number;
  maxRoll: number;
  title: string;
  description: string;
  pack?: string;
  partnerCount: number;
  helperCount: number;
  petCount: number;
  minChildren?: number;
  requiresOccult?: boolean;
  rentalRental?: boolean;
  hasCustodySubroll?: boolean;
  hasUselessHelp?: boolean;
}

export const maritalStatuses: MaritalStatusEntry[] = [
  {
    diceRange: "1–10",
    minRoll: 1,
    maxRoll: 10,
    title: "Single Parent",
    description: "Raise the kids by yourself with no live-in partner or helpers.",
    partnerCount: 0,
    helperCount: 0,
    petCount: 0,
  },
  {
    diceRange: "11–30",
    minRoll: 11,
    maxRoll: 30,
    title: "Couple",
    description: "Live together with a romantic interest and use their help to raise the kids.",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
  },
  {
    diceRange: "31–32",
    minRoll: 31,
    maxRoll: 32,
    title: "Mixed Single",
    description: "Have both adopted and biological children. Must have at least 2 children.",
    partnerCount: 0,
    helperCount: 0,
    petCount: 0,
    minChildren: 2,
  },
  {
    diceRange: "33–34",
    minRoll: 33,
    maxRoll: 34,
    title: "Mixed Couple",
    description: "Live with a romantic interest. Have both adopted and biological children. Must have at least 2 children.",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
    minChildren: 2,
  },
  {
    diceRange: "35–36",
    minRoll: 35,
    maxRoll: 36,
    title: "Second Chance",
    description: "Have a child with your first partner, but find and live with another partner after.",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
  },
  {
    diceRange: "37–38",
    minRoll: 37,
    maxRoll: 38,
    title: "Single with Help",
    description: "Another sim lives with you to help raise the kids, who is not romantically involved (roommate/friend/family member).",
    partnerCount: 0,
    helperCount: 1,
    petCount: 0,
  },
  {
    diceRange: "39",
    minRoll: 39,
    maxRoll: 39,
    title: "Mixed Single with Help",
    description: "Single parent with 1 non-romantic helper. Must have both adopted and biological children (min 2 kids).",
    partnerCount: 0,
    helperCount: 1,
    petCount: 0,
    minChildren: 2,
  },
  {
    diceRange: "40",
    minRoll: 40,
    maxRoll: 40,
    title: "Couple with Help",
    description: "Couple living together plus 1 extra helper sim around to assist with the kids.",
    partnerCount: 1,
    helperCount: 1,
    petCount: 0,
  },
  {
    diceRange: "41",
    minRoll: 41,
    maxRoll: 41,
    title: "Mixed Couple with Help",
    description: "Couple with 1 extra helper sim. Must have both adopted and biological children (min 2 kids).",
    partnerCount: 1,
    helperCount: 1,
    petCount: 0,
    minChildren: 2,
  },
  {
    diceRange: "42",
    minRoll: 42,
    maxRoll: 42,
    title: "Single with Double Help",
    description: "Single parent living with 2 extra non-romantic helper sims.",
    partnerCount: 0,
    helperCount: 2,
    petCount: 0,
  },
  {
    diceRange: "43",
    minRoll: 43,
    maxRoll: 43,
    title: "Mixed Single with Double Help",
    description: "Single parent living with 2 extra helper sims. Must have both adopted and biological kids (min 2 kids).",
    partnerCount: 0,
    helperCount: 2,
    petCount: 0,
    minChildren: 2,
  },
  {
    diceRange: "44",
    minRoll: 44,
    maxRoll: 44,
    title: "Full House",
    description: "3 extra sims who can help raise kids (4 adults including the heir in total in any relation dynamic).",
    partnerCount: 1,
    helperCount: 2,
    petCount: 0,
  },
  {
    diceRange: "45",
    minRoll: 45,
    maxRoll: 45,
    title: "Single with 'Useless' Help",
    description: "Raise the kids by yourself, but hire extra help (butler, gardener, nanny). You cannot directly instruct or push them to do tasks!",
    partnerCount: 0,
    helperCount: 0,
    petCount: 0,
    hasUselessHelp: true,
  },
  {
    diceRange: "46",
    minRoll: 46,
    maxRoll: 46,
    title: "Couple with 'Useless' Help",
    description: "Couple raising kids, but hiring external help (butler, gardener, nanny). You cannot directly instruct them!",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
    hasUselessHelp: true,
  },
  {
    diceRange: "47",
    minRoll: 47,
    maxRoll: 47,
    title: "Full Occult House",
    description: "3 extra Occult sims that can help raise kids (4 adult sims including heir in total; must be Vampires, Spellcasters, Werewolves, Mermaids, Aliens, etc.).",
    partnerCount: 0,
    helperCount: 3,
    petCount: 0,
    requiresOccult: true,
  },
  {
    diceRange: "48",
    minRoll: 48,
    maxRoll: 48,
    title: "Full Pet House",
    description: "Single parent with 3 additional pets (preferably one dog, one cat, and one horse, or any combination).",
    pack: "C&D / HR",
    partnerCount: 0,
    helperCount: 0,
    petCount: 3,
  },
  {
    diceRange: "49",
    minRoll: 49,
    maxRoll: 49,
    title: "Black Widow",
    description: "Cursed heir! Your sim must marry at least 3 times and all previous partners must die in mysterious ways. Child with first partner.",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
  },
  {
    diceRange: "50",
    minRoll: 50,
    maxRoll: 50,
    title: "Multi-family Dwelling",
    description: "Move to a Residential Rental lot together with remaining family members in separate units. Re-roll to decide marital status while family lives next door.",
    pack: "FR",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
    rentalRental: true,
  },
  {
    diceRange: "51–52",
    minRoll: 51,
    maxRoll: 52,
    title: "Second Chance (Again...)",
    description: "You must have each child with another partner! They live with you until you find another suitable partner. (Requires at least 3 kids; re-roll if 1-2).",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
    minChildren: 3,
  },
  {
    diceRange: "53",
    minRoll: 53,
    maxRoll: 53,
    title: "Multiplied Love",
    description: "Polyamorous heir living happily with 2 romantic partners.",
    pack: "LS",
    partnerCount: 2,
    helperCount: 0,
    petCount: 0,
  },
  {
    diceRange: "54",
    minRoll: 54,
    maxRoll: 54,
    title: "Shared Custody",
    description: "Have a partner, have all rolled kids immediately back-to-back, then split up and determine custody schedule and Child Support!",
    partnerCount: 1,
    helperCount: 0,
    petCount: 0,
    hasCustodySubroll: true,
  },
];

export interface CustodySchedule {
  roll: number;
  label: string;
  description: string;
}

export const custodySchedules: CustodySchedule[] = [
  { roll: 1, label: "Primary Custody (1 day with Ex)", description: "Heir has primary custody. Child stays 1 day per week with Ex (Ex pays high Child Support)." },
  { roll: 2, label: "Primary Custody (2 days with Ex)", description: "Heir has primary custody. Child stays 2 days per week with Ex (Ex pays Child Support)." },
  { roll: 3, label: "Primary Custody (3 days with Ex)", description: "Heir has primary custody. Child stays 3 days per week with Ex (Ex pays slight Child Support)." },
  { roll: 4, label: "Equal Custody (4 days alternating)", description: "Equal custody split between parents. Child stays 4 days alternating each week (no Child Support)." },
  { roll: 5, label: "Secondary Custody (3 days with Heir)", description: "Ex has primary custody. Child stays 3 days per week with Heir (Heir pays slight Child Support)." },
  { roll: 6, label: "Secondary Custody (2 days with Heir)", description: "Ex has primary custody. Child stays 2 days per week with Heir (Heir pays Child Support)." },
  { roll: 7, label: "Secondary Custody (1 day with Heir)", description: "Ex has primary custody. Child stays only 1 day per week with Heir (Heir pays high Child Support)." },
];

export interface ChildCountRoll {
  diceRange: string;
  minRoll: number;
  maxRoll: number;
  count: number;
  label: string;
}

export const childrenRolls: ChildCountRoll[] = [
  { diceRange: "1–2", minRoll: 1, maxRoll: 2, count: 1, label: "1 Kid" },
  { diceRange: "3–6", minRoll: 3, maxRoll: 6, count: 2, label: "2 Kids" },
  { diceRange: "7–8", minRoll: 7, maxRoll: 8, count: 3, label: "3 Kids" },
  { diceRange: "9", minRoll: 9, maxRoll: 9, count: 4, label: "4 Kids" },
  { diceRange: "10", minRoll: 10, maxRoll: 10, count: 5, label: "5 Kids" },
];

export interface ConventionalCareer {
  id: number;
  name: string;
  branch?: string;
  pack: string;
}

export const conventionalCareersList: ConventionalCareer[] = [
  { id: 1, name: "Astronaut", branch: "Space Ranger", pack: "Base Game" },
  { id: 2, name: "Astronaut", branch: "Interstellar Smuggler", pack: "Base Game" },
  { id: 3, name: "Athlete", branch: "Professional Athlete", pack: "Base Game" },
  { id: 4, name: "Athlete", branch: "Bodybuilder", pack: "Base Game" },
  { id: 5, name: "Business", branch: "Management", pack: "Base Game" },
  { id: 6, name: "Business", branch: "Investor", pack: "Base Game" },
  { id: 7, name: "Criminal", branch: "Boss", pack: "Base Game" },
  { id: 8, name: "Criminal", branch: "Oracle", pack: "Base Game" },
  { id: 9, name: "Culinary", branch: "Chef", pack: "Base Game" },
  { id: 10, name: "Culinary", branch: "Mixologist", pack: "Base Game" },
  { id: 11, name: "Entertainer", branch: "Musician", pack: "Base Game" },
  { id: 12, name: "Entertainer", branch: "Comedian", pack: "Base Game" },
  { id: 13, name: "Freelancer", branch: "Digital Artist", pack: "Base Game" },
  { id: 14, name: "Freelancer", branch: "Programmer", pack: "Base Game" },
  { id: 15, name: "Freelancer", branch: "Writer", pack: "Base Game" },
  { id: 16, name: "Painter", branch: "Master of the Real", pack: "Base Game" },
  { id: 17, name: "Painter", branch: "Patron of the Arts", pack: "Base Game" },
  { id: 18, name: "Secret Agent", branch: "Diamond Agent", pack: "Base Game" },
  { id: 19, name: "Secret Agent", branch: "Villain", pack: "Base Game" },
  { id: 20, name: "Style Influencer", branch: "Trendsetter", pack: "Base Game" },
  { id: 21, name: "Style Influencer", branch: "Stylist", pack: "Base Game" },
  { id: 22, name: "Tech Guru", branch: "eSport Gamer", pack: "Base Game" },
  { id: 23, name: "Tech Guru", branch: "Start-up Entrepreneur", pack: "Base Game" },
  { id: 24, name: "Writer", branch: "Author", pack: "Base Game" },
  { id: 25, name: "Writer", branch: "Journalist", pack: "Base Game" },
  { id: 26, name: "Detective", branch: "Active Career", pack: "GTW" },
  { id: 27, name: "Doctor", branch: "Active Career", pack: "GTW" },
  { id: 28, name: "Scientist", branch: "Active Career", pack: "GTW" },
  { id: 29, name: "Critic", branch: "Arts Critic", pack: "CL" },
  { id: 30, name: "Critic", branch: "Food Critic", pack: "CL" },
  { id: 31, name: "Politician", branch: "Politician", pack: "CL" },
  { id: 32, name: "Politician", branch: "Charity Organizer", pack: "CL" },
  { id: 33, name: "Social Media", branch: "Internet Personality", pack: "CL" },
  { id: 34, name: "Social Media", branch: "Public Relations", pack: "CL" },
  { id: 35, name: "Gardener", branch: "Botanist", pack: "S" },
  { id: 36, name: "Gardener", branch: "Floral Designer", pack: "S" },
  { id: 37, name: "Actor", branch: "Active / Talent Agency", pack: "GF" },
  { id: 38, name: "Military", branch: "Covert Operator", pack: "SV" },
  { id: 39, name: "Military", branch: "Officer", pack: "SV" },
  { id: 40, name: "Conservationist", branch: "Environmental Manager", pack: "IL" },
  { id: 41, name: "Conservationist", branch: "Marine Biologist", pack: "IL" },
  { id: 42, name: "Education", branch: "Administrator", pack: "DU" },
  { id: 43, name: "Education", branch: "Professor", pack: "DU" },
  { id: 44, name: "Engineer", branch: "Computer Engineer", pack: "DU" },
  { id: 45, name: "Engineer", branch: "Mechanical Engineer", pack: "DU" },
  { id: 46, name: "Law", branch: "Judge", pack: "DU" },
  { id: 47, name: "Law", branch: "Private Attorney", pack: "DU" },
  { id: 48, name: "Freelancer", branch: "Crafter", pack: "EL" },
  { id: 49, name: "Civil Designer", branch: "Civic Planner", pack: "EL" },
  { id: 50, name: "Civil Designer", branch: "Green Technician", pack: "EL" },
  { id: 51, name: "Salaryperson", branch: "Expert", pack: "SE" },
  { id: 52, name: "Salaryperson", branch: "Supervisor", pack: "SE" },
  { id: 53, name: "Freelancer", branch: "Fashion Photographer Branch", pack: "MS" },
  { id: 54, name: "Freelancer", branch: "Paranormal Investigator", pack: "P" },
  { id: 55, name: "Interior Decorator", branch: "Client Projects", pack: "DHD" },
  { id: 56, name: "Romance Consultant", branch: "Matchmaker", pack: "LS" },
  { id: 57, name: "Romance Consultant", branch: "Relationship Counsellor", pack: "LS" },
  { id: 58, name: "Reaper", branch: "Active Reaper", pack: "L&D" },
  { id: 59, name: "Undertaker", branch: "Mortician", pack: "L&D" },
  { id: 60, name: "Undertaker", branch: "Funeral Director", pack: "L&D" },
  { id: 61, name: "Naturopath", branch: "Apothe-curist", pack: "EBN" },
  { id: 62, name: "Naturopath", branch: "Lifestyle Coaching", pack: "EBN" },
  { id: 63, name: "Park Worker", branch: "Park Counselor", pack: "AA" },
  { id: 64, name: "Park Worker", branch: "Park Ranger", pack: "AA" },
  { id: 65, name: "Noble", branch: "Dynasty Peerage", pack: "R&L" },
];

export interface UnconventionalCareer {
  id: number;
  name: string;
  pack: string;
  description: string;
}

export const unconventionalCareersList: UnconventionalCareer[] = [
  { id: 1, name: "Freelance Painter", pack: "Base Game", description: "Paint at home whenever you want and sell your creations." },
  { id: 2, name: "Freelance Author", pack: "Base Game", description: "Write books at home and publish or sell them for royalties." },
  { id: 3, name: "Freelance Musician", pack: "Base Game", description: "Play an instrument in public parks or venues and collect tips & license songs." },
  { id: 4, name: "Gardener", pack: "Base Game", description: "Earn money by planting, tending, and selling your harvests." },
  { id: 5, name: "Fishersim", pack: "Base Game", description: "Sell your fresh catches from ponds, rivers, and oceans." },
  { id: 6, name: "Collector", pack: "Base Game", description: "Sell your outside treasures from digging, collecting rocks, fossils, and frogs." },
  { id: 7, name: "Carpenter", pack: "Base Game", description: "Use a woodworking crafting bench to craft and sell furniture & sculptures." },
  { id: 8, name: "Freelance Comedian", pack: "Base Game", description: "Use the microphone to perform stand-up comedy routines for tips & cash." },
  { id: 9, name: "Freelance Programmer", pack: "Base Game", description: "Create plugins, mobile apps, games, and freelance gigs for money." },
  { id: 10, name: "Space Explorer", pack: "Base Game", description: "Build a rocket ship in your backyard and explore to infinity and beyond." },
  { id: 11, name: "Professional Gamer", pack: "Base Game", description: "Enter professional video game tournaments and livestream matches." },
  { id: 12, name: "Cybercriminal", pack: "Base Game", description: "Create computer viruses, hack servers, and siphon funds for money." },
  { id: 13, name: "Professional Host(ess)", pack: "Base Game", description: "Host social gatherings & parties and sell the prize rewards you earn." },
  { id: 14, name: "Freelance Photographer", pack: "Base Game", description: "Take pictures of anything, anywhere, and sell framed prints." },
  { id: 15, name: "The Knitter", pack: "KN", description: "Knit and sell your wooly creations on Plopsy or to friends." },
  { id: 16, name: "Remedy Brewer", pack: "OR", description: "Brew herbal remedies on the grill/stove and sell them for profit." },
  { id: 17, name: "Restaurateur", pack: "DO", description: "Purchase, design, and manage your own 5-star restaurant." },
  { id: 18, name: "Treasure Hunter", pack: "JA", description: "Sell relics, artifacts, and fossils found within jungle temples or pop-up quests." },
  { id: 19, name: "Archaeologist", pack: "JA", description: "Use the archaeology table to authenticate relics and verify items mailed to you." },
  { id: 20, name: "Retail Owner", pack: "GTW", description: "Manage and run your own retail store selling goods." },
  { id: 21, name: "DJ", pack: "GT", description: "Earn tips and license mixtapes at nightclub DJ booths." },
  { id: 22, name: "Festival Fanatic", pack: "CL", description: "Win prizes at festival contests, collect posters and snow globes to sell." },
  { id: 23, name: "Veterinarian", pack: "C&D", description: "Buy and manage your own veterinary clinic curing local sick pets." },
  { id: 24, name: "Breeder", pack: "C&D", description: "Breed pedigree cats or dogs (max 2 litters per female). Must befriend animals first." },
  { id: 25, name: "Animal Trainer", pack: "C&D", description: "Send your trained hunter dog or prowler cat out on foraging runs for loot." },
  { id: 26, name: "Flower Arranger", pack: "S", description: "Craft bouquets using the 'Violets are Blue' table and scent them to sell." },
  { id: 27, name: "Bee Keeper", pack: "S", description: "Keep Bertie's Bee Boxes, collect honey & beeswax, and sell them." },
  { id: 28, name: "Video Producer", pack: "GF", description: "Record, edit, and publish videos on the More Views Video Station." },
  { id: 29, name: "Music Producer", pack: "GF", description: "Produce and release original music tracks using the Mix Master Music Station." },
  { id: 30, name: "Influencer", pack: "GF", description: "Gain fame, secure corporate sponsorships, and monetize gifts & endorsements." },
  { id: 31, name: "Beachcomber", pack: "IL", description: "Combe the beaches for shells, buried treasure, and washed-up artifacts." },
  { id: 32, name: "Odd Jobs Worker", pack: "IL", description: "Take daily odd jobs around the island from cleaning to deliveries." },
  { id: 33, name: "Freelance Candle Maker", pack: "EL", description: "Craft and sell molded and dipped candles using the Candle-making station." },
  { id: 34, name: "Freelance Decorator", pack: "EL", description: "Recycle bits & pieces and fabricate custom furnishings on the Fabricator." },
  { id: 35, name: "Freelance Drink Maker", pack: "EL", description: "Brew and fizz custom juices and seltzers with the Juice Fizzing Machine." },
  { id: 36, name: "Dumpster Diver", pack: "EL", description: "Dive into community dumpsters and furnish your life or sell rare finds." },
  { id: 37, name: "Bot-Bot Creator", pack: "DU", description: "Build robot toys, utility bots, and servos using the Robotics Station." },
  { id: 38, name: "Farmer", pack: "COL", description: "Live off your land with oversized crops, cows, llamas, and chickens." },
  { id: 39, name: "Fashion Designer", pack: "HSY", description: "Assemble hype outfits and sell curated looks on Trendi for big markups." },
  { id: 40, name: "Yoga/Meditation Instructor", pack: "SD", description: "Teach classes at the local spa or host private wellness sessions at home." },
  { id: 41, name: "Massage Therapist", pack: "SD", description: "Give massages at the local wellness center or your own home spa setup." },
  { id: 42, name: "Nail Technician", pack: "SD", description: "Offer manicures and pedicures at the salon or invite neighborhood clients." },
  { id: 43, name: "Mini-Farmer", pack: "HR", description: "Milk mini-goats, shear mini-sheep, and bag high-grade horse manure for profit." },
  { id: 44, name: "Equestrian", pack: "HR", description: "Train champion horses and win cash purses at the Equestrian Center." },
  { id: 45, name: "Nectar Connoisseur", pack: "HR", description: "Stomp grapes and fruit into vintage nectar bottles to age and sell." },
  { id: 46, name: "Community Job Hopper", pack: "HR", description: "Take varied daily gigs and ranch hands tasks off the Community Board." },
  { id: 47, name: "Landlord", pack: "FR", description: "Buy, renovate, and lease multi-unit residential rental properties." },
  { id: 48, name: "Seller of Secrets", pack: "SV / FR", description: "Eavesdrop, snoop on neighbors, or use the spy tool to extort & sell secrets." },
  { id: 49, name: "Burglar", pack: "Base Game / FR", description: "Kleptomaniac / Sticky Fingers thief breaking into luxury lots for loot." },
  { id: 50, name: "Cabbage Merchant", pack: "HSH", description: "Set up a mobile food stand and sell artisanal culinary delights." },
  { id: 51, name: "Autograph Appraiser", pack: "GF", description: "Hunt celebrity autographs, hold for appreciation, and sell to collectors." },
  { id: 52, name: "Jewelry Maker", pack: "CC", description: "Cut gems and design charged magical jewelry on the Gemology table." },
  { id: 53, name: "Crystal Farmer", pack: "CC", description: "Plant crystal seeds, grow gemstone orchards, and harvest raw geodes." },
  { id: 54, name: "Tarot Reader", pack: "L&D", description: "Conduct mysterious tarot readings for paying clients (30-60 simoleons/reading)." },
  { id: 55, name: "Spooky Explorer", pack: "L&D", description: "Delve into ancient crypts and haunted estates to retrieve priceless loot." },
  { id: 56, name: "Ghost Host", pack: "L&D", description: "Ghost sim haunting visitors for fear essence and psychic shakedowns." },
  { id: 57, name: "Wedding Cake Designer", pack: "MWS", description: "Bake gourmet tier cakes and supply weddings and local bakeries." },
  { id: 58, name: "Flea Market Flipper", pack: "CL", description: "Haggle 25%+ discounts at San Myshuno flea markets and flip for retail value." },
  { id: 59, name: "Tattoo Artist / Tattooist", pack: "B&H", description: "Inks clients, offers tattooing masterclasses, and sells digital flash art." },
  { id: 60, name: "Ceramics Artist / Potter", pack: "B&H", description: "Throws pottery on the wheel and hosts artisanal ceramic workshops." },
  { id: 61, name: "Sweet Shop Confectioner", pack: "B&H", description: "Handcrafts candies and treats, teaching sugarcraft and mischief sweets." },
  { id: 62, name: "Master of Heists", pack: "B&H", description: "Plans clandestine heists, shady pickpocketing, and underworld scores." },
  { id: 63, name: "Small Business Owner – Services", pack: "B&H", description: "Runs a community service venue: cinema, laundromat, pet daycare, or makeover salon." },
  { id: 64, name: "Small Business Owner – Hospitality", pack: "B&H", description: "Operates an intimate bed & breakfast or boutique guest inn with meal service." },
  { id: 65, name: "Small Business Owner – Mini Mall", pack: "B&H", description: "Multi-retail venue featuring dining, workshops, gaming arcade, and shops." },
  { id: 66, name: "Forager", pack: "EBN", description: "Forage rare botanical ingredients, wild roots, and mushrooms in ancient woods." },
  { id: 67, name: "Apothecary", pack: "EBN", description: "Brew, bottle, and market herbal elixirs, tonics, and restorative cures." },
  { id: 68, name: "Natural Artist", pack: "EBN", description: "Crafts pressed leaf art, nature press home décor, and carved gnomes." },
  { id: 69, name: "Quest Adventurer", pack: "Base Game / DLC", description: "Undertake local notice board quests and cash in on bounty rewards." },
  { id: 70, name: "Archer", pack: "AA", description: "Win archery tournaments, bullseye showcases, and bow-fishing prizes." },
  { id: 71, name: "Entomologist", pack: "AA", description: "Catch, breed, and sell rare specimen butterflies and silkmoths." },
  { id: 72, name: "Papercrafter", pack: "AA", description: "Fold and sell intricate origami and papercraft artisan goods." },
  { id: 73, name: "Getaway Host", pack: "AA", description: "Run retreat getaways on your lot (camp, B&B, wellness lodge, survival camp)." },
  { id: 74, name: "Getaway Contestant", pack: "AA", description: "Compete in elimination getaway game shows for cash prizes ($10k-$100k)." },
  { id: 75, name: "Travel Blogger / Vlogger", pack: "AA", description: "Document trips and guidebooks on regular getaways for ad royalties." },
  { id: 76, name: "Crystal Panner", pack: "AA", description: "Pan riverbeds in Crystal Valley for uncut gems and minerals." },
  { id: 77, name: "Freelance Investor", pack: "R&L", description: "Requires $1,000 seed capital and PC; trades high-risk market securities." },
  { id: 78, name: "Swordsman", pack: "R&L", description: "Duel for prize stakes, compete in chivalric tournaments, and mentor sparring." },
  { id: 79, name: "Passageway Explorer", pack: "R&L", description: "Explore secret dungeon passageways for treasure chests and forgotten lore." },
  { id: 80, name: "Seller of Secrets / Extortion", pack: "R&L", description: "Discover royal intrigues and trade sensitive gossip with the Info Broker." },
  { id: 81, name: "Self-Sabotage Scandalmonger", pack: "R&L", description: "Lead an intentionally scandalous life and sell your own tabloid stories." },
  { id: 82, name: "Robin Hood", pack: "Base Game / R&L", description: "Steal exclusively from wealthy sims and donate at least 50% back to the poor." },
];

export interface PartTimeJob {
  id: number;
  name: string;
  pack: string;
}

export const partTimeJobsList: PartTimeJob[] = [
  { id: 1, name: "Babysitter", pack: "Base Game" },
  { id: 2, name: "Barista", pack: "Base Game" },
  { id: 3, name: "Fast Food Employee", pack: "Base Game" },
  { id: 4, name: "Manual Laborer", pack: "Base Game" },
  { id: 5, name: "Retail Employee", pack: "Base Game" },
  { id: 6, name: "Diver", pack: "IL" },
  { id: 7, name: "Fisherman", pack: "IL" },
  { id: 8, name: "Lifeguard", pack: "IL" },
  { id: 9, name: "Simfluencer", pack: "HSY" },
  { id: 10, name: "Video Game Streamer", pack: "HSY" },
  { id: 11, name: "Handyperson", pack: "FR" },
];

export interface GenerationGoal {
  id: number;
  title: string;
  pack: string;
  description: string;
  notes?: string;
  subRollType?: 'midlife_crisis' | 'party_types' | 'tiny_home' | 'domestic_dilemma';
}

export const generationGoalsList: GenerationGoal[] = [
  {
    id: 1,
    title: "Perfect Careers",
    pack: "Base Game",
    description: "The heir, spouse, and helpers must reach level 10 in their careers. If attending University (DU), must attend all classes and get at least an A- overall GPA.",
    notes: "Re-roll if no conventional careers are rolled this generation, or if doing Career Hopper."
  },
  {
    id: 2,
    title: "Fulfilled",
    pack: "Base Game",
    description: "The heir and spouse/roommates (if applicable) must completely finish their first aspiration.",
  },
  {
    id: 3,
    title: "Perfect Children",
    pack: "Base Game / P",
    description: "All children born this generation must complete their childhood aspiration and get an A grade in both elementary and high school. From infant to toddler: gain Top Notch Infant trait. As toddlers: reach level 3 in all skills (including Potty) and max at least one to level 5. Must have a childhood BFF and a teen partner lasting >= 24h. Gain at least 3 positive character traits at YA.",
  },
  {
    id: 4,
    title: "Dependable",
    pack: "Base Game",
    description: "Your heir, spouse, and helpers must complete all daily tasks for school and work, starting from childhood or move-in. May only skip by using formal game vacation days; never attend without completing daily tasks.",
    notes: "Re-roll if no non-profession conventional careers are rolled."
  },
  {
    id: 5,
    title: "Expansionist",
    pack: "Base Game",
    description: "You must construct a significant expansion to the house this generation. You may also add or change a single lot trait if you wish.",
  },
  {
    id: 6,
    title: "Collector",
    pack: "Base Game",
    description: "Complete and display one official collection (plaque received in the mail). All items must be gathered or grown during this generation.",
  },
  {
    id: 7,
    title: "Deadbeat Parents",
    pack: "Base Game / P",
    description: "The heir, spouse, and helpers may NOT help their children this generation beyond basic needs (food, diaper changes, autonomous talking). No mentoring, flash cards, reading books, or homework help. Children teach themselves! Each child should age up to YA with at least one negative character trait.",
  },
  {
    id: 8,
    title: "Change of Scenery",
    pack: "Base Game",
    description: "Moving time! Once the heir comes of age, either move to a completely new lot or demolish the house and rebuild from scratch. The new lot cannot share any lot traits with your previous lot.",
    notes: "Re-roll if it is Generation 1."
  },
  {
    id: 9,
    title: "Party King / Party Queen",
    pack: "Base Game",
    description: "Host every kind of party (House, Dinner, Wedding, Birthday) achieving Gold medals in each. If you have DLC packs, randomly choose 4 distinct party types to conquer.",
    subRollType: 'party_types'
  },
  {
    id: 10,
    title: "Idle Careers",
    pack: "Base Game",
    description: "May not make any deliberate effort to advance in career or school. Autonomous actions or aspiration overlaps only! Send active careers alone so performance remains stagnant.",
  },
  {
    id: 11,
    title: "Friendship is Forever",
    pack: "Base Game",
    description: "Starting in childhood, the heir must make one new good friend every single week and maintain all friendships until their death.",
    notes: "Re-roll if Generation 1."
  },
  {
    id: 12,
    title: "Midlife Crisis",
    pack: "Base Game",
    description: "When the selected sim reaches adulthood, roll 3 times from the 12 Midlife Crisis events below and complete all of them before the deadlines!",
    subRollType: 'midlife_crisis'
  },
  {
    id: 13,
    title: "Memorial",
    pack: "Base Game",
    description: "The heir, spouse, and helpers must be memorialized by a sim with maxed relevant crafting skill (painted portrait, photo, biography, cross-stitch, or book of life) and displayed together.",
  },
  {
    id: 14,
    title: "Themed Display",
    pack: "Base Game",
    description: "Create an ornate themed exhibit in the house or yard with at least 10 items (quality Excellent+), combining at least 2 distinct collections or craft disciplines.",
  },
  {
    id: 15,
    title: "Haunted House",
    pack: "Base Game",
    description: "From the heir coming of age until their death, three sims must die an unnatural death on your home lot. Keep their graves on site and let their ghosts roam freely!",
  },
  {
    id: 16,
    title: "Best Club Ever",
    pack: "GT",
    description: "Start a custom club from scratch. Must recruit 8 friend members, build a dedicated customized club hangout, unlock all emotional vibes, and purchase the club door and 3 spirit perks.",
  },
  {
    id: 17,
    title: "Domestic Dilemma",
    pack: "CL",
    description: "Add a challenging negative Lot Challenge (Off-the-Grid, Quake Zone, Cursed, Grody, Gremlins, Filthy, Spooky, Mold, etc.) and invent a creative story way to overcome it before replacing it.",
    subRollType: 'domestic_dilemma'
  },
  {
    id: 18,
    title: "My Honor Student(s)",
    pack: "P",
    description: "Complete every school project in every possible rating tier (Poor to Excellent) and build a prominent science fair trophy display in the home.",
  },
  {
    id: 19,
    title: "Pet Shrine",
    pack: "C&D",
    description: "Adopt or rescue a pet. Throughout the generation, build a dedicated memorial shrine with Simstigram photos, paw prints, toys, and their urn.",
  },
  {
    id: 20,
    title: "Bad Investment",
    pack: "Base Game",
    description: "The former heir made a catastrophic investment! Total your household funds + lot value, multiply by 90%, and deduct that amount. Sell off furnishings to pay the debt!",
    notes: "Re-roll if Generation 1."
  },
  {
    id: 21,
    title: "Bring Me Back To Life",
    pack: "Base Game",
    description: "One teen+ family member suffers a fatal accident! After Grim claims them, the family must embark on an epic quest (Ambrosia, Dethrone Grim, Book of Life) to resurrect them.",
  },
  {
    id: 22,
    title: "Do-Gooders",
    pack: "Base Game / P",
    description: "Devote your family to charity: volunteer weekly, feed stray animals in the park, donate to charities, and host homeless sims overnight.",
  },
  {
    id: 23,
    title: "Holiday Fanatics",
    pack: "S",
    description: "Celebrate at least one major holiday each sim week with 5 traditions, completing all traditions successfully.",
  },
  {
    id: 24,
    title: "Scouting Family",
    pack: "S",
    description: "Your family is obsessed with scouting. Parents must chaperone children on outings and help them earn every single scout badge.",
  },
  {
    id: 25,
    title: "Rich and Famous",
    pack: "GF",
    description: "Every household member must pursue celebrity fame! Once a week visit a hotspot to sign autographs and build a lavish fame trophy showcase.",
  },
  {
    id: 26,
    title: "Doomsday Preppers",
    pack: "SV",
    description: "At least one family member must solve the StrangerVille mystery! Optionally move the family into a fortified underground bunker.",
  },
  {
    id: 27,
    title: "Environmentalist",
    pack: "IL",
    description: "Once a week the heir must clean up public beaches or community venues, removing trash and invasive species.",
  },
  {
    id: 28,
    title: "Photo Fanatic",
    pack: "MS",
    description: "Take at least 5 framed photographs every week. Each child and pet must have dedicated portraits taken at every life stage.",
  },
  {
    id: 29,
    title: "Magic Master",
    pack: "ROM",
    description: "The heir must master all Practical, Mischief, and Untamed magical spells.",
  },
  {
    id: 30,
    title: "Potion Master",
    pack: "ROM",
    description: "The heir must unlock and brew every single magical potion recipe.",
  },
  {
    id: 31,
    title: "Career Student",
    pack: "DU",
    description: "Complete at least Two Distinguished University Degrees with a rigorous 4-class schedule each term.",
  },
  {
    id: 32,
    title: "Bot Crazy",
    pack: "DU",
    description: "Master Robotics, build every utility and cleaner bot, and construct a sentient Servo to live in the household.",
  },
  {
    id: 33,
    title: "Saving Space",
    pack: "TL",
    description: "Build and reside in a Tiny Home for the entire generation: Tier 1 (<=32 tiles) for <=3 sims; Tier 2 (<=64 tiles) for <=6 sims; Tier 3 (<=100 tiles) for <=8 sims.",
    subRollType: 'tiny_home'
  },
  {
    id: 34,
    title: "Green Living",
    pack: "EL",
    description: "No purchasing new furniture from Buy Mode! Fabricate, dumpster-dive, grow your own food, generate green solar/wind power, and collect dew water.",
  },
  {
    id: 35,
    title: "Furry Friend Fanatic",
    pack: "MFP",
    description: "Must house one hamster, one rat, one pygmy hedgehog, and one miniature bulbalus in a specialized nursery habitat room.",
  },
  {
    id: 36,
    title: "Never Knot Knitting",
    pack: "KN",
    description: "Hand-knit custom socks, sweaters, beanies, or toys as mandatory gifts for every birthday, holiday, and celebration.",
  },
  {
    id: 37,
    title: "Scoundrel's Outlaw",
    pack: "JTB",
    description: "Travel to Batuu, align with Hondo Ohnaka's Scoundrels, and climb to Rank #5.",
  },
  {
    id: 38,
    title: "Sergeant of the First Order",
    pack: "JTB",
    description: "Travel to Batuu, join the First Order, and earn rank #5 Sergeant.",
  },
  {
    id: 39,
    title: "Sergeant of the Resistance",
    pack: "JTB",
    description: "Travel to Batuu, ally with Vi Moradi and the Resistance, reaching rank #5.",
  },
  {
    id: 40,
    title: "Extreme Sporter",
    pack: "SE",
    description: "Max out Rock Climbing, Skiing, and Snowboarding on the slopes of Mt. Komorebi.",
  },
  {
    id: 41,
    title: "Fully Furnished Floors",
    pack: "Base Game",
    description: "Upgrade the family home to include at least 3 bedrooms, formal dining, study with PC, basement, garden, hobby workshop, and attached garage.",
  },
  {
    id: 42,
    title: "Local Salvadorian",
    pack: "JA",
    description: "Romance a Selvadoradian local, max the Selvadoradian Culture skill, master Latin dancing, and cook authentic feasts.",
  },
  {
    id: 43,
    title: "Home Library",
    pack: "Base Game",
    description: "Build an exquisite private library containing books from every genre. Every household member must read at least 10 complete books.",
  },
  {
    id: 44,
    title: "Over-Achiever",
    pack: "Base Game",
    description: "The heir must reach Level 10 mastery in 7 distinct skills of your choice.",
  },
  {
    id: 45,
    title: "The Maniac",
    pack: "Base Game",
    description: "One secret guest sim is confined to a hidden dungeon room on your lot. The Heir is their sole human contact until released on their next milestone birthday!",
  },
  {
    id: 46,
    title: "Paranormal's President",
    pack: "PAR",
    description: "Max Medium skill, perform all séances, summon Bonehilda, and survive 7 consecutive nights in a certified Haunted House.",
  },
  {
    id: 47,
    title: "House Flipper",
    pack: "Base Game",
    description: "Every time your family expands (new partner moves in, baby born, child adopted), you must move to an empty lot or demolish and redesign from scratch!",
  },
  {
    id: 48,
    title: "Love to Party",
    pack: "MWS",
    description: "Host at least 5 wedding-related celebrations: Bachelor Party, Engagement Dinner, Family Gathering, Reception, Rehearsal Dinner, and Vow Renewal.",
  },
  {
    id: 49,
    title: "Occult Sim",
    pack: "DLC",
    description: "Identity journey! Start as human, and spend at least 7 consecutive sim days experiencing each occult type (Mermaid, Vampire, Spellcaster, Werewolf) before deciding.",
  },
  {
    id: 50,
    title: "Livin' for the Lore",
    pack: "DLC",
    description: "Uncover and read all ancient books and artifacts for Werewolf, Vampire, Spellcaster, and Selvadorada ancestral lore.",
  },
  {
    id: 51,
    title: "Horse Trainer",
    pack: "HR",
    description: "Max out Temperament, Jumping, Agility, and Endurance across at least 5 champion horses.",
  },
  {
    id: 52,
    title: "Children of the Occult",
    pack: "DLC",
    description: "Every single child born this generation must inherit or be born of a different occult species (Alien, Vampire, Spellcaster, Werewolf, Mermaid).",
  },
  {
    id: 53,
    title: "Worst Tenant Ever",
    pack: "FR",
    description: "Snoop on neighbors, break & enter, cause maintenance havoc, and get legally evicted at least 3 times!",
  },
  {
    id: 54,
    title: "Tomarani Local",
    pack: "FR",
    description: "Finish all 3 Tomarang aspirations: Seeker of Secrets, Fount of Tomarani Knowledge, and Discerning Dweller.",
  },
  {
    id: 55,
    title: "Working Family",
    pack: "Base Game",
    description: "Every child born this generation must get a part-time job as a teenager and max it out before they can move out.",
  },
  {
    id: 56,
    title: "Grimm's Best Friend",
    pack: "Base Game / CC",
    description: "Summon the Grim Reaper and build the relationship until you become certified Best Friends Forever!",
  },
  {
    id: 57,
    title: "One Broke Friend",
    pack: "Base Game",
    description: "Borrow $10,000 simoleons in outstanding loans from friendly neighborhood sims, spend it all, and pay back every penny before the next generation starts.",
  },
  {
    id: 58,
    title: "Lovers Shrine",
    pack: "Base Game",
    description: "Take the Villainous Valentine aspiration and construct a private sanctuary room dedicated to photos and memorabilia of all 10+ former partners.",
  },
  {
    id: 59,
    title: "Real Life Romance Drama",
    pack: "LS",
    description: "Go on 7 Gold-medal dates in 7 consecutive days, each with a different date, before finally dating 'The One' on Day 7.",
  },
  {
    id: 60,
    title: "Lovers Heirloom",
    pack: "LS",
    description: "Discover the Magic Ring and pass it down as an ancestral engagement ring through all subsequent generations.",
  },
  {
    id: 61,
    title: "Wildlife Preserver",
    pack: "Base Game",
    description: "Complete an entire fauna wildlife collection: all frogs, all river fish, all insects, all aliens, or all axolotls.",
  },
  {
    id: 62,
    title: "Chased by Death",
    pack: "L&D",
    description: "The heir must acquire the Chased by Death trait at their earliest chance and survive until the natural completion of the generation.",
  },
  {
    id: 63,
    title: "Legal Guardian",
    pack: "L&D",
    description: "Befriend a neighbor couple with a child. A tragic accident befalls the parents, and you take in the orphaned child to raise alongside your own.",
  },
  {
    id: 64,
    title: "Retirement Resident",
    pack: "L&D",
    description: "Design a retirement community and move the elderly prior generation there. Visit weekly to ensure you are included in their final wills.",
  },
  {
    id: 65,
    title: "Deja Vu",
    pack: "L&D",
    description: "The heir or a child must be reborn from a previous deceased household ancestor or helper.",
  },
  {
    id: 66,
    title: "Family Band",
    pack: "Base Game",
    description: "Every child+ family member must play an instrument. Practice weekly and perform a 2-hour live concert at the town park.",
  },
  {
    id: 67,
    title: "Family Cookbook",
    pack: "H&B",
    description: "Unlock all Family Recipe Special Touch bonuses and craft signature heritage recipes to pass to future heirs.",
  },
  {
    id: 68,
    title: "Retro Renovator",
    pack: "RW",
    description: "Purchase, restore, and actively cook/use all 4 retro heritage appliances throughout the generation.",
  },
  {
    id: 69,
    title: "Plant Parent",
    pack: "EBN",
    description: "Keep at least 2 living potted houseplants in every room of the house. Name each plant, plus assign one per child to take when moving out.",
  },
  {
    id: 70,
    title: "The Bachelor(ette)",
    pack: "AA",
    description: "Hold a structured Romance Reality TV elimination competition on your lot to choose your spouse and baby parent.",
  },
  {
    id: 71,
    title: "Big Brother",
    pack: "AA",
    description: "Use a Popularity Contest game show to recruit additional household helpers or science baby donors.",
  },
  {
    id: 72,
    title: "Honorary Local",
    pack: "AA",
    description: "The heir must travel on getaways to foreign destinations and complete a Location-based Aspiration outside their home world.",
  },
  {
    id: 73,
    title: "Entomology Enthusiasts",
    pack: "AA",
    description: "Complete the entire Butterfly specimen collection and house them in a majestic Butterfly Atrium on your home lot.",
  },
  {
    id: 74,
    title: "Poolside Player",
    pack: "Base Game",
    description: "Build an opulent outdoor resort patio and swimming complex with diving boards, hot springs, slides, and outdoor kitchens. Host weekly splash parties.",
  },
  {
    id: 75,
    title: "Last-Minute Heir",
    pack: "R&L",
    description: "Your sim reaches adulthood without an heir! Befriend and officially adopt an eccentric Teen or YA (e.g. erratic park dweller or loyal staff) as the future dynasty heir.",
  },
  {
    id: 76,
    title: "Belle / Beau of the Ball",
    pack: "R&L",
    description: "Find your true love spouse via the Dance for Love while donning the legendary Crystal Slippers.",
  },
  {
    id: 77,
    title: "Royal Family Feud",
    pack: "R&L",
    description: "Ignite a dramatic blood rivalry with a prominent neighboring dynasty.",
  },
  {
    id: 78,
    title: "Royal Feud Fixer",
    pack: "R&L",
    description: "Mend and resolve an ancient dynasty rivalry through diplomacy, gifts, or marriage.",
  },
  {
    id: 79,
    title: "Oath Maker",
    pack: "R&L",
    description: "Forge a formal sworn royal alliance with another noble house.",
  },
  {
    id: 80,
    title: "Oath Breaker",
    pack: "R&L",
    description: "Betray and shatter a sacred dynasty alliance, weathering the diplomatic fallout.",
  },
];

export interface MiscFun {
  id: number;
  title: string;
  pack: string;
  description: string;
  notes?: string;
  subRollType?: 'mood' | 'color' | 'troubled_teens' | 'roommates';
}

export const miscFunList: MiscFun[] = [
  {
    id: 1,
    title: "Random",
    pack: "Base Game",
    description: "Determine traits, aspirations (child & adult), and lot traits randomly for every single sim born or moved in this generation.",
  },
  {
    id: 2,
    title: "Partier",
    pack: "Base Game",
    description: "Throw at least one party (any type, any rating) every single sim week.",
  },
  {
    id: 3,
    title: "Mischief Managed",
    pack: "Base Game",
    description: "Your heir must pull a successful prank at least once a week from teen onwards (prank call, clogging drains, sabotaging rockets, etc.).",
  },
  {
    id: 4,
    title: "Moody",
    pack: "Base Game",
    description: "Once a week, heir and spouse must spend at least 3 consecutive hours locked in a designated mood without relying on emotion aura items.",
    subRollType: 'mood'
  },
  {
    id: 5,
    title: "Homemade",
    pack: "Base Game",
    description: "No quick meals, takeout pizza, food stalls, or dining out! Cook meals only when 100% of the fresh ingredients are physically present.",
  },
  {
    id: 6,
    title: "Runs in the Family",
    pack: "Base Game",
    description: "Pick one core personality trait from your heir. Every child born must inherit this exact trait at their earliest age opportunity.",
  },
  {
    id: 7,
    title: "Perfect Attendance",
    pack: "Base Game",
    description: "Heir and helpers must never be more than 1 hour late to work or school, and may never leave early. Strict 5-strike rule!",
  },
  {
    id: 8,
    title: "Fixer Upper",
    pack: "Base Game",
    description: "You may NOT call the repair service or replace broken appliances. Your sims must fix every single broken toilet and fridge themselves!",
  },
  {
    id: 9,
    title: "Half-Siblings",
    pack: "Base Game",
    description: "Every child born this generation must be fathered/mothered by a different partner! (Re-roll if you only rolled 1 kid).",
    notes: "Re-roll if only 1 child rolled."
  },
  {
    id: 10,
    title: "Fighter",
    pack: "Base Game",
    description: "One selected household member must get into a physical brawl with another sim at least once every week.",
  },
  {
    id: 11,
    title: "Joker",
    pack: "Base Game",
    description: "Wildcard! You earn one Free Re-roll in any category (Marital, Children, Career, Goal, or Fun) to use right now or in a future generation.",
  },
  {
    id: 12,
    title: "Health Nut",
    pack: "Base Game",
    description: "Sims may only consume healthy, organic meals. Heir, spouse, and children must spend at least 3 hours each week in strenuous physical exercise.",
  },
  {
    id: 13,
    title: "Gourmet",
    pack: "Base Game",
    description: "Once every week, the entire family must gather around the dining table for an elaborate multi-course Gourmet Cooking meal.",
  },
  {
    id: 14,
    title: "Hands Off!",
    pack: "Base Game",
    description: "No 'Hand of God' cursor dragging! Sims must autonomously clean dirty dishes, trash, and put away toys and books.",
  },
  {
    id: 15,
    title: "Hobbyist",
    pack: "Base Game",
    description: "Heir and spouse must each dedicate at least 3 hours a week to a recreational hobby completely unrelated to their job and never monetize it.",
  },
  {
    id: 16,
    title: "My Precious",
    pack: "Base Game",
    description: "An obsession with beautiful items! Either find 1 unique collectible every week or buy 1 dazzling ornamental buy-mode centerpiece weekly.",
  },
  {
    id: 17,
    title: "Vacationer",
    pack: "DLC",
    description: "At least one household member must take a 24-hour overnight getaway or camping trip every single week.",
  },
  {
    id: 18,
    title: "Clubber",
    pack: "GT",
    description: "Starting from childhood, the heir and spouse/helpers must belong to an active club and host gatherings weekly.",
  },
  {
    id: 19,
    title: "On Call",
    pack: "Base Game",
    description: "Whenever a friend phones inviting the heir to hang out at a festival or community venue, you MUST accept and go!",
    notes: "Re-roll if Generation 1."
  },
  {
    id: 20,
    title: "Town Explorer",
    pack: "Base Game",
    description: "Take the family on a unique day-trip excursion to a different community lot every week (spa, museum, national park, lounge).",
    notes: "Re-roll if Generation 1."
  },
  {
    id: 21,
    title: "Regular Diner",
    pack: "DO",
    description: "Once a week, take the entire household out to a sit-down restaurant, ordering 3 full courses and drinks.",
  },
  {
    id: 22,
    title: "Festival Frequenter",
    pack: "CL",
    description: "Every time a festival spawns in San Myshuno, at least one family member must attend for at least one sim hour.",
  },
  {
    id: 23,
    title: "Flea Market Fanatic",
    pack: "CL",
    description: "No purchasing Comfort (except beds), Lighting, or Decor from the catalog! You may only purchase them from Flea Market stalls.",
  },
  {
    id: 24,
    title: "Sibling Rivalry",
    pack: "P",
    description: "Whenever parents aren't in the same room, siblings must exclusively use mean and mischievous interactions until one ages to young adult.",
  },
  {
    id: 25,
    title: "Rainbow Brite",
    pack: "Base Game",
    description: "Radical home makeover! Re-swatch every possible furniture piece and family everyday wardrobe to your rolled signature color.",
    subRollType: 'color'
  },
  {
    id: 26,
    title: "Exchange Student",
    pack: "Base Game",
    description: "When a child becomes a teen, swap them via Manage Worlds with another townie teen for an exchange program week.",
  },
  {
    id: 27,
    title: "Foster Pets",
    pack: "C&D",
    description: "Foster a stray dog or cat in the house, train out 3 bad habits, teach basic tricks, and re-home them with another family.",
  },
  {
    id: 28,
    title: "Cultured",
    pack: "JA",
    description: "All household members must max out the Selvadoradian Culture skill and visit the jungle at least twice.",
  },
  {
    id: 29,
    title: "Seasonal 'Fun'",
    pack: "S",
    description: "Re-decorate the house and wardrobe to match every changing season, hosting a seasonal festival party.",
  },
  {
    id: 30,
    title: "Crazed Fans",
    pack: "GF",
    description: "Celebrity groupies! Visit VIP venues weekly to fawn over famous sims, collect photos, and worship stars without seeking personal fame.",
  },
  {
    id: 31,
    title: "Island Local",
    pack: "IL",
    description: "Participate in local Sulani island community gatherings and beach bonfires at least once every week.",
  },
  {
    id: 32,
    title: "Magic Club",
    pack: "ROM",
    description: "Create an exclusive coven club of Spellcasters meeting in Glimmerbrook weekly to duel, study tomes, and brew cauldrons.",
  },
  {
    id: 33,
    title: "Secret Society Member",
    pack: "DU",
    description: "Join the secret Order of Enchanters society at university and maintain your sprite offerings.",
  },
  {
    id: 34,
    title: "Organization King/Queen",
    pack: "DU",
    description: "Become a top-tier active member in a campus organization at Britechester or Foxbury.",
  },
  {
    id: 35,
    title: "Roommate Fun",
    pack: "DU",
    description: "Post room-for-rent listings and live with 1 to 3 eccentric NPC roommates for the entire generation.",
    subRollType: 'roommates'
  },
  {
    id: 36,
    title: "Nice and Cozy",
    pack: "TL",
    description: "Strict micro-living constraint: every single bedroom in the house must be no larger than 12 tiles!",
  },
  {
    id: 37,
    title: "Going Green",
    pack: "EL",
    description: "Do everything possible to transform and keep your neighborhood eco footprint at sparkling Green status.",
  },
  {
    id: 38,
    title: "Idc-Industrial",
    pack: "EL",
    description: "Pollution powerhouse! Run generators and smoldering incinerators to drag your footprint into thick smog Industrial.",
  },
  {
    id: 39,
    title: "Hot Pot Magic!",
    pack: "SE",
    description: "Gather around the heated hot-pot table every Sunday to share warm steamy family hot-pot meals.",
  },
  {
    id: 40,
    title: "Duel Master",
    pack: "ROM",
    description: "Once a week your heir must travel to the Magic Realm and win a high-stakes Magic Duel.",
  },
  {
    id: 41,
    title: "Activist Lifestyle",
    pack: "CL",
    description: "Every week the family must take to the streets with megaphones, protest causes, and donate time to community activism.",
  },
  {
    id: 42,
    title: "Wants, Wants and Wants",
    pack: "Base Game",
    description: "Slave to impulses! The heir must immediately fulfill every single Want and Whim bubble that pops up.",
  },
  {
    id: 43,
    title: "Beach Lifestyle",
    pack: "IL",
    description: "The entire household must spend at least one full day every week relaxing, swimming, sailing, and sunbathing on the beach.",
  },
  {
    id: 44,
    title: "Nasty Neighbor",
    pack: "Base Game",
    description: "Neighborhood feud! The heir must pick a fight or argue with an immediate neighbor every other day.",
  },
  {
    id: 45,
    title: "Cowplant Plantation",
    pack: "Base Game",
    description: "Cultivate and feed at least 5 thriving Cowplants in your yard. Don't take the cake!",
  },
  {
    id: 46,
    title: "Future Eaters",
    pack: "EL",
    description: "Only consume meals made strictly from garden-grown produce, pond fish, and insect farm crickets/mealworms.",
  },
  {
    id: 47,
    title: "Riches to Rags",
    pack: "Base Game",
    description: "Catastrophic collapse! Reset family funds to $5,000, bulldoze everything, and rebuild from the ground up.",
  },
  {
    id: 48,
    title: "Ghastly Roommates",
    pack: "PAR",
    description: "Live inside a Haunted House lot! Coexist with specters, cursed dolls, and eerie slime throughout the generation.",
  },
  {
    id: 49,
    title: "Simple Living",
    pack: "COL",
    description: "Enable the Simple Living challenge: every single recipe requires 100% real ingredients grown or bought from market stalls.",
  },
  {
    id: 50,
    title: "Bust the Dust",
    pack: "BtD",
    description: "Dust system locked on! Complete either the Fabulously Filthy or Perfectly Pristine aspiration.",
  },
  {
    id: 51,
    title: "The Collector",
    pack: "Base Game",
    description: "Scour and gather every collectible spawn node around your immediate neighborhood every single morning.",
  },
  {
    id: 52,
    title: "Troubled Teens",
    pack: "HSY",
    description: "When children reach teenhood, roll each child into one of 4 archetypes: Trouble Maker, Mr/Miss Perfect, Overachiever, or Mr Mean/Mean Girl.",
    subRollType: 'troubled_teens'
  },
  {
    id: 53,
    title: "Opposites Attract",
    pack: "GRO",
    description: "You may only date, marry, or form close friendships with sims with whom you have Bad or Poor Social Compatibility!",
  },
  {
    id: 54,
    title: "The Teacher",
    pack: "GRO",
    description: "Devoted hands-on parenting! Help children with homework, riding bikes, treehouses, and forbid electronic toddler pads.",
  },
  {
    id: 55,
    title: "Kyle's Best Friend!",
    pack: "GRO",
    description: "Never say no to houseguests! Whenever a sim asks to stay over (hello, Kyle Kyleson!), you must roll out the guest bed.",
  },
  {
    id: 56,
    title: "Animal Lover",
    pack: "HR / COL / C&D",
    description: "Fill all remaining household slots with animals (horses, dogs, cats), plus keep at least 1 caged rodent and 1 livestock coop/barn.",
  },
  {
    id: 57,
    title: "Golden Child",
    pack: "Base Game",
    description: "Single out one favorite child for constant praise and gifts. The other children are ignored Deadbeat-style with chore duty.",
  },
  {
    id: 58,
    title: "Surrounded by Idiots",
    pack: "Base Game",
    description: "Strict autonomy rule: you may ONLY select and command the Heir! All other family members must run on free will.",
  },
  {
    id: 59,
    title: "Wishing You Well",
    pack: "RG / L&D",
    description: "Every child and teen must make a ceremonial wish at the Wishing Well on their birthday.",
  },
  {
    id: 60,
    title: "Down the Rabbit Hole",
    pack: "Base Game",
    description: "Every week a family member ventures into a rabbit hole: hidden caves, secret tree paths, carnival rides, or space flights.",
  },
  {
    id: 61,
    title: "My Fortress",
    pack: "CA",
    description: "Time for a castle remodel! Build and live inside an imposing stone castle fortress.",
  },
  {
    id: 62,
    title: "Game Night",
    pack: "Base Game",
    description: "Host weekly Friday game nights: invite friends over, order delivery pizza, and play chess, foosball, darts, or board games.",
  },
  {
    id: 63,
    title: "Love is Blind",
    pack: "LS",
    description: "All romantic partners and baby donors must be met exclusively through Cupid's Corner blind dates.",
  },
  {
    id: 64,
    title: "Grimborn",
    pack: "L&D",
    description: "The next generational heir must be biological offspring of the Grim Reaper!",
  },
  {
    id: 65,
    title: "Non-profit Organizer",
    pack: "B&H",
    description: "Run a free non-profit community center offering free skill classes, community gardens, homework clubs, and daycare.",
  },
  {
    id: 66,
    title: "The Pictures Tell the Story",
    pack: "B&H",
    description: "Get permanent memorial tattoos commemorating every milestone: graduations, weddings, promotions, and partner dedications.",
  },
  {
    id: 67,
    title: "Trashley's Best Friend",
    pack: "B&H",
    description: "Track down and become Best Friends Forever with the 3 raccoons inside a trench coat!",
  },
  {
    id: 68,
    title: "Kitchen Nightmares",
    pack: "Base Game",
    description: "Sims refuse to cook! Live solely off raw fruit, catering, takeout pizza, delivery Zoomers, and restaurant dining.",
  },
  {
    id: 69,
    title: "Hobbit Home",
    pack: "Base Game",
    description: "Build and live inside a cozy, earth-sheltered subterranean home integrated directly into natural terrain mounds.",
  },
  {
    id: 70,
    title: "Survivalist Family",
    pack: "OR",
    description: "Once a week spend 24 hours camping in the wilderness, foraging, tent sleeping, and training in basic survival.",
  },
  {
    id: 71,
    title: "Summer Camp",
    pack: "AA",
    description: "Children and teens must attend a sleepaway getaway camp once during their childhood and once as a teenager.",
  },
  {
    id: 72,
    title: "Split Custody",
    pack: "AA",
    description: "Children spend every weekend at a relative or coparent's house via the repeating Getaway system (2 nights a week).",
  },
  {
    id: 73,
    title: "Plumbird Pal",
    pack: "AA",
    description: "Track down and become certified BFFs with the mysterious Peculiar Plumbird cryptid.",
  },
  {
    id: 74,
    title: "Adventure Playground",
    pack: "AA",
    description: "Construct an epic modular playground in the backyard where family members gather and play every week.",
  },
  {
    id: 75,
    title: "Anansi's Trials Champion",
    pack: "R&L",
    description: "Complete all mythological trials offered by Anansi's Well.",
  },
  {
    id: 76,
    title: "Frog Fancier",
    pack: "R&L",
    description: "Find your true love spouse exclusively through kissing Noble Frogs in the wild.",
  },
  {
    id: 77,
    title: "Illegitimate Heir",
    pack: "R&L",
    description: "The heir must be born of a secret affair by your partner, raised as your own heir until the truth threatens to emerge!",
  },
  {
    id: 78,
    title: "Private Ballroom",
    pack: "R&L",
    description: "Add a grand waltzing ballroom to the house and host an opulent themed Grand Ball each season with formal dress codes.",
  },
];

export interface MidlifeCrisisAspect {
  roll: number;
  title: string;
  deadline: string;
  description: string;
}

export const midlifeCrisisAspects: MidlifeCrisisAspect[] = [
  { roll: 1, title: "Re-roll Miscellaneous Fun", deadline: "Complete within 24 hours", description: "Your Miscellaneous Fun roll changes immediately, starting next Sunday." },
  { roll: 2, title: "Randomize a Trait", deadline: "Complete within 24 hours", description: "Cheat out one random trait from your sim and replace it with a newly randomized trait." },
  { roll: 3, title: "Re-roll Career", deadline: "Complete within 24 hours", description: "Quit current career and re-roll a brand new primary career." },
  { roll: 4, title: "Make a Major Purchase", deadline: "Complete within 24 hours", description: "Spend at least 60% of total family household funds on a shiny luxury purchase." },
  { roll: 5, title: "Have a Romantic Crisis", deadline: "Start within 48 hours", description: "Love life upheaval: cheat, separate, or start a torrid affair with a new lover." },
  { roll: 6, title: "Change Style to Recapture Youth", deadline: "Complete within 24 hours", description: "Radically makeover hair, clothes, and get a youthful tattoo in CAS." },
  { roll: 7, title: "Gain a New Skill", deadline: "Complete within 1 week", description: "Raise a previously unused skill by at least 5 levels (e.g. Lvl 2 -> Lvl 7)." },
  { roll: 8, title: "Have an Extra Child", deadline: "Complete within 1 week", description: "Conceive or adopt an unexpected child; add +1 to your generation child goal." },
  { roll: 9, title: "Randomize Aspiration", deadline: "Complete within 24 hours", description: "Pick a brand new adult aspiration compatible with your careers/packs." },
  { roll: 10, title: "Adopt a Pet", deadline: "Complete within 24 hours", description: "Adopt a cat, dog, or horse through shelter agency or adopt a stray." },
  { roll: 11, title: "Plus One Roommate", deadline: "Complete within 1 week", description: "A new helper, relative, or spouse moves into the house." },
  { roll: 12, title: "Who Am I Again??", deadline: "Complete within 24 hours", description: "Drink a Re-traiting Potion from the reward store and randomize all 3 traits." },
];

export const rainbowColors = [
  "Red", "Orange", "Yellow", "Green", "Turquoise", "Blue", "Purple", "Black", "White", "Brown", "Pink", "Grey"
];

export const moodsList = [
  "Inspired", "Happy", "Angry", "Embarrassed", "Playful", "Flirty", "Sad", "Bored", "Confident", "Focused", "Tense", "Scared"
];

export const troubledTeenTypes = [
  { type: "A", name: "Trouble Maker", description: "Class clown or nightmare: sneaks out to parties, gets in fights, pulls pranks, lands in detention." },
  { type: "B", name: "Mr/Miss Perfect", description: "Cheer or football squad, straight-A student, 3 good friends, boyfriend/girlfriend, part-time job." },
  { type: "C", name: "Overachiever", description: "Straight-A student, masters an instrument, masters 2 mental skills, after-school activity, zero friends." },
  { type: "D", name: "Mr. Mean / Mean Girl", description: "Feared & idolized: 1 rival and 1 bestie, trendsetter with 10 outfits on Trendi, breaks hearts." }
];

export const familyDynamicsList = [
  { name: "Close", description: "Deeply bonded, frequently sharing warm moments and affectionate positive sentiments." },
  { name: "Distant", description: "Emotionally detached, keeping conversations brief, leading more independent lives." },
  { name: "Jokesters", description: "Constant playful banter, lighthearted teasing, telling funny jokes, and pulling goofy pranks." },
  { name: "Difficult", description: "Prone to friction and bickering, easily annoyed, quick to form grudges and rivalries." }
];

export const romanticDynamicsList = [
  { name: "Wholesome", description: "Sweet, trusting, gentle, and profoundly respectful affection." },
  { name: "Passionate", description: "Fiery attraction, intense chemistry, and frequent passionate woohoo impulses." },
  { name: "Strained", description: "Volatile love-hate connection, jealousy flare-ups, and complicated emotional drama." },
  { name: "Unpredictable", description: "Wild swings between affectionate romance and fiery petty spats." }
];

export interface PartyEventGoal {
  id: string;
  name: string;
  cost: string;
  isGoldAchieved?: boolean;
}

export const TS4_GOALS_AND_REWARDS_PARTIES: Omit<PartyEventGoal, 'isGoldAchieved'>[] = [
  { id: "baby_shower", name: "Baby Shower", cost: "§250" },
  { id: "keg_party", name: "Keg Party", cost: "§100" },
  { id: "toddler_play_date", name: "Toddler Play Date", cost: "§100" },
  { id: "birthday_party", name: "Birthday Party", cost: "§100" },
  { id: "ranch_animal_day", name: "Ranch Animal Day", cost: "§100" },
  { id: "ranch_gathering", name: "Ranch Gathering", cost: "§100" },
  { id: "friendly_hangout", name: "Friendly Hangout", cost: "Free" },
  { id: "black_and_white_bash", name: "Black and White Bash", cost: "§500" },
  { id: "slumber_party", name: "Slumber Party", cost: "§240" },
  { id: "neighborhood_potluck", name: "Neighborhood Potluck", cost: "§300" },
  { id: "mountain_climb_excursion", name: "Mountain Climb Excursion", cost: "§200" },
  { id: "wedding", name: "Wedding", cost: "§1,000" },
  { id: "spooky_party", name: "Spooky Party", cost: "§250" },
  { id: "incognito_costume_party", name: "Incognito Costume Party", cost: "§250" },
  { id: "pool_party", name: "Pool Party", cost: "§100" },
  { id: "family_reunion", name: "Family Reunion", cost: "§200" },
  { id: "grand_ball", name: "Grand Ball", cost: "§500" },
  { id: "dinner_party", name: "Dinner Party", cost: "§100" },
  { id: "house_party", name: "House Party", cost: "§100" },
  { id: "weenie_roast", name: "Weenie Roast", cost: "§100" },
  { id: "kava_party", name: "Kava Party", cost: "§100" },
];

export type SecondaryCareerCategoryType = 'Conventional' | 'Unconventional' | 'Part-Timer' | 'Career Hopper' | 'Unemployed';

export interface SecondaryCareerRoll {
  categoryRoll: number; // 1-10
  categoryType: SecondaryCareerCategoryType;
  careerRoll?: number;
  conventional?: ConventionalCareer;
  unconventional?: UnconventionalCareer;
  hopperCareers?: ConventionalCareer[];
  partTime?: PartTimeJob;
  partTime2?: PartTimeJob;
}

export interface SecondaryCareerSlot {
  id: string;
  role: 'spouse' | 'helper';
  label: string; // e.g. "💍 Spouse 1 (First Marriage)", "🤝 Helper Sim 1"
  tag: string;   // e.g. "Spouse", "Subsequent Spouse", "Helper", "Occult Helper"
  career: SecondaryCareerRoll;
}

export interface LegacyRollResult {
  generation: number;
  marital: {
    entry: MaritalStatusEntry;
    diceRoll: number;
    custodySchedule?: CustodySchedule;
    familyDynamic?: string;
    romanticDynamic?: string;
  };
  children: {
    entry: ChildCountRoll;
    diceRoll: number;
    targetCount: number;
    heirOrder?: number;
    heirOrderDescription?: string;
  };
  heirCareer: {
    categoryRoll: number; // 1-10
    categoryType: 'Conventional' | 'Unconventional' | 'Career Hopper' | 'Double Part-timer';
    careerRoll?: number;
    conventional?: ConventionalCareer;
    unconventional?: UnconventionalCareer;
    hopperCareers?: ConventionalCareer[];
    partTime?: PartTimeJob;
    partTime2?: PartTimeJob;
  };
  secondaryCareer: SecondaryCareerRoll | null;
  secondaryCareers?: SecondaryCareerSlot[];
  goal: {
    entry: GenerationGoal;
    diceRoll: number;
    midlifeCrisisAspects?: MidlifeCrisisAspect[];
    midlifeCrisisRevealed?: boolean;
    partyTypes?: string[];
    partyGoals?: PartyEventGoal[];
  };
  fun: {
    entry: MiscFun;
    diceRoll: number;
    rolledMood?: string;
    rolledColor?: string;
    rolledRoommates?: number;
    rolledTroubledTeenType?: string;
  };
  timestamp: string;
  notes?: string;
  isCompleted?: boolean;
}

// ==========================================
// PIECEOFPRINCESS OFFICIAL RULES & GUIDELINES
// Posted by PieceOfPrincess December 26, 2020
// ==========================================

export interface LegacyRuleEntry {
  id: string;
  category: 'Founder' | 'Home' | 'General' | 'Stuff Pack' | 'Game Pack' | 'Expansion Pack';
  title: string;
  pack?: string;
  packCode?: string;
  summary: string;
  details: string;
  icon: string;
}

export const PIECE_OF_PRINCESS_FOUNDER_HOME_RULES: LegacyRuleEntry[] = [
  {
    id: "duration",
    category: "Founder",
    title: "10 Generations Legacy",
    summary: "The legacy is on for 10 generations: starts with Founder (Gen 1) and ends when Generation 10 completes their goals.",
    details: "Your founder starts as generation one. The challenge will successfully end when Generation 10 completes their goals and milestones.",
    icon: "👑"
  },
  {
    id: "founder-identities",
    category: "Founder",
    title: "Creating Your Founder",
    summary: "Decide looks, traits, and personality yourself. Recommended to match rolls style.",
    details: "You can decide the founder's looks, traits, and personality. When you roll for a couple, help, or full house, you can also create their identities. It is recommended to design them in the style of the outcome of your rolls, but it's completely up to you!",
    icon: "🎨"
  },
  {
    id: "gender-identity-unlocked",
    category: "Founder",
    title: "Gender Identity & CAS: Fully Unlocked",
    summary: "Gender identity, pronouns, frame, clothing, and reproductive options are fully unlocked when editing a Sim normally in CAS.",
    details: "When creating your Founder, heirs, partners, or editing a Sim normally in Create-A-Sim (CAS), gender identity, pronouns (He/Him, She/Her, They/Them, Custom), physical frame, clothing preference, reproductive capabilities (can get pregnant, can get others pregnant, science babies co-parenthood), and orientation are completely unlocked and at player discretion.",
    icon: "⚧"
  },
  {
    id: "replace-partner-helper",
    category: "Founder",
    title: "Partner / Helper Replacement Upon Death",
    summary: "When a helper or partner dies, that household spot must be refilled and their job re-rolled.",
    details: "When a helper or partner dies, that spot needs to fill back up (re-marry, create a new sim, move someone in). If this happens, you can re-roll category C2 to give them a new job.",
    icon: "⚰️"
  },
  {
    id: "home-funds",
    category: "Home",
    title: "Creating Your Home (Starting Funds Only)",
    summary: "Start with starting funds only — no cheats or handouts allowed.",
    details: "You start with your starting funds only, no cheats or anything allowed. You can move into an apartment, buy a starter home, or buy an empty lot in any world you'd like to play in.",
    icon: "🏡"
  },
  {
    id: "home-lot-lock",
    category: "Home",
    title: "Stay on Generation Lot (Unless Change of Scenery)",
    summary: "You must play on this generation's lot the entire time, unless you roll 'Change of Scenery'.",
    details: "Keep in mind: you have to play on this generation lot the entire time. The only exception is if your Generation Goal roll is 'Change of Scenery' (Goal #8), which requires you to move houses or rebuild on a different lot.",
    icon: "📍"
  }
];

export const PIECE_OF_PRINCESS_GENERAL_RULES: LegacyRuleEntry[] = [
  {
    id: "gen-rule-1",
    category: "General",
    title: "Rule 1: Fail Roll or Heir Death Without Offspring = Game Over",
    summary: "Failing rolls or dying without offspring ends the lineage — Game Over!",
    details: "If you fail to achieve your rolled requirements before your heir dies/ages out, or if the active Heir dies without leaving any living offspring in the household to succeed them, the royal bloodline falls and it is an immediate Game Over! You must restart the challenge from Generation 1.",
    icon: "☠️"
  },
  {
    id: "gen-rule-2",
    category: "General",
    title: "Rule 2: Heir Selection, Ghost Sims & Offspring",
    summary: "Sims can be ghosts (ghost pregnancy supported). Succession requires surviving offspring.",
    details: "Sims can be ghosts as our precedent rules indicate (playable ghost occult state; ghost heirs can conceive normally via ghost pregnancy mods or Science Babies). You may choose the heir yourself among the children of the heir. However, if the active Heir dies without any surviving offspring, succession cannot occur and it is Game Over.",
    icon: "👑"
  },
  {
    id: "gen-rule-3",
    category: "General",
    title: "Rule 3: Income Restricted to Rolled Career",
    summary: "You only earn money based on the rolled source of income of that particular Sim.",
    details: "Sims may only earn Simoleons from their designated rolled career or unconventional job. No selling random yard finds, no unapproved Plopsy crafting, and no side hustles unless specified by their career roll.",
    icon: "💰"
  },
  {
    id: "gen-rule-4",
    category: "General",
    title: "Rule 4: Age Up Only on Birthday",
    summary: "Sims only age up on their actual birthday, never before.",
    details: "Sims must wait until their birthday notification or natural birthday party to blow out candles and age up. Early birthday cakes or manual aging up are not permitted.",
    icon: "🎂"
  },
  {
    id: "gen-rule-5",
    category: "General",
    title: "Rule 5: No Aspiration Reward Potions",
    summary: "Aspiration reward satisfaction points cannot be spent on potions.",
    details: "You may not purchase or consume Potion of Youth, Moodlet Solvers, Sleep Replacement, or any other satisfaction reward potions from the Rewards Store.",
    icon: "🧪"
  },
  {
    id: "gen-rule-6",
    category: "General",
    title: "Rule 6: Single Sim Co-Parent / Roommate Move-In Restrictions",
    summary: "As a single Sim, do not move the co-parent into the household as roommate; stayovers allowed without chore help; kick out immediately if pregnant.",
    details: "As a single Sim, you are not allowed to move your baby's other parent into the household as a roommate. But they are allowed to live on the lot/unit/community close by. Same goes for other family members, relatives, or friends. They are allowed to stay over, but you are not allowed to influence them in any way to help around the house (cleaning, cooking, child care, etc.). You are allowed to cook together, because it gets the 'main family' involved. If you get pregnant with a roommate or stayover guest, you need to kick them out immediately after the baby is born.",
    icon: "🚪"
  }
];

export const PIECE_OF_PRINCESS_DLC_RULES: LegacyRuleEntry[] = [
  // Stuff Packs
  {
    id: "dlc-rg",
    category: "Stuff Pack",
    title: "Romantic Garden: Wishing Well Banned",
    pack: "Romantic Garden",
    packCode: "RG",
    summary: "The Wishing Well cannot be used.",
    details: "You are not allowed to make wishes on the Whispering Wishing Well for money, skills, romance, or children.",
    icon: "⛲"
  },
  {
    id: "dlc-ld",
    category: "Stuff Pack",
    title: "Laundry Day: Hamper Required & Do Laundry",
    pack: "Laundry Day",
    packCode: "BG",
    summary: "Must place a laundry hamper on the lot and actually do laundry.",
    details: "You must place at least one laundry hamper on the home lot and regularly do the household laundry (wash, dry, hang).",
    icon: "🧺"
  },
  {
    id: "dlc-mos",
    category: "Stuff Pack",
    title: "Moschino: No Photo Income Unless Rolled",
    pack: "Moschino",
    packCode: "BG",
    summary: "Cannot earn money from taking photographs, unless your career roll says so.",
    details: "Taking photos for fun or memories is allowed, but selling photos or fashion photography gigs is strictly forbidden unless your rolled career explicitly allows it.",
    icon: "📸"
  },
  {
    id: "dlc-kn",
    category: "Stuff Pack",
    title: "Nifty Knitting: No Plopsy or Craft Sales Unless Rolled",
    pack: "Nifty Knitting",
    packCode: "KN",
    summary: "Cannot sell crafts on Plopsy or earn money from knitting unless career says so.",
    details: "You can knit clothing or decor for personal household use or gifting, but you may not list knitted items on Plopsy or sell them for profit unless rolled.",
    icon: "🧶"
  },

  // Game Packs
  {
    id: "dlc-do",
    category: "Game Pack",
    title: "Dine Out: May Eat Out, Cannot Own Restaurant",
    pack: "Dine Out",
    packCode: "DO",
    summary: "May eat out at restaurants, but cannot own a restaurant unless career roll says so.",
    details: "Visiting restaurants as a diner is allowed for dates and family meals, but purchasing or operating a restaurant business requires a matching unconventional career roll.",
    icon: "🍽️"
  },
  {
    id: "dlc-v",
    category: "Game Pack",
    title: "Vampires: Vampires Cannot Be Heir Unless Cured/Modded",
    pack: "Vampires",
    packCode: "V",
    summary: "A Vampire cannot be the heir because of lifespan, unless cured to human or modded to age normally.",
    details: "Because vampires are immortal, a vampire Sim cannot be the active heir unless they brew and drink the Vampire Cure to become human, or normal aging mods are utilized.",
    icon: "🧛"
  },
  {
    id: "dlc-ja",
    category: "Game Pack",
    title: "Jungle Adventure: Holidays OK, Discovery Restricted",
    pack: "Jungle Adventure",
    packCode: "JA",
    summary: "May travel for holiday, but cannot discover the jungle or use relics for unfair advantage unless rolled.",
    details: "Sims may vacation in Selvadorada for leisure. However, exploring deep jungle temples or selling excavated relics is banned unless your career roll (e.g. Archaeologist / Treasure Hunter) allows it.",
    icon: "🗿"
  },
  {
    id: "dlc-sv",
    category: "Game Pack",
    title: "StrangerVille: Mother Plant Defeat Restricted",
    pack: "StrangerVille",
    packCode: "SV",
    summary: "May only defeat the Mother Plant if your aspiration is StrangerVille Mystery.",
    details: "Do not solve the StrangerVille mystery or engage the Mother Plant in combat unless your Sim has rolled or chosen the 'StrangerVille Mystery' aspiration.",
    icon: "☣️"
  },
  {
    id: "dlc-rom",
    category: "Game Pack",
    title: "Realm of Magic: Spellcaster Allowed",
    pack: "Realm of Magic",
    packCode: "ROM",
    summary: "May be a Spellcaster.",
    details: "Your Sims are permitted to undergo the Rite of Ascension and practice magic, brew potions (for non-reward store purposes), and explore the Magic Realm.",
    icon: "✨"
  },
  {
    id: "dlc-jtb",
    category: "Game Pack",
    title: "Journey to Batuu: Travel Allowed, No Faction Missions",
    pack: "Journey to Batuu",
    packCode: "JTB",
    summary: "May travel to Batuu, but cannot join or help a faction unless aspiration says so.",
    details: "Sightseeing and cantina visits are fine, but performing faction missions for the Resistance, First Order, or Scoundrels is forbidden unless required by a Batuu aspiration.",
    icon: "🚀"
  },

  // Expansion Packs
  {
    id: "dlc-gtw",
    category: "Expansion Pack",
    title: "Get to Work: Alien Allowed",
    pack: "Get to Work",
    packCode: "GTW",
    summary: "May be an Alien.",
    details: "Alien Sims are fully allowed in the legacy family, including alien abductions and disguised occults.",
    icon: "👽"
  },
  {
    id: "dlc-gt",
    category: "Expansion Pack",
    title: "Get Together: Clubs Allowed but No Household Chores",
    pack: "Get Together",
    packCode: "GT",
    summary: "Clubs allowed, but cannot be used to help with chores, teaching, or raising kids.",
    details: "You may create social, gathering, or hobby clubs. However, setting club activities to clean, fix objects, cook, or do childcare/homework to exploit free labor is banned.",
    icon: "👥"
  },
  {
    id: "dlc-cd",
    category: "Expansion Pack",
    title: "Cats & Dogs: No Pet Income; Friend of Animals = 2 Pets",
    pack: "Cats & Dogs",
    packCode: "C&D",
    summary: "No pet breeding/sales income unless career says so. Friend of Animals aspiration requires adding 2 animals to household.",
    details: "Pets are welcome family members, but selling puppies/kittens for cash is banned unless your career specifies it. If any household member has the 'Friend of the Animals' aspiration, you must add at least 2 animals to your household.",
    icon: "🐾"
  },
  {
    id: "dlc-s",
    category: "Expansion Pack",
    title: "Seasons: Father Winter Baby OK; Lottery Win 20k Empty Lot Rule",
    pack: "Seasons",
    packCode: "S",
    summary: "May have a baby with Father Winter. Playing lottery allowed, but winning forces next generation to move to an empty lot with §20,000.",
    details: "You may romance and have children with Father Winter or other occults. Custom holidays are allowed if they don't grant unfair cheat advantages. You may buy lottery tickets; however, if your Sim wins the lottery, the next generation must move onto a completely empty lot and reset their family funds to §20,000.",
    icon: "❄️"
  },
  {
    id: "dlc-il",
    category: "Expansion Pack",
    title: "Island Living: Mermaid Allowed",
    pack: "Island Living",
    packCode: "IL",
    summary: "May be a Mermaid.",
    details: "Mermaid occult Sims are completely permitted in the household and legacy bloodline.",
    icon: "🧜"
  },
  {
    id: "dlc-du",
    category: "Expansion Pack",
    title: "Discover University: Student Loans OK, No Unrolled Study Income",
    pack: "Discover University",
    packCode: "DU",
    summary: "May enroll and take study loans, but cannot make money while studying unless from rolled career.",
    details: "Sims may attend Foxbury or UBrite and take student loans. However, earning money from extracurriculars, campus tutoring, or term papers is banned unless tied to your rolled career.",
    icon: "🎓"
  },
  {
    id: "dlc-el",
    category: "Expansion Pack",
    title: "Eco Lifestyle: Dumpster Diving OK, No Selling Findings",
    pack: "Eco Lifestyle",
    packCode: "EL",
    summary: "May influence environment and dumpster dive, but cannot sell dumpster findings to earn Simoleons.",
    details: "Eco initiatives, neighborhood action plans (NAPs), and dumpster diving are allowed, but you cannot sell items or furniture salvaged from dumpsters for Simoleons.",
    icon: "♻️"
  },
  {
    id: "dlc-se",
    category: "Expansion Pack",
    title: "Snowy Escape: Travel & Vacations Allowed",
    pack: "Snowy Escape",
    packCode: "SE",
    summary: "May travel and take a vacation to Mt. Komorebi.",
    details: "Skiing, snowboarding, hot springs visits, and hiking vacations in Mt. Komorebi are fully allowed.",
    icon: "⛷️"
  },
  {
    id: "dlc-ls",
    category: "Expansion Pack",
    title: "Lovestruck: Helper Polyamory Allowed (Heir Parentage Restrictions)",
    pack: "Lovestruck",
    packCode: "LS",
    summary: "Polyamory with helpers allowed; poly partners cannot be biological parent of heir unless Half-Siblings rolled.",
    details: "Your Sims are allowed to be romantically involved with helpers (polyamorous playstyle). However, helpers are not allowed to be biologically related to the next generation's heir. Stepchildren and stepsiblings are allowed. In case you rolled 'Half-Siblings' (Marital #33–34), poly partners are permitted to be biological parents.",
    icon: "❤️"
  },
  {
    id: "dlc-bh",
    category: "Expansion Pack",
    title: "Businesses & Hobbies: Home Business Must Link to Rolled Job",
    pack: "Businesses & Hobbies",
    packCode: "B&H",
    summary: "May start a home business ONLY if directly linked to rolled job(s).",
    details: "You are allowed to start a small business (from home or retail) if it can be directly linked to your rolled job(s). E.g., if your Sim is a Fishersim, you are allowed to open a small fish market or host fishing classes.",
    icon: "🏪"
  }
];

export interface LegacyAspirationCareerRule {
  category: string;
  aspiration: string;
  allowedCareers: string[];
  description: string;
  notes?: string;
}

export const ASPIRATION_CAREER_RULES: LegacyAspirationCareerRule[] = [
  {
    category: "Creativity",
    aspiration: "Bestselling Author",
    allowedCareers: ["Writer (Author)", "Freelance Author", "Writer (Journalist)"],
    description: "Must be in Writer (Author branch), Freelance Author, or Writer (Journalist branch)."
  },
  {
    category: "Creativity",
    aspiration: "Painter Extraordinaire",
    allowedCareers: ["Freelance Painter", "Painter (Master of the Real)", "Painter (Patron of the Arts)"],
    description: "Must be a Freelance Painter or Painter career."
  },
  {
    category: "Creativity",
    aspiration: "Musical Genius",
    allowedCareers: ["Freelance Musician", "Entertainer (Musician branch)"],
    description: "Must be a Freelance Musician or Entertainer (Musician)."
  },
  {
    category: "Creativity",
    aspiration: "Master Actor",
    allowedCareers: ["Acting Career"],
    description: "Must be in the Actor / Actress career."
  },
  {
    category: "Creativity",
    aspiration: "Master Maker",
    allowedCareers: ["Freelance Candle Maker", "Civil Designer", "Maker"],
    description: "Must be a Freelance Candle Maker or Maker / Civil Designer."
  },
  {
    category: "Deviance",
    aspiration: "Public Enemy",
    allowedCareers: ["Criminal (Boss)", "Criminal (Oracle)", "Criminal (any)"],
    description: "Must be in the Criminal career (any branch)."
  },
  {
    category: "Food",
    aspiration: "Master Chef",
    allowedCareers: ["Culinary (Chef)", "Culinary (any)"],
    description: "Must be in the Culinary career (Chef branch or any)."
  },
  {
    category: "Food",
    aspiration: "Master Mixologist",
    allowedCareers: ["Culinary (Mixologist)"],
    description: "Must be in Culinary (Mixologist branch)."
  },
  {
    category: "Knowledge",
    aspiration: "Computer Whiz",
    allowedCareers: ["Tech Guru (Start-up Entrepreneur)", "Tech Guru (eSport Gamer)", "Tech Guru (any)"],
    description: "Must be in Tech Guru career; may make 1 video game or app for milestone III.",
    notes: "May make 1 video game or mobile app strictly for milestone III requirement."
  },
  {
    category: "Knowledge",
    aspiration: "Renaissance Sim",
    allowedCareers: ["Career Hopper"],
    description: "Must roll and play as Career Hopper (reaches level 3 in 5 different careers)."
  },
  {
    category: "Knowledge",
    aspiration: "Archaeology Scholar",
    allowedCareers: ["Archaeologist", "Treasure Hunter"],
    description: "Must have the Archaeologist or Treasure Hunter unconventional career."
  },
  {
    category: "Location",
    aspiration: "StrangerVille Mystery",
    allowedCareers: ["Doomsday Preppers", "Military"],
    description: "Must be rolled as Doomsday Preppers or Military career."
  },
  {
    category: "Nature",
    aspiration: "Jungle Explorer",
    allowedCareers: ["Treasure Hunter", "Archaeologist"],
    description: "Must be rolled as Treasure Hunter or Archaeologist."
  },
  {
    category: "Nature",
    aspiration: "Eco Innovator",
    allowedCareers: ["Civil Designer (Civic Planner)", "Civil Designer (Green Technician)", "Civil Designer"],
    description: "Must be in the Civil Designer career."
  },
  {
    category: "Popularity",
    aspiration: "Joke Star",
    allowedCareers: ["Entertainer (Comedian)"],
    description: "Must be in the Entertainer career (Comedian branch)."
  }
];

export interface LegacyAspirationRestriction {
  category: string;
  aspiration: string;
  restriction: string;
  details: string;
}

export const ASPIRATION_SPECIAL_RESTRICTIONS: LegacyAspirationRestriction[] = [
  {
    category: "Family",
    aspiration: "Big Happy Family",
    restriction: "Must have at least 3 children",
    details: "Must roll or have at least 3 children in the generation (Child Count roll of 7+ or re-roll if needed)."
  },
  {
    category: "Family",
    aspiration: "Successful Lineage",
    restriction: "Must not be a deadbeat parent",
    details: "Must actively mentor, raise, and support your children's development and school progress."
  },
  {
    category: "Family",
    aspiration: "Super Parent",
    restriction: "Must not be a deadbeat parent",
    details: "Must actively parent, discipline, praise, and teach mannerisms/values to children."
  },
  {
    category: "Love",
    aspiration: "Soulmate",
    restriction: "Must marry (not single parent)",
    details: "Requires marriage to a spouse; cannot be fulfilled as a Single Parent without getting married."
  },
  {
    category: "Knowledge",
    aspiration: "Spellcraft & Sorcery",
    restriction: "Must Become a Spellcaster",
    details: "Must undergo Rite of Ascension to become a Spellcaster Sim."
  },
  {
    category: "Knowledge",
    aspiration: "Academic",
    restriction: "Must go to University and get a degree and job",
    details: "Must enroll in University, take classes, graduate with a degree, and obtain a job related to it."
  },
  {
    category: "Nature",
    aspiration: "Purveyor of Potions",
    restriction: "Must become a Spellcaster",
    details: "Requires becoming a Spellcaster to unlock cauldron brewing recipes and potion mastery."
  }
];

export function getAspirationRuleCheck(aspiration: string): {
  careerRule?: LegacyAspirationCareerRule;
  restriction?: LegacyAspirationRestriction;
} {
  const norm = aspiration.trim().toLowerCase();
  const careerRule = ASPIRATION_CAREER_RULES.find(r => 
    norm.includes(r.aspiration.toLowerCase()) || r.aspiration.toLowerCase().includes(norm)
  );
  const restriction = ASPIRATION_SPECIAL_RESTRICTIONS.find(r => 
    norm.includes(r.aspiration.toLowerCase()) || r.aspiration.toLowerCase().includes(norm)
  );
  return { careerRule, restriction };
}

export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function getHeirOrderDescription(order: number, total: number): string {
  if (total <= 1) {
    return "The 1st (and only) child born or adopted will be the Next Heir!";
  }
  return `The ${getOrdinal(order)} child in order of birth or adoption will be the Next Heir!`;
}

