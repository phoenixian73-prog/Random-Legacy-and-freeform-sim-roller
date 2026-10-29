import { TraitConflict } from "../types";
import { 
  childAspirationsData, 
  childAspirationMap, 
  childAspirationCategories, 
  childAspirationsByCategory, 
  checkMilestoneSkillCompletion, 
  checkChildAspirationTier3Met,
  ChildAspiration,
  ChildMilestone,
  ChildAspirationCategory
} from "./childAspirations";

export { 
  childAspirationsData, 
  childAspirationMap, 
  childAspirationCategories, 
  childAspirationsByCategory, 
  checkMilestoneSkillCompletion, 
  checkChildAspirationTier3Met 
};
export type { ChildAspiration, ChildMilestone, ChildAspirationCategory };

export * from "./skillsData";


export const traitData: { human: TraitConflict[]; pet: TraitConflict[] } = {
  human: [
    { name: "Active", conflicts: ["Lazy"] },
    { name: "Adventurous", conflicts: ["Lazy"] },
    { name: "Animal Enthusiast", conflicts: [] },
    { name: "Art Lover", conflicts: [] },
    { name: "Bookworm", conflicts: [] },
    { name: "Cheerful", conflicts: ["Gloomy", "Hot-Headed", "Macabre", "Grouch"] },
    { name: "Child of the Islands", conflicts: [] },
    { name: "Child of the Ocean", conflicts: [] },
    { name: "Child of the Village", conflicts: [] },
    { name: "Childish", conflicts: ["Evil", "Hates Children", "Snob"] },
    { name: "Clumsy", conflicts: ["Maker"] },
    { name: "Competitive", conflicts: ["Lazy"] },
    { name: "Creative", conflicts: [] },
    { name: "Cringe", conflicts: [] },
    { name: "Dance Machine", conflicts: [] },
    { name: "Disruptive", conflicts: ["Mystical", "Proper"] },
    { name: "Dog Lover", conflicts: [] },
    { name: "Erratic", conflicts: [] },
    { name: "Evil", conflicts: ["Good", "Generous", "Childish"] },
    { name: "Foodie", conflicts: ["Glutton", "Freegan"] },
    { name: "Freegan", conflicts: ["Materialistic", "Foodie", "Snob"] },
    { name: "Geek", conflicts: [] },
    { name: "Generous", conflicts: ["Evil", "Mean"] },
    { name: "Genius", conflicts: [] },
    { name: "Gloomy", conflicts: ["Cheerful", "Hot-Headed", "Party Animal"] },
    { name: "Glutton", conflicts: ["Foodie", "Squeamish"] },
    { name: "Good", conflicts: ["Evil", "Mean", "Kleptomaniac", "Grouch"] },
    { name: "Goofball", conflicts: ["Snob"] },
    { name: "Green Fiend", conflicts: [] },
    { name: "Grouch", conflicts: ["Cheerful", "Good"] },
    { name: "Hates Children", conflicts: ["Childish"] },
    { name: "High Maintenance", conflicts: [] },
    { name: "Horse Lover", conflicts: [] },
    { name: "Hot-Headed", conflicts: ["Cheerful", "Gloomy"] },
    { name: "Idealist", conflicts: ["Shady"] },
    { name: "Insider", conflicts: ["Loner"] },
    { name: "Jealous", conflicts: [] },
    { name: "Kleptomaniac", conflicts: ["Good"] },
    { name: "Lactose Intolerant", conflicts: [] },
    { name: "Lazy", conflicts: ["Active", "Maker", "Overachiever", "Rancher", "Adventurous", "Neat", "Competitive"] },
    { name: "Loner", conflicts: ["Outgoing", "Insider", "Party Animal"] },
    { name: "Lovebug", conflicts: ["Unflirty", "Romantically Reserved"] },
    { name: "Loves Outdoors", conflicts: ["Squeamish"] },
    { name: "Loyal", conflicts: [] },
    { name: "Macabre", conflicts: ["Cheerful", "Mystical"] },
    { name: "Maker", conflicts: ["Clumsy", "Lazy"] },
    { name: "Materialistic", conflicts: ["Freegan"] },
    { name: "Mean", conflicts: ["Good", "Proper", "Generous"] },
    { name: "Music Lover", conflicts: [] },
    { name: "Mystical", conflicts: ["Disruptive", "Macabre"] },
    { name: "Neat", conflicts: ["Slob", "Lazy"] },
    { name: "Nosy", conflicts: [] },
    { name: "Outgoing", conflicts: ["Loner", "Paranoid", "Socially Awkward"] },
    { name: "Overachiever", conflicts: ["Lazy"] },
    { name: "Paranoid", conflicts: ["Outgoing"] },
    { name: "Party Animal", conflicts: ["Loner", "Socially Awkward", "Gloomy"] },
    { name: "Perfectionist", conflicts: [] },
    { name: "Plant Lover", conflicts: ["Vegetarian"] },
    { name: "Practice Makes Perfect", conflicts: [] },
    { name: "Proper", conflicts: ["Mean", "Slob", "Disruptive"] },
    { name: "Rancher", conflicts: ["Lazy"] },
    { name: "Recycle Disciple", conflicts: [] },
    { name: "Romantic", conflicts: ["Unflirty", "Romantically Reserved"] },
    { name: "Romantically Reserved", conflicts: ["Romantic", "Lovebug"] },
    { name: "Self-Absorbed", conflicts: [] },
    { name: "Self-Assured", conflicts: [] },
    { name: "Shady", conflicts: ["Idealist"] },
    { name: "Skeptical", conflicts: [] },
    { name: "Slob", conflicts: ["Neat", "Squeamish", "Proper"] },
    { name: "Snob", conflicts: ["Goofball", "Childish", "Freegan"] },
    { name: "Socially Awkward", conflicts: ["Outgoing", "Party Animal"] },
    { name: "Squeamish", conflicts: ["Slob", "Glutton", "Loves Outdoors"] },
    { name: "Unflirty", conflicts: ["Romantic", "Lovebug"] },
    { name: "Vegetarian", conflicts: ["Plant Lover"] },
  ],
  pet: [
    { name: "Active", conflicts: ["Couch Potato", "Lazy"] },
    { name: "Couch Potato", conflicts: ["Active"] },
    { name: "Friendly", conflicts: ["Aggressive", "Territorial"] },
    { name: "Aggressive", conflicts: ["Friendly"] },
    { name: "Independent", conflicts: ["Loyal", "Needy"] },
    { name: "Loyal", conflicts: ["Independent"] },
    { name: "Frisky", conflicts: ["Lazy"] },
    { name: "Lazy", conflicts: ["Frisky", "Active"] },
    { name: "Affectionate", conflicts: ["Aloof"] },
    { name: "Aloof", conflicts: ["Affectionate"] },
    { name: "Brave", conflicts: ["Fearful"] },
    { name: "Fearful", conflicts: ["Brave"] },
    { name: "Mellow", conflicts: ["Energetic"] },
    { name: "Energetic", conflicts: ["Mellow"] },
    { name: "Needy", conflicts: ["Independent"] },
  ],
};

