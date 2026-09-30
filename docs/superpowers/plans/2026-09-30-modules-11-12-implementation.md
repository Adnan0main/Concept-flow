# ConceptFlow — Modules 11 & 12 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Module 11 (Interactive Learning Features: Cross-Disciplinary Quiz & Sequential Study Roadmap) and Module 12 (Presentation & Demo Polish: Multi-Scenario Presets, High-Res PNG/JSON Graph Export, and Presentation Mode).

**Architecture:** Extend `SideInspector.tsx` with a 4th tab ("Practice & Path") hosting a dynamic cross-disciplinary quiz engine and a step-by-step sequential learning roadmap. Extend `demoData.ts` and `Header.tsx` with 3 curated STEM scenario presets. Equip `GraphCanvas.tsx` with Cytoscape PNG image rendering and JSON export triggers. Add a judge-ready presentation mode banner.

**Tech Stack:** React 19, TypeScript, Cytoscape.js, Lucide Icons.

## Global Constraints
- The cross-disciplinary quiz questions must directly test connections spanning across Subject A and Subject B.
- PNG export must generate a clean 2x resolution image with dark background `#0c121e` suitable for presentation slides.
- All 3 scenario presets must synthesize valid graphs with clear cross-disciplinary bridges.

---

### Task 1: Module 11 — Cross-Disciplinary Quiz Engine & Sequential Study Roadmap in SideInspector
**Files:**
- Modify: `frontend/src/components/SideInspector.tsx`

**Interfaces:**
- Produces: 4th tab `"Practice & Path"` with dynamic quiz questions derived from cross-disciplinary edges, interactive option selection, correctness feedback, and clickable sequential learning roadmap.

- [x] **Step 1: Write dynamic quiz generator logic deriving cross-domain questions from `graph.relationships`**
- [x] **Step 2: Implement interactive quiz UI with option selection, immediate correctness badge, score counter, and explanation reveal**
- [x] **Step 3: Implement sequential learning roadmap arranging concepts into foundational, intermediate, cross-bridge, and advanced phases**
- [x] **Step 4: Verify build passes with `npm run build`**

---

### Task 2: Module 12 — Curated STEM Scenario Presets in demoData.ts & Header
**Files:**
- Modify: `frontend/src/data/demoData.ts`
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: 3 preset STEM pairs:
  1. *Linear Algebra + Neural Networks* (Core Surprise Challenge)
  2. *Calculus + Classical Mechanics* (Kinematics & Energy)
  3. *Graph Theory + Molecular Chemistry* (Molecular Networks & Bonds)
- Scenario selector in `Header.tsx` that immediately switches input chapters and graph state.

- [x] **Step 1: Add Calculus + Classical Mechanics and Graph Theory + Molecular Chemistry datasets to `demoData.ts`**
- [x] **Step 2: Add scenario dropdown selector in `Header.tsx`**
- [x] **Step 3: Update `App.tsx` to handle scenario selection and update active documents and graph**
- [x] **Step 4: Verify build passes with `npm run build`**

---

### Task 3: Module 12 — High-Resolution PNG & JSON Graph Export
**Files:**
- Modify: `frontend/src/components/GraphCanvas.tsx`

**Interfaces:**
- Produces: `Export PNG` (downloads 2x scale PNG image) and `Export JSON` (downloads formatted `.json` graph file).

- [x] **Step 1: Implement `handleExportPNG` using `cy.png({ full: true, scale: 2, bg: '#0c121e' })` with browser download trigger**
- [x] **Step 2: Implement `handleExportJSON` serializing graph state into a downloadable JSON file**
- [x] **Step 3: Add Export buttons with `Download` and `Image` icons in the bottom toolbar of `GraphCanvas.tsx`**
- [x] **Step 4: Verify build passes with `npm run build`**

---

### Task 4: Module 12 — Judge Pitch Presentation Mode
**Files:**
- Modify: `frontend/src/components/GraphCanvas.tsx`

**Interfaces:**
- Produces: Toggleable presentation mode banner with guided 3-point walkthrough highlighting the surprise challenge differentiator for hackathon judges.

- [x] **Step 1: Add presentation mode state and toggle button in `GraphCanvas.tsx`**
- [x] **Step 2: Render presentation banner highlighting cross-disciplinary discovery, dual evidence, and visual synthesis**
- [x] **Step 3: Verify build passes with `npm run build`**

---

### Task 5: End-to-End System Verification
**Files:**
- Verification: Build check and browser functional verification.

- [x] **Step 1: Run `npm run build` to verify 0 TypeScript errors**
- [x] **Step 2: Verify scenario switching, quiz interaction, roadmap traversal, and PNG/JSON export in browser**
