# Sims 4 Simology & Random Legacy Challenge Engine (v1.0 Milestone)

A complete, 100% client-side Sims 4 Simology Manager and Random Legacy Challenge generator built upon the PieceOfPrincess ruleset.

## Features
- **5 Core Generation Rolls**: Marital Status, Children Target (with designated arrival Heir rule), Careers (C1 Heir & C2 Secondary), Generation Goals (with Midlife Crisis reveal at Adulthood), and Misc Fun.
- **Continuous Degressive Lot Challenges**: Rolls naturally with decaying probability up to all valid challenges with strict dwelling exclusions (Apartments, Tiny Homes, Haunted Homes, Rentals).
- **Synchronized Couple Pregnancy Compatibility**: Matching carrier and impregnator mechanics assigned when spouses are rolled.
- **Unified All-at-Once Career Joker**: Spend a Joker to re-roll all generation careers across the household simultaneously.
- **Zero API Dependency**: 100% offline, local browser computation using standard JavaScript. No API keys, no server costs, and no third-party billing.

---

## Deploying to GitHub Pages (100% Free & Idempotent)

This repository includes a pre-configured, automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the web app idempotently.

### First-Time Setup on GitHub:
1. Push this project to your GitHub repository.
2. In your repository on GitHub, click **Settings** ➔ **Pages** (under "Code and automation" in the left sidebar).
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
4. That's it! GitHub will automatically run the workflow and publish your app at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Idempotent Overhaul Updates:
- Every time you push an update or commit to the `main` branch, GitHub Actions will automatically rebuild and deploy the new version cleanly and idempotently.
- Player save data in `localStorage` is preserved across all updates without data loss.

---

## Local Development & Offline Directory Usage

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build standalone offline static directory
npm run build
```

The compiled files will be in `dist/`. Because relative asset paths (`base: './'`) are enabled, the `dist` folder can be opened directly or hosted on any server.