export const db = {
  // New World Structure: World -> Neighborhood -> Lots
  worlds: {
    "Willow Creek": {
      "Sage Estates": { residential: ["Ophelia Villa", "Pique Hearth"], community: ["Magnolia Blossom Park"] },
      "Foundry Cove": { residential: ["Streamlet Single", "Crick Cabana", "Daisy Hovel", "Garden Essence"], community: [] },
      "Courtyard Lane": { residential: ["Brook Bungalow", "Riverside Roost", "Potters Splay"], community: [] },
      "Pendula View": { residential: ["Umbrage Manor", "Parkshore"], community: [] },
      "Crawdad Quarter": { residential: [], community: ["The Blue Velvet", "The Cadenza Lounge", "Creekside Smooth", "Municipal Muses", "Movers & Shakers"] }
    },
    "Oasis Springs": {
      "Bedrock Strait": { residential: ["Vista Quarry", "Raffia Quinta", "Pebble Burrow", "Slipshod Mesquite"], community: [] },
      "Parched Prospect": { residential: ["Agave Abode", "Springscape"], community: [] },
      "Skyward Palms": { residential: ["Rio Verde", "Granada Place"], community: [] },
      "Acquisition Butte": { residential: ["Affluista Mansion", "Landgraab Estate"], community: [] },
      "Mirage Canyon": { residential: [], community: ["The Solar Flare", "Rattlesnake Juice", "The Futures Past", "Burners & Builders"] },
      "Desert Bloom Park": { residential: [], community: ["Desert Bloom Park"] }
    },
    "Newcrest": {
      "Bridgeview": { residential: ["Comfy Cubby", "Oak Alcove", "Fern Park", "Beech Byway", "Midtown Meadows"], community: [] },
      "Llama Lagoon": { residential: ["Twin Oracle Point", "Ripple Flats", "Civic Cliffs", "Avarice Acres", "Tranquil Crescent"], community: [] },
      "Ridgeline Drive": { residential: ["Cookout Lookout", "Asphalt Abodes", "Optimist's Outlook", "Sandy Run", "Rippling Flats"], community: [] }
    },
    "San Myshuno": {
      "Spice Market": { residential: ["17 Culpepper House", "18 Culpepper House", "19 Culpepper House", "20 Culpepper House", "Jasmine Suites 2A", "Jasmine Suites 2B", "The Old Salt House"], community: ["Waterside Warble"] },
      "Arts Quarter": { residential: ["910 Medina Studios", "920 Medina Studios", "930 Medina Studios", "Hakim House 121", "Hakim House 122", "Fountain View Penthouse"], community: ["Casbah Gallery"] },
      "Fashion District": { residential: ["21 Chic Street 1310", "21 Chic Street 1312", "21 Chic Street 1313", "ZenView 701", "ZenView 702", "Torendi Tower Penthouse"], community: ["Planet Honey Pop"] },
      "Uptown": { residential: ["1020 Alto Apartments", "1010 Alto Apartments", "VIII Landgraab Apartments", "IX Landgraab Apartments", "888 Spire Apartments"], community: ["Stargazer Lounge"] },
      "Myshuno Meadows": { residential: [], community: ["Myshuno Meadows"] }
    },
    "Windenburg": {
      "Olde Platz": { residential: ["Quad Manor", "Havisham House", "Proprietor's Square"], community: ["The Shrieking Llama"] },
      "Lykke Centre": { residential: [], community: ["The Narwhal Arms", "Hare and Hedgehog", "Discotheque Pan Europa", "South Square Coffee"] },
      "Windslar": { residential: ["Coorinberg Cottage", "Dresden House", "Dock Den"], community: ["Von-Windenburg Estate"] },
      "The Crumbling Isle": { residential: [], community: ["The Bluffs", "Ancient Ruins", "Von Haunt Estate"] }
    },
    "Brindleton Bay": {
      "Sable Square": { residential: ["Domus Familiaris"], community: ["Brindleton Pawspital", "Pupperstone Park"] },
      "Whiskerman's Wharf": { residential: ["Ragdoll Refurb"], community: ["Salty Paws Saloon", "Club Calico"] },
      "Cavalier Cove": { residential: ["Bedlington Boathouse", "Hound's Head"], community: [] },
      "Deadgrass Isle": { residential: [], community: ["Deadgrass Discoveries", "Museum of Owners and Pets"] }
    },
    "Del Sol Valley": {
      "Mirage Park": { residential: ["Inner Circle"], community: ["Morel Hall"] },
      "The Pinnacles": { residential: ["Chateau Peak", "The Ward Den"], community: [] },
      "Starlight Boulevard": { residential: [], community: ["Plumbob Pictures Museum", "Pectoral Fitness", "Orchid A Go Go", "Studio PBP"] }
    },
    "StrangerVille": {
      "Shady Acres": { residential: ["Plateau Place", "Dream Weavers Way"], community: [] },
      "StrangerVille Plaza": { residential: ["Carpophagous Corner", "Riverside Grove"], community: ["8 Bells", "StrangerVille Library"] },
      "Secret Lab": { residential: [], community: ["The Secret Lab"] }
    },
    "Sulani": {
      "Mua Pel'am": { residential: ["Admiral's Wreckage", "Caldera Camp", "Key Point"], community: [] },
      "Ohan'ali Town": { residential: ["Chieftain's Villa", "Lagoon Look", "Kin-Ship"], community: ["The Sand Bar"] },
      "Lani St. Taz": { residential: ["Sapphire Shores", "Reef Finery", "Journey's End"], community: [] }
    },
    "Glimmerbrook": {
      "Glimmerbrook": { residential: ["Rock Ridge Canyon", "Glimmerbrook Watch", "Creek Side Corner"], community: ["Elixirs and Brews", "The Magic Realm"] }
    },
    "Britechester": {
      "Foxbury Institute": { residential: ["Larry's Lagoon", "Maritime Manor"], community: ["Foxbury Commons"] },
      "University of Britechester": { residential: ["Wyvern Hall", "Darkwing House"], community: ["UBrite Commons"] },
      "Gibbs Hill": { residential: ["Honeydew Fields"], community: ["Pepper's Pub", "Laurel Library"] }
    },
    "Evergreen Harbor": {
      "Conifer Station": { residential: ["Pinecrest Apartments #402", "Pinecrest Apartments #404", "Sprucewood Square"], community: ["The Caboose"] },
      "Grims Quarry": { residential: ["Stonestreet Apartments #3", "Stonestreet Apartments #4", "Rockridge Springs"], community: ["The Quarry Building"] },
      "Port Promise": { residential: ["The Shipping Views"], community: ["The Waterfront", "Portsmouth Promenade"] }
    },
    "Mt. Komorebi": {
      "Wakaba": { residential: ["2-4-1 Wakabamori", "2-4-2 Wakabamori", "2-4-3 Wakabamori"], community: ["Hazakura Lounge"] },
      "Senbamachi": { residential: ["5-1-1 Kiyomatsu", "5-1-2 Kiyomatsu"], community: ["Izakaya Ippai", "Hanamigawa Koen"] },
      "Yukimatsu": { residential: ["Snowy Escape Rental"], community: ["Sutefani Onsen Bathhouse", "Kiyomatsu Point"] }
    },
    "Henford-on-Bagley": {
      "Finchwick": { residential: ["Goldbloom's Grocery"], community: ["The Gnome's Arms", "Finchwick Fair"] },
      "Old New Henford": { residential: ["2 Olde Mill Lane", "3 Olde Mill Lane", "14 Nettle Lane"], community: [] },
      "The Bramblewood": { residential: ["Cordelia's Secret Cottage"], community: ["Isle of Volpe"] }
    },
    "Tartosa": {
      "Porto Luminoso": { residential: ["Piccola Luce"], community: ["The Celebrazione", "Baia dell'Amore"] },
      "Terra Amorosa": { residential: ["Via Romanza", "Rifugio dei Pirati", "La Coppia Serena"], community: [] }
    },
    "Moonwood Mill": {
      "Moonwood Mill": { residential: ["The Collective Cabin", "New Moon Shack", "Prowler's Patch"], community: ["The Grimtooth Bar", "Lunvik Excavation Site"] }
    },
    "Copperdale": {
      "Rockridge Heights": { residential: ["Golden Heights"], community: ["Copperdale High School", "Auditorium"] },
      "Prescott Square": { residential: ["Lakeview"], community: ["ThrifTea", "Library"] },
      "Plumbite Cove": { residential: ["Little Falls Nook", "Hillside Haven"], community: ["Totter Park"] }
    },
    "San Sequoia": {
      "Anchorpoint Wharf": { residential: ["Hopewell Hills"], community: ["Gilbert Gardens", "Anchorpoint Library"] },
      "Gilbert Gardens": { residential: ["Parkside Place"], community: ["Celebration Center"] },
      "Hopewell Hills": { residential: ["Sequoia Cottage", "Hilltop Haven"], community: [] }
    },
    "Chestnut Ridge": {
      "Riders' Glen": { residential: ["Biscuit's Bastion", "Sweet Nectar Glade", "Canter Cottage", "Grapevine Terrace"], community: [] },
      "New Appaloosa": { residential: ["Appaloosa Plains"], community: ["The Rusty Horseshoe", "Duke's Hall"] },
      "Galloping Gulch": { residential: ["Canyon Crossing", "Big Sky Ranch", "Palomino Point"], community: [] }
    },
    "Tomarang": {
      "Morensong": { residential: ["Ro Kaya Rockside", "Taka Soi 15", "Taka Soi 15 Unit 08", "Taka Soi 15 Unit 09"], community: [] },
      "Koh Sahpa": { residential: ["11B Sungai Point", "11C Sungai Point", "Tam Nang Sands"], community: ["The Screaming Gecko Lounge"] }
    },
    "Ciudad Enamorada": {
      "Plaza Mariposa": { residential: ["Calle del Ensueño", "Villa Cálida", "Avenida de la Eternidad"], community: [] },
      "Vista Hermosa": { residential: ["Calle de la Promesa", "Mansión de la Pasión", "Casita del Amor"], community: ["Media Naranja Park"] },
      "Nuevo Corazón": { residential: ["Torre de los Amantes"], community: ["Mirador del Amor", "SUDOR Gym"] }
    },
    "Ondarion": {
      "Bellacorde": { residential: ["Bellacorde Palace", "Renaissance Road", "Lakeview Apartments 12", "Lakeview Apartments 13"], community: ["La Vivace", "Giardino Del Grandioso"] },
      "Verdemar": { residential: ["Verdemar Palace", "Abrantes Estate", "Casa de Corsário"], community: ["Fisherman's Hut", "The Lair In The Open-Air", "Ye Old Voyager"] },
      "Dambele": { residential: ["Dambele Palace", "Bridge Cliff Apartments 17", "Bridge Cliff Apartments 18", "Sankofa Residence"], community: ["Zanbira Market", "Hardcover"] }
    },
    "Nordhaven": {
      "Gammelvik": { residential: ["Comfortably Canalside", "Fisher's Horizon", "Old Torget House"], community: ["Koffieboon", "The Rouge Note", "Konst Modern"] },
      "Iverstad": { residential: ["Lighthouse Lookout", "Inked Inlet"], community: ["Spilled Neon", "The Old Foundry", "Terra-Potta", "New Harbor Park"] }
    },
    "Innisgreen": {
      "Coast of Adhmor": { residential: ["Adhmor Street"], community: ["The Gnom Exhibit", "Fern & Frond Wading Pond"] },
      "Sprucederry Grove": { residential: [], community: ["Fairy Library", "Gringle's Music Bar", "Inniscreen Plant Cafe"] },
      "Everdew": { residential: ["Enchanted Fairy Home", "Dewdrop Cottage"], community: ["Enchanted Bistro"] }
    },
    "Gibbi Point": {
      "Wanderwood Wilds": { residential: ["Wanderwood Camp", "Forest Retreat"], community: [] },
      "Jellyfish Junction": { residential: ["Jellyfish Cove"], community: ["Marine Center"] },
      "Crystal Valley": { residential: ["Crystal Cave"], community: ["Gemstone Grotto"] }
    },
    "Ravenwood": {
      "Crow's Crossing": { residential: ["Midnight Manor"], community: ["The Crow's Nest", "Raven's Perch"] },
      "Whispering Glen": { residential: ["Whispering Woods", "Silent Stream"], community: [] },
      "Mourningvale": { residential: ["Mourning Manor", "Gravekeeper's Hut"], community: ["Netherworld Department of Death"] }
    }
  },

  lotTraits: [
    "Bracing Breezes",
    "Breeding Ground",
    "Cat Hangout",
    "Celebrity Home",
    "Chef's Kitchen",
    "Child's Play",
    "Clandestine",
    "Convivial",
    "Dog Hangout",
    "Eco Lot",
    "Fairy Passage",
    "Fast Internet",
    "Geothermal",
    "Gnomes",
    "Good Schools",
    "Great Acoustics",
    "Great Soil",
    "Home Studio",
    "Homey",
    "Island Spirits",
    "Mean Vibe",
    "Natural Light",
    "Natural Well",
    "On Hallowed Grounds",
    "On Ley Line",
    "On a Dark Ley Line",
    "Party Place",
    "Peace and Quiet",
    "Penny Pixies",
    "Private Dwelling",
    "Regal Residence",
    "Registered Vampire Lair",
    "Romantic Aura",
    "Science Lair",
    "Singles Hangout",
    "Study Spot",
    "Sunny Aspect",
    "Teen Neighborhood",
    "Training Ground",
    "Vampire Nexus"
  ],
  lotChallenges: [
    "Creepy Crawlies",
    "Cursed",
    "Gremlins",
    "Grody",
    "Heist Havoc",
    "Maintenance Troubles",
    "Mold",
    "Off-the-Grid",
    "Quake Zone",
    "Reduce and Recycle",
    "Simple Living",
    "Wild Foxes",
    "Wild Prairie Grass"
  ],

  dwellingChallengeRestrictions: {
    "Apartment": ["Wild Foxes", "Wild Prairie Grass", "Off-the-Grid"],
    "Penthouse": ["Wild Prairie Grass"],
    "Tiny Home": ["Maintenance Troubles"], // Tiny homes have access to wild prairie grass, but not maintenance troubles
    "Haunted Home": ["Cursed"],
    "Residential Rental": ["Wild Prairie Grass"],
    "Standard Residential": []
  } as Record<string, string[]>,

  stages: ["Infant", "Toddler", "Child", "Teen", "Young Adult", "Adult", "Elder"],
  teenPlusStages: ["Teen", "Young Adult", "Adult", "Elder"],
  petStages: ["Baby", "Adult", "Elder"],
  occults: ["Alien", "Vampire", "Mermaid", "Spellcaster", "Werewolf", "Fairy", "Servo", "Imaginary Friend"],
  servoModules: ["Eco-Friendly Tech", "Fix-O-Matic", "Parameterize and Sanitize", "Party Machine", "RoboNanny", "Sim Defence Matrix"],
  pregnancyWeighted: [
    "Neither", "Neither",
    "Can get pregnant", "Can get pregnant", "Can get pregnant",
    "Can get others pregnant", "Can get others pregnant", "Can get others pregnant"
  ],

  adultTraits: traitData.human.map((t) => t.name),
  childTraits: [
    "Active", "Adventurous", "Animal Enthusiast", "Art Lover", "Bookworm", "Cheerful",
    "Child of the Islands", "Child of the Ocean", "Child of the Village", "Clumsy", "Competitive", "Creative", "Cringe",
    "Dog Lover", "Erratic", "Geek", "Genius", "Gloomy", "Glutton", "Good", "Goofball", "Green Fiend",
    "Grouch", "Hot-Headed", "Idealist", "Kleptomaniac", "Lactose Intolerant", "Lazy", "Loner", "Loves Outdoors",
    "Mean", "Music Lover", "Neat", "Outgoing", "Perfectionist", "Plant Lover", "Practice Makes Perfect", "Proper",
    "Recycle Disciple", "Slob", "Socially Awkward", "Squeamish", "Vegetarian"
  ],
  infantTraits: ["Calm", "Cautious", "Intense", "Sunny", "Wiggly", "Sensitive"],
  toddlerTraits: ["Angelic", "Fussy", "Silly", "Independent", "Wild", "Clingy", "Inquisitive", "Charmer"],
  dogTraits: ["Active", "Adventurous", "Aggressive", "Couch Potato", "Friendly", "Glutton", "Hairy", "Hunter", "Independent", "Jumpy", "Loyal", "Playful", "Sleuth", "Smart", "Stubborn", "Troublemaker", "Vocal"],
  catTraits: ["Affectionate", "Aloof", "Clever", "Curious", "Fluffy", "Free Spirit", "Friendly", "Frisky", "Glutton", "Lazy", "Mischievous", "Prowler", "Skittish", "Spoiled", "Talkative", "Territorial"],
  horseTraits: ["Aggressive", "Brave", "Defiant", "Energetic", "Fearful", "Free Spirit", "Friendly", "Independent", "Intelligent", "Mellow", "Needy"],

  aspirationsChild: childAspirationsData.map(a => a.name),
  aspirationsTeen: ["Drama Llama", "Goal Oriented", "Live Fast", "Admired Icon"],
  aspirationsAdult: [
    "Friend of the Animals", "Bodybuilder", "Extreme Sports Enthusiast", "Championship Rider",
    "Painter Extraordinaire", "Musical Genius", "Bestselling Author", "Master Actor", "Master Maker", "Lord/Lady of the Knits",
    "Public Enemy", "Chief of Mischief", "Villainous Valentine", "Seeker of Secrets", "Sticky Fingers", "Master of Grudges", "Social Puppeteer",
    "Fairy Stories", "Discordant Fairy", "Harmonious Fairy",
    "Successful Lineage", "Big Happy Family", "Vampire Family", "Super Parent",
    "Master Chef", "Master Mixologist", "Expert Nectar Maker", "Appliance Wiz",
    "Fabulously Wealthy", "Mansion Baron", "Market Magnate", "Five-Star Property Owner",
    "Renaissance Sim", "Nerd Brain", "Computer Whiz", "Master Vampire", "Archaeology Scholar", "Spellcraft & Sorcery", "Academic", "Ghost Historian", "Master Mentor", "Elixir Enthusiast",
    "City Native", "StrangerVille Mystery", "Beach Life", "Mt. Komorebi Sightseer", "Perfectly Pristine", "Fabulously Filthy", "Fount of Tomarani Knowledge",
    "Serial Romantic", "Soulmate", "Romantic Explorer", "Paragon Partner",
    "Freelance Botanist", "The Curator", "Angling Ace", "Outdoor Enthusiast", "Jungle Explorer", "Purveyor of Potions", "Eco Innovator", "Country Caretaker", "Crystal Crafter", "Nature Nomad", "Critter Hunter",
    "Joke Star", "Party Animal", "Friend of the World", "Neighborhood Confidante", "Leader of the Pack", "Good Vampire", "World-Famous Celebrity", "Discerning Dweller", "Esteemed Entrepreneur",
    "Hope VS Order", "Paragon of Hope", "Enforcer of Order", "Galactic Privateer",
    "Inner Peace", "Self-Care Specialist", "Zen Guru",
    "Werewolf Initiate", "Lone Wolf", "Emissary of the Collective", "Wildfang Renegade", "Cure Seeker"
  ],
  adultSkills: [
    // Base Game
    "Charisma", "Comedy", "Cooking", "Fishing", "Fitness", "Gardening", "Gourmet Cooking", "Guitar",
    "Handiness", "Logic", "Mischief", "Mixology", "Painting", "Photography", "Piano", "Programming",
    "Rocket Science", "Video Gaming", "Violin", "Writing",
    // Outdoor Retreat & GTW
    "Herbalism", "Baking",
    // Spa Day & Get Together & City Living
    "Wellness", "Dancing", "DJ Mixing", "Singing",
    // Vampires & Bowling & Parenthood
    "Pipe Organ", "Vampire Lore", "Bowling", "Parenting",
    // Cats & Dogs & Jungle Adventure
    "Pet Training", "Veterinarian", "Archaeology", "Selvadoradian Culture",
    // Seasons, Get Famous, Discover University
    "Flower Arranging", "Acting", "Media Production", "Research & Debate", "Robotics",
    // Eco Lifestyle, Nifty Knitting, Snowy Escape, Paranormal
    "Fabrication", "Juice Fizzing", "Knitting", "Rock Climbing", "Skiing", "Snowboarding", "Medium",
    // Cottage Living & High School Years & Horse Ranch
    "Cross-stitch", "Entrepreneur", "Horse Riding", "Nectar Making",
    // Crystal Creations, Lovestruck, Life & Death
    "Gemology", "Romance", "Thanatology",
    // Businesses & Hobbies
    "Pottery", "Tattooing",
    // Enchanted by Nature
    "Apothecary", "Natural Living",
    // Adventure Awaits
    "Archery", "Diving", "Entomology", "Papercraft",
    // Royalty & Legacy
    "Swordsmanship"
  ],
  childSkills: ["Creativity", "Mental", "Motor", "Social"],
  toddlerSkills: ["Communication", "Imagination", "Movement", "Potty", "Thinking"],
  horseSkills: ["Agility - (Horse Skill)", "Endurance - (Horse Skill)", "Jumping - (Horse Skill)", "Temperament - (Horse Skill)"],

  allCareers: [
    "<strong>Astronaut:</strong> Space Ranger",
    "<strong>Astronaut:</strong> Interstellar Smuggler",
    "<strong>Athlete:</strong> Professional Athlete",
    "<strong>Athlete:</strong> Bodybuilder",
    "<strong>Business:</strong> Management",
    "<strong>Business:</strong> Investor",
    "<strong>Criminal:</strong> Boss",
    "<strong>Criminal:</strong> Oracle",
    "<strong>Culinary:</strong> Chef",
    "<strong>Culinary:</strong> Mixologist",
    "<strong>Entertainer:</strong> Musician",
    "<strong>Entertainer:</strong> Comedian",
    "<strong>Freelancer:</strong> Digital",
    "<strong>Freelancer:</strong> Programmer",
    "<strong>Freelancer:</strong> Writer",
    "<strong>Painter:</strong> Master of the Real",
    "<strong>Painter:</strong> Patron of the Arts",
    "<strong>Secret Agent:</strong> Diamond Agent",
    "<strong>Secret Agent:</strong> Villain",
    "<strong>Style Influencer:</strong> Trendsetter",
    "<strong>Style Influencer:</strong> Stylist",
    "<strong>Tech Guru:</strong> eSport Gamer",
    "<strong>Tech Guru:</strong> Start-up Entrepreneur",
    "<strong>Writer:</strong> Author",
    "<strong>Writer:</strong> Journalist",
    "<strong>GTW:</strong> Detective",
    "<strong>GTW:</strong> Doctor",
    "<strong>GTW:</strong> Scientist",
    "<strong>CL - Critic:</strong> Arts Critic",
    "<strong>CL - Critic:</strong> Food Critic",
    "<strong>CL - Politician:</strong> Politician",
    "<strong>CL - Politician:</strong> Charity Organizer",
    "<strong>CL - Social Media:</strong> Internet Personality",
    "<strong>CL - Social Media:</strong> Public Relations",
    "<strong>S - Gardener:</strong> Botanist",
    "<strong>S - Gardener:</strong> Floral Designer",
    "<strong>GF:</strong> Actor",
    "<strong>SV - Military:</strong> Covert Operator",
    "<strong>SV - Military:</strong> Officer",
    "<strong>IL - Conservationist:</strong> Environmental Manager",
    "<strong>IL - Conservationist:</strong> Marine Biologist",
    "<strong>DU - Education:</strong> Administrator",
    "<strong>DU - Education:</strong> Professor",
    "<strong>DU - Engineer:</strong> Computer Engineer",
    "<strong>DU - Engineer:</strong> Mechanical Engineer",
    "<strong>DU - Law:</strong> Judge",
    "<strong>DU - Law:</strong> Private Attorney",
    "<strong>EL - Freelancer:</strong> Crafter",
    "<strong>EL - Civil Designer:</strong> Civic Planner",
    "<strong>EL - Civil Designer:</strong> Green Technician",
    "<strong>SE - Salaryperson:</strong> Expert",
    "<strong>SE - Salaryperson:</strong> Supervisor",
    "<strong>MS - Freelancer:</strong> Fashion Photographer Branch",
    "<strong>P - Freelancer:</strong> Paranormal Investigator",
    "<strong>DHD:</strong> Interior Decorator",
    "<strong>LS - Romance Consultant:</strong> Matchmaker",
    "<strong>LS - Romance Consultant:</strong> Relationship Counsellor",
    "<strong>L&D:</strong> Reaper",
    "<strong>L&D - Undertaker:</strong> Mortician",
    "<strong>L&D - Undertaker:</strong> Funeral Director",
    "<strong>EBN - Naturopath:</strong> Apothe-curist",
    "<strong>EBN - Naturopath:</strong> Lifestyle Coaching",
    "<strong>AA - Park Worker:</strong> Park Counselor",
    "<strong>AA - Park Worker:</strong> Park Ranger",
    "<strong>R&L:</strong> Noble",
    "<strong>Noble:</strong> Aristocrat & Landowner (Steward ancestral estates, host high society balls, and collect hereditary royal rents)",

    "<strong>Freelance Painter:</strong> Paint at home whenever you want and sell your creations.",
    "<strong>Freelance Author:</strong> Write at home and sell your books.",
    "<strong>Freelance Musician:</strong> Play an instrument outside and collect tips.",
    "<strong>Gardener:</strong> Earn money with your harvests.",
    "<strong>Fishersim:</strong> Sell your catches.",
    "<strong>Collector:</strong> Sell your outside treasures from digging, collecting and such.",
    "<strong>Carpenter:</strong> Use a crafting bench and create and sell furniture.",
    "<strong>Freelance Comedian:</strong> Use the microphone and perform stand-up comedy.",
    "<strong>Freelance Programmer:</strong> Create plugins, apps etc.",
    "<strong>Space Explorer:</strong> Build a rocket and explore to infinity and beyond.",
    "<strong>Professional Gamer:</strong> Enter tournaments, etc.",
    "<strong>Cybercriminal:</strong> Create viruses and hack for money.",
    "<strong>Professional Host(ess):</strong> Host social gatherings and sell the rewards you earn.",
    "<strong>Freelance Photographer:</strong> Take pictures of anything, anywhere and sell them.",
    "<strong>NK - The Knitter:</strong> Knit and sell your wooly creations.",
    "<strong>OR - Remedy Brewer:</strong> Brew herbal remedies and sell them for profit.",
    "<strong>DO - Restaurateur:</strong> Manage your own restaurant.",
    "<strong>JA - Treasure Hunter:</strong> Treasures, relics, artifacts, and fossils to sell or keep.",
    "<strong>JA - Archeologist:</strong> Use the archaeology table to authenticate relics. You may also write archaeology books.",
    "<strong>GTW - Retail Owner:</strong> Manage a store.",
    "<strong>GT - DJ:</strong> Earn tips and license mix tapes as a Disk Jockey.",
    "<strong>CL - Festival Fanatic:</strong> Win and sell prices at festival games, sell free posters etc.",
    "<strong>C&D - Veterinarian:</strong> Manage your own clinic.",
    "<strong>C&D - Breeder:</strong> Breed cats or dogs. Max 2 litters per female. Befriend parent animals first.",
    "<strong>C&D - Animal Trainer:</strong> Have a cat (prowler) or dog (hunter) search for loot. Sell treasures and perform tricks for money.",
    "<strong>S - Flower Arranger:</strong> Craft flower arrangements and sell them.",
    "<strong>S - Bee Keeper:</strong> Keep hives and sell their honey.",
    "<strong>GF - Video Producer:</strong> Use the Video Station to earn money.",
    "<strong>GF - Video Producer:</strong> Use the Music Station to earn money.",
    "<strong>GF - Influencer:</strong> Become famous and use perks based on Corporate Partnership.",
    "<strong>IL - Beachcomber:</strong> Sell items found on the beach.",
    "<strong>IL - Odd Jobs:</strong> Earn money with performing odd jobs.",
    "<strong>EL - Freelance Candle Maker:</strong> Make and sell candles.",
    "<strong>EL - Freelance Decorator:</strong> Make and sell furnishings.",
    "<strong>EL - Freelance Drink Maker:</strong> Make and sell fizzy drinks.",
    "<strong>EL - Dumpster Diver:</strong> Dive into Dumpsters and make a living off the findings.",
    "<strong>DU - Bot-Bot Creator:</strong> Create robot toys and other robotics.",
    "<strong>COL - Farmer:</strong> Live off your land, grow and sell crops, cows, llamas, chickens etc.",
    "<strong>HY - Fashion Designer:</strong> Create Fashion Looks and Sell outfits on Trendi.",
    "<strong>SD - Yoga/Meditation Instructor:</strong> Become an instructor at a spa or host classes at home.",
    "<strong>SD - Massage Therapist:</strong> Give massages at the spa or create a private salon at home.",
    "<strong>SD - Nail Technician:</strong> Work at the spa or invite people over as customers.",
    "<strong>HR - Mini-farmer:</strong> Sell milk and wool from mini-goats and mini-sheep. Sell horse manure.",
    "<strong>HR - Equestrian:</strong> Train your horse(s) and win awards at the equestrian center.",
    "<strong>HR - Nectar connoisseur:</strong> Make and sell your own nectar.",
    "<strong>HR - Community Job hopper:</strong> Make a living from community board jobs.",
    "<strong>FR - Landlord:</strong> Purchase and renovate multiple residential rentals.",
    "<strong>SV/FR - Seller of Secrets:</strong> Blackmail by eavesdropping (FR) or spy tool (SV) to sell secrets.",
    "<strong>Burglar:</strong> Need Kleptomaniac trait. Earn money by stealing.",
    "<strong>HSH - Cabbage Merchant:</strong> Set up a food stand to sell your culinary creations.",
    "<strong>GF - Autograph Appraiser:</strong> Obtain and sell celebrity autographs.",
    "<strong>CC - Jewelry Maker:</strong> Cut crystals and customize jewelry to sell.",
    "<strong>CC - Crystal Farmer:</strong> Make crystal seeds, grow trees, sell crystals.",
    "<strong>L&D - Tarot Reader:</strong> Give tarot readings for simoleons.",
    "<strong>L&D - Spooky Explorer:</strong> Explore Crypts and Infested Abandoned Houses. Sell the loot.",
    "<strong>L&D - Ghost Host:</strong> Turn your lot into a Haunted House, scare sims for tips and sell Essences.",
    "<strong>MWS - Wedding Cake Designer:</strong> Make and sell wedding cakes.",
    "<strong>CL - Flea Market Flipper:</strong> Buy cheap at the Flea Market and sell from inventory at full price.",
    "<strong>B&H - Tattoo Artist/Tattooist:</strong> Earn money by tattooing and/or giving tattoo classes.",
    "<strong>B&H - Ceramics Artist/Potter:</strong> Earn money by pottery and/or giving pottery classes.",
    "<strong>B&H - Sweet Shop/Confectioner:</strong> Earn money by selling Candy and/or giving Cooking classes.",
    "<strong>B&H - Master of Heists:</strong> Earn money by going on heists or pickpocketing.",
    "<strong>B&H - Small Business Owner – Service and Activity:</strong> Create a Cinema, Laundromat, Day-Care, etc.",
    "<strong>B&H - Small Business Owner – Hospitality:</strong> Create a small hotel or Bed & Breakfast.",
    "<strong>B&H - Small Business Owner – Mini Mall:</strong> Create a Mini Mall with multiple business types.",
    "<strong>EBN - Forager:</strong> Forage and sell ingredients.",
    "<strong>EBN - Apothecary:</strong> Sell crafted Cures/Elixirs.",
    "<strong>EBN - Natural Artist:</strong> Sell crafted Nature Press decorations and gnomes.",
    "<strong>Quest Adventurer:</strong> Do Local Quests and sell rewards.",
    "<strong>AA - Archer:</strong> Earn money from Archery contests and bow-fishing.",
    "<strong>AA - Entomologist:</strong> Earn money raising and catching butterflies/moths.",
    "<strong>AA - Papercrafter:</strong> Make and sell Papercraft items.",
    "<strong>AA - Getaway Host:</strong> Host Getaways on your home lot.",
    "<strong>AA - Getaway Contestant:</strong> Win prize money from Elimination Getaways.",
    "<strong>AA - Travel Blogger/Vlogger:</strong> Go on Getaways and monetise your experiences.",
    "<strong>AA - Crystal Panner:</strong> Earn money by Crystal Panning.",
    "<strong>R&L - Freelance Investor:</strong> Requires $1000 starting funds & access to a computer.",
    "<strong>R&L - Swordsman:</strong> Earn money from Tournaments, Duelling for Money and Mentoring.",
    "<strong>R&L - Passageway Explorer:</strong> Explore passageways for cash/items.",
    "<strong>R&L - Seller of Secrets:</strong> Discover and sell Secrets to the Info Broker.",
    "<strong>R&L - Self-Sabotage:</strong> Live a Scandalous life and sell your own Secrets.",
    "<strong>Robin Hood:</strong> Have Kleptomaniac + Good/Generous traits. Steal from the rich, give half to the poor."
  ],

  romanceDynamics: ["Steamy", "Strained", "Unpredictable", "Wholesome"],
  familyDynamicsPeer: ["Close", "Distant", "Jokesters", "Difficult"],
  familyDynamicsAuth: ["Close", "Distant", "Jokesters", "Difficult"],
  familyDynamics: ["Close", "Distant", "Jokesters", "Difficult"]
};

