# Implementation Plan - v1.0 Overhaul: Milestone Tracking, Degressive Lot Challenges & Couple Pregnancy Mechanics

## Overview of Changes
This update introduces **v1.0 (The Overhaul Milestone)** with three major systems:
1. **Version History & Overhaul Tracker (v1.0)**: A clickable badge in the app header opening a dedicated modal that logs major milestones and minor iterative updates starting at v1.0.
2. **Continuous Degressive Lot Challenges (Up to All Available)**: Replaces the capped challenge roll with a continuous decaying roll loop ("starting high and decaying until a miss"), allowing anywhere from 0 up to every available challenge, while strictly honoring dwelling type exclusions (Apartment, Tiny Home, Haunted House, Residential Rental).
3. **Synchronized Couple Pregnancy Compatibility (Strictly for Rolled Spouses Only)**: Matching pregnancy mechanics are applied **ONLY when a spouse/partner is rolled in the adequate generation roll** (i.e. `partnerCount > 0`). Absolutely no rolls are modified, and no spouses are injected into single or helper-only rolls. Solo Sims, helpers, roommates, and unmarried heirs keep their pure random rolls.

---

## Detailed User Review Required

> [!IMPORTANT]
> **Matching Partner Pregnancy Rules (Strictly Scoped)**:
> - **Only on Valid Spouse Rolls**: Synchronization applies **exclusively** when the generation's Marital Status roll calls for a partner/spouse (`partnerCount > 0`).
> - **No Roll Modifications**: Single, Single Parent, or Helper-only generations remain completely untouched—no partner is added, and no rolls are altered.
> - **Matching Logic**: Between the Heir and their rolled Spouse, one partner is set to *"Can get pregnant"* (with nursing capability) and the other is set to *"Can get others pregnant"*, ensuring they can have biological children together. Non-couple Sims (helpers, roommates, single Sims) keep their pure random CAS rolls.
>
> **Lot Challenge Dwelling Restrictions**:
> - **Tiny Homes**: **Wild Prairie Grass is allowed**, but **Maintenance Troubles is disabled**.
> - **Apartments**: *Wild Foxes*, *Wild Prairie Grass*, and *Off-the-Grid* are disabled.
> - **Haunted House Residential**: *Cursed* is disabled.
> - **Residential Rental**: *Wild Prairie Grass* is disabled.
>
> **Degressive Continuous Challenge Loop**:
> - Continuous roll: Challenge 1 starts at 70% probability. Each consecutive challenge scales by a decay multiplier (e.g. 75% of previous rate) until a roll misses or all compatible challenges in the pool are selected.

---

## Proposed Changes

### 1. Version Tracking & Changelog System
- **File**: `src/types.ts`
  - Define `ChangelogEntry` interface (`version`, `date`, `title`, `type: 'major' | 'minor'`, `highlights: string[]`, `details: string[]`).
- **File**: `src/data/versionHistory.ts` (new)
  - Seed version log starting at `v1.0` with clear categories:
    - `v1.0.0 (Milestone Overhaul)`:
      - Continuous degressive lot challenge rolls with dwelling type restrictions (Tiny Homes allow Wild Prairie Grass, disable Maintenance Troubles; Apartments disable Wild Foxes, Wild Prairie Grass, Off-the-Grid; Haunted Homes disable Cursed).
      - Synchronized couple pregnancy compatibility mechanics (applied strictly when a spouse is rolled).
      - Residential Rental generation gate (Marital #50 Multi-family dwelling).
      - Double Part-timer full career rolls & clean career names bar.
      - Version tracking modal with overhaul logging.
- **File**: `src/components/VersionHistoryModal.tsx` (new)
  - Clean modal dialog displaying version badges, overhaul tags, and expandable change details.
- **File**: `src/components/Header.tsx` or `src/App.tsx`
  - Add `v1.0` badge next to the app logo/title in the header that opens `VersionHistoryModal`.

### 2. Continuous Degressive Lot Challenge Generation & Dwelling Exclusions
- **File**: `src/data/simData.ts`
  - Add dwelling challenge restriction mappings:
    ```ts
    export const dwellingChallengeRestrictions: Record<DwellingType, string[]> = {
      "Apartment": ["Wild Foxes", "Wild Prairie Grass", "Off-the-Grid"],
      "Tiny Home": ["Maintenance Troubles"], // Wild Prairie Grass is explicitly allowed
      "Haunted Home": ["Cursed"],
      "Residential Rental": ["Wild Prairie Grass"],
      "Standard House": []
    };
    ```
- **File**: `src/utils/generator.ts`
  - Update `rollLotChallenges(dwellingType?: DwellingType)`:
    - Filter `db.lotChallenges` against `dwellingChallengeRestrictions[dwellingType]`.
    - Run continuous decaying roll loop:
      ```ts
      let currentChance = 0.70;
      const decayFactor = 0.72;
      while (available.length > 0 && Math.random() < currentChance) {
        const picked = roll(available);
        lcs.push(picked);
        available = available.filter(c => c !== picked);
        currentChance *= decayFactor;
      }
      ```
    - Pass `dwellingType` from `generateLot` and `populateHouseholdFromLegacy`.
  - Update `rerollSingleLotChallenge` and `addLotChallenge` to respect dwelling restrictions.

### 3. Matched Couple Pregnancy Mechanics (Rolled Spouses Only)
- **File**: `src/utils/generator.ts`
  - Add helper function `synchronizeCouplePregnancy(heir: Sim, spouse: Sim)`:
    - Randomly assign one partner as carrier (`"Can get pregnant"`, `milk: "Yes"`) and the other as impregnator (`"Can get others pregnant"`).
- **File**: `src/utils/legacyGenerator.ts`
  - In `populateHouseholdFromLegacy`:
    - **Check `marital.partnerCount > 0`**: Only execute `synchronizeCouplePregnancy(heirSim, partner)` when spouses are actually rolled and spawned.
    - If `marital.partnerCount === 0`, do NOT modify the Heir's rolled pregnancy or add any partner. Rolls remain 100% unaltered.

---

## Verification Plan

### Automated Verification
- Run TypeScript type checking: `npx tsc --noEmit`
- Run linter: `npm run lint` / `lint_applet`
- Run applet compilation: `compile_applet`

### Manual & Functional Verification
1. **Version History Modal**:
   - Click the `v1.0` badge in the header.
   - Verify modal opens with v1.0 overhaul notes, filter tags, and clear typography.
2. **Lot Challenge Rolls**:
   - Roll lots across different dwelling types:
     - Verify Tiny Homes can roll *Wild Prairie Grass*, but **never** roll *Maintenance Troubles*.
     - Verify Apartments **never** roll *Wild Foxes*, *Wild Prairie Grass*, or *Off-the-Grid*.
     - Verify Haunted Homes **never** roll *Cursed*.
     - Verify challenge counts vary naturally with continuous decay (can roll 0 up to all valid challenges).
3. **Couple Pregnancy Matching**:
   - Generate a generation with a rolled spouse (`partnerCount > 0`): Verify Heir and Spouse have matching compatible pregnancy settings.
   - Generate a generation with NO spouse (`partnerCount === 0`, e.g. Single Parent, Solo Heir): Verify the Heir keeps their independent CAS pregnancy roll and no spouse is generated or modified.
