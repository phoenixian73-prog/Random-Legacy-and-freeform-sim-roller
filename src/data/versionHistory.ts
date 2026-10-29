import { ChangelogEntry } from '../types';

export const APP_VERSION = 'v1.0.0';

export const VERSION_HISTORY: ChangelogEntry[] = [
  {
    version: 'v1.0.0',
    date: 'Current Release',
    title: 'The Milestone Overhaul: Lot Dynamics, Matched Couples & All-Career Jokers',
    type: 'major',
    tag: 'Major Overhaul',
    highlights: [
      'Continuous Degressive Lot Challenges (rolling continuously up to all available challenges until a miss)',
      'Dwelling Type Challenge Restrictions (Apartments exclude Wild Foxes/Prairie Grass/Off-the-Grid; Tiny Homes exclude Maintenance Troubles while allowing Wild Prairie Grass; Haunted Homes exclude Cursed)',
      'Synchronized Couple Pregnancy Compatibility (only when a spouse is rolled, pairing one carrier and one impregnator)',
      'Unified Career Joker Reroll (re-rolls ALL generation careers at once: Heir + all secondary spouses/helpers; single career rerolls disabled)',
      'Strict Residential Rental Generation Gate (only rolls when Marital #50 Multi-family Dwelling indicates moving spares into the rental)',
      'Clean Career Display in Bottom Sticky Bar (displays job names only, moving detailed explanations to the expanded view)'
    ],
    details: [
      'Lot Challenges now use a continuous decaying probability loop (starting at 70% chance for Challenge 1 and decaying with each consecutive success) allowing lots to acquire any number of challenges up to the full applicable pool.',
      'Dwelling restrictions are strictly enforced across generation rolls, custom edits, and re-rolls: Tiny Homes allow Wild Prairie Grass but prevent Maintenance Troubles; high-rise Apartments prevent outdoor challenges; Haunted Homes prevent redundant Cursed challenges.',
      'Pregnancy mechanics for romantic partner pairings are now synchronized: when marital rolls produce a spouse, one partner is configured with "Can get pregnant" (+ nursing) and the other with "Can get others pregnant", guaranteeing biological compatibility without touching non-couple Sims or altering roll probabilities.',
      'Joker system overhaul: The Joker for careers now re-rolls all careers across the household simultaneously (Heir C1 plus all C2 secondary roles) rather than allowing fragmented single job re-rolls.',
      'Overhaul tracking system established starting at v1.0.0 with dedicated version badge and changelog browser.'
    ]
  }
];