export const deathDB: any = {
  Child: ["Fire", "Drowning", "Freezing", "Overheating", "Pufferfish", "Meteorite", "Mold (Toxic Moldinitis)", "Murder of Crows"],
  TeenPlus: [
    "Laughter (Hysteria)", "Embarrassment (Mortified)", "Fire", "Drowning",
    "Electrocution", "Hunger", "Cowplant", "Meteorite", "Pufferfish", "Poison",
    "Rodent Fever", "Freezing", "Overheating", "Lightning", "Steam",
    "Swarmed by Flies", "Murphy Bed", "Beetle Juice", "Vending Machine",
    "Falling from Heights", "Killer Animal (Chicken/Rabbit)", "Urban Myth",
    "Mold (Toxic Moldinitis)", "Broken Heart", "Murder of Crows", "Cuckoo Malfunction",
    "Mother Plant Consumption"
  ],
  ElderOnly: ["Old Age", "Overexertion", "Flowers"],
  Occult: {
    "Spellcaster": ["Spellcaster Overload"],
    "Fairy": ["Emotional Starvation", "Emotional Overload"],
    "Servo": ["Catastrophic Meltdown"],
    "Vampire": ["Sunlight"]
  },
  Pet: ["Old Age"]
};

export const aspReqs: any = {
  "Master Chef": { career: "<strong>Culinary:</strong> Chef" },
  "Master Mixologist": { career: "<strong>Culinary:</strong> Mixologist" },
  "Computer Whiz": { career: "<strong>Tech Guru:</strong> eSport Gamer" },
  "Public Enemy": { career: "<strong>Criminal:</strong> Boss" },
  "Master Actor": { career: "<strong>GF:</strong> Actor", world: "Del Sol Valley" },
  "Joke Star": { career: "<strong>Entertainer:</strong> Comedian" },
  "Eco Innovator": { career: "<strong>EL - Civil Designer:</strong> Civic Planner", world: "Evergreen Harbor" },
  "Master Vampire": { occult: "Vampire" },
  "Vampire Family": { occult: "Vampire" },
  "Good Vampire": { occult: "Vampire" },
  "Spellcraft & Sorcery": { occult: "Spellcaster", world: "Glimmerbrook" },
  "Purveyor of Potions": { occult: "Spellcaster", world: "Glimmerbrook" },
  "Werewolf Initiate": { occult: "Werewolf", world: "Moonwood Mill" },
  "Lone Wolf": { occult: "Werewolf", world: "Moonwood Mill" },
  "Emissary of the Collective": { occult: "Werewolf", world: "Moonwood Mill" },
  "Wildfang Renegade": { occult: "Werewolf", world: "Moonwood Mill" },
  "Cure Seeker": { occult: "Werewolf", world: "Moonwood Mill" },
  "Fairy Stories": { occult: "Fairy" },
  "Discordant Fairy": { occult: "Fairy" },
  "Harmonious Fairy": { occult: "Fairy" },
  "Master Maker": { career: "<strong>EL - Freelancer:</strong> Crafter", world: "Evergreen Harbor" },
  "City Native": { world: "San Myshuno" },
  "StrangerVille Mystery": { world: "StrangerVille" },
  "Beach Life": { world: "Sulani" },
  "Mt. Komorebi Sightseer": { world: "Mt. Komorebi" },
  "Extreme Sports Enthusiast": { world: "Mt. Komorebi" },
  "Country Caretaker": { world: "Henford-on-Bagley" },
  "Tomarang Expert": { world: "Tomarang" },
  "Sequoia": { world: "San Sequoia" }
};

export interface ChildMultiSkillInfo {
  name: "Creativity" | "Mental" | "Motor" | "Social";
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
  unlockedAdultSkills: string[];
  aspiration: string;
  packAspiration: string;
  rewardTrait: string;
}

export const childMultiSkillConfig: Record<string, ChildMultiSkillInfo> = {
  Creativity: {
    name: "Creativity",
    icon: "🎨",
    color: "text-amber-400",
    badgeBg: "bg-amber-950/70 text-amber-200 border-amber-600/60",
    borderColor: "border-amber-500/50",
    description: "Painting, drawing table, puppet theater, and musical instruments.",
    unlockedAdultSkills: ["Piano", "Violin"],
    aspiration: "Artistic Prodigy",
    packAspiration: "Creative Genius",
    rewardTrait: "Creatively Gifted"
  },
  Mental: {
    name: "Mental",
    icon: "🧠",
    color: "text-sky-400",
    badgeBg: "bg-sky-950/70 text-sky-200 border-sky-600/60",
    borderColor: "border-sky-500/50",
    description: "Chess, science lab experiments, reading, and mental puzzles.",
    unlockedAdultSkills: ["Logic", "Video Gaming", "Fishing"],
    aspiration: "Whiz Kid",
    packAspiration: "Mind and Body",
    rewardTrait: "Mentally Gifted"
  },
  Motor: {
    name: "Motor",
    icon: "🏃",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-950/70 text-emerald-200 border-emerald-600/60",
    borderColor: "border-emerald-500/50",
    description: "Jungle gym, monkey bars, active play, and keyboard practice.",
    unlockedAdultSkills: ["Fitness"],
    aspiration: "Rambunctious Scamp",
    packAspiration: "Playtime Captain",
    rewardTrait: "Physically Gifted"
  },
  Social: {
    name: "Social",
    icon: "🗣️",
    color: "text-purple-400",
    badgeBg: "bg-purple-950/70 text-purple-200 border-purple-600/60",
    borderColor: "border-purple-500/50",
    description: "Talking to Sims, big stuffed animals, mirrors, and dollhouses.",
    unlockedAdultSkills: ["Charisma", "Mischief"],
    aspiration: "Social Butterfly",
    packAspiration: "Slumber Party Animal",
    rewardTrait: "Socially Gifted"
  }
};

export const lotTraitDescriptions: Record<string, string> = {
  "Bracing Breezes": "Lots of fresh air gives Sims a boost when exercising and makes them energized longer.",
  "Breeding Ground": "Increases the chances for pet litters and larger litter sizes.",
  "Cat Hangout": "Stray cats will wander into the lot frequently to lounge and play.",
  "Celebrity Home": "Increases Fame gain and keeps out unwanted standard visitors, though paparazzi may linger.",
  "Chef's Kitchen": "Food prepared here tastes higher quality and Sims gain Cooking skills faster.",
  "Child's Play": "Children learn all fundamental skills faster and build happiness quickly here.",
  "Clandestine": "Secretive dealings, vampire and occult covert operations thrive in the shadows of this lot.",
  "Convivial": "Warm social ambiance; Sims gain Charisma, Comedy, and Mischief skills faster.",
  "Dog Hangout": "Neighborhood stray dogs frequently visit seeking treats, play, and friendship.",
  "Eco Lot": "Reduces power and water bills, naturally promoting green energy and eco-conscious living.",
  "Fairy Passage": "A mystical threshold where fairies, spirits, and magical anomalies flit into reality.",
  "Fast Internet": "High-speed broadband boosts Programming, Video Gaming, and Writing skill gains.",
  "Geothermal": "Natural geothermal energy warms the water, reduces utility bills, and provides clean power.",
  "Gnomes": "Helpful gnomes stealthily repair broken plumbing and electronics overnight.",
  "Good Schools": "Kids and teens achieve better grades, finish homework faster, and boost school performance.",
  "Great Acoustics": "Instruments and vocals resonate beautifully, boosting Guitar, Piano, Violin, and Singing gains.",
  "Great Soil": "Gardening crops thrive with faster growth and superior quality harvests.",
  "Home Studio": "Creative arts flow effortlessly; boosts Painting, Writing, Woodworking, and Photography.",
  "Homey": "Cozy domestic atmosphere boosts Cooking, Baking, Handiness, and Mixology skills.",
  "Island Spirits": "Spirits of the islands visit regularly to bless or judge inhabitants.",
  "Mean Vibe": "Tense energy where mean interactions succeed more easily and Sims fight or argue often.",
  "Natural Light": "Generous sunbeams inspire Sims, boosting Painting and Photography quality.",
  "Natural Well": "An independent natural spring provides fresh, clean running water that reduces bills.",
  "On Hallowed Grounds": "Consecrated earth; repels evil vampires and invites peaceful supernatural encounters.",
  "On Ley Line": "Heightened magical ley energies dramatically increase the likelihood of twins or triplets.",
  "On a Dark Ley Line": "Babies conceived here have a dramatically higher chance of being born as Vampires.",
  "Party Place": "Guests have more fun and parties earn higher medal scores with ease.",
  "Peace and Quiet": "Tranquil stillness helps Sims recover from tense or stressed moods much faster.",
  "Penny Pixies": "Mischievous, generous pixies randomly leave loose Simoleons around the home.",
  "Private Dwelling": "Discourages uninvited random guests, wanderers, and solicitors from knocking on your door.",
  "Regal Residence": "Palatial grandeur; Sims gain confidence and high-society standing by residing here.",
  "Registered Vampire Lair": "Official haven for vampires; nocturnal visitors and vampire gifts arrive frequently.",
  "Romantic Aura": "Sensual vibes fill the air, making Sims flirty and boosting romantic social success.",
  "Science Lair": "Tech, Logic, and Rocket Science skills develop at accelerated rates here.",
  "Singles Hangout": "Unattached Sims congregate here looking for sparks, dating, and flirtatious connections.",
  "Study Spot": "Focused academic atmosphere boosts University homework and research skill rates.",
  "Sunny Aspect": "Morning sunbeams banish sadness, providing Sims with an energizing Happy moodlet.",
  "Teen Neighborhood": "Teens from across the world gravitate to this spot to hang out and socialize.",
  "Training Ground": "Athletic and pet training gains a major edge with faster fitness improvements.",
  "Vampire Nexus": "Dark occult energy attracts nocturnal vampires to visit and feed much more often."
};

export const lotChallengeDescriptions: Record<string, string> = {
  "Creepy Crawlies": "Spiders, bats, and swarming creepy-crawlies infest the lot, terrorizing unaware Sims.",
  "Cursed": "Fires, broken electronics, lethal electrocutions, and misfortune strike with alarming regularity.",
  "Gremlins": "Mischievous nocturnal gremlins break all appliances and electronics in the dead of night.",
  "Grody": "Contaminated conditions cause Sims to get nauseous from eating, drinking, or showering.",
  "Heist Havoc": "Sneak-thieves, burglars, and kleptomaniacs target this vulnerable lot frequently.",
  "Maintenance Troubles": "Old infrastructure leads to constant plumbing, electrical, and appliance breakdowns.",
  "Mold": "Toxic and mystical mold spores spread across damp corners, sickening or altering Sims.",
  "Off-the-Grid": "Disconnected from municipal power and water grids; requires independent utility generation.",
  "Quake Zone": "Seismic tremors periodically shake the building, startling Sims and rattling decor.",
  "Reduce and Recycle": "Standard trash service is discontinued; Sims must sort, compost, and recycle all waste.",
  "Simple Living": "All cooking strictly requires raw ingredients in fridge or inventory; no free meals!",
  "Wild Foxes": "Sly wild foxes roam the property, hunting your coop chickens and snatching produce.",
  "Wild Prairie Grass": "Dense, untamed prairie grass spreads across the lot, hiding treasures and critters."
};

