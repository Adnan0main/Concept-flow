# ConceptFlow — Modules 11 & 12 Design Specification

**Date:** 2026-09-30  
**Status:** Approved  
**Scope:** Module 11 (Learning Features: Cross-Disciplinary Quiz Generator & Recommended Study Path) and Module 12 (Presentation & Demo Polish: Multi-Scenario Presets, High-Res PNG/JSON Graph Export, and Presentation Mode).

---

## 1. Overview & Objectives

In accordance with [PDR2.0.md](file:///c:/Users/Adnan%20sayyed/Desktop/Learning%20Space/College/UNMAKE/Hackathon/PDR2.0.md) (Sections 48, 49, and 58):
- **Module 11 (Learning Features)**: Takes ConceptFlow beyond passive inspection by generating active learning tools from the synthesized graph:
  1. **Cross-Disciplinary Quiz**: Multiple-choice questions that specifically test the student's understanding of conceptual bridges connecting two disciplines.
  2. **Sequential Learning Path**: A topological / prerequisite-guided roadmap that orders concepts from fundamental foundations to cross-disciplinary syntheses.
- **Module 12 (Presentation & Demo Polish)**: Equips the product with judge-ready demonstration tools:
  1. **1-Click Multi-Subject Preset Scenarios**: Instant switching between STEM domain pairs (Linear Algebra + Neural Networks, Calculus + Classical Mechanics, Graph Theory + Molecular Chemistry).
  2. **High-Resolution Graph Export**: 1-click PNG image export (`cy.png({ scale: 2 })`) and Knowledge Graph JSON download.
  3. **Presentation / Pitch Mode**: Guided narrative walkthrough spotlighting the surprise challenge differentiator.

---

## 2. Architecture & Component Interaction

```
+-----------------------------------------------------------------------------------------+
|                                    HEADER / WORKSPACE                                   |
|  - Scenario Preset Selector: [Linear Algebra + Neural Networks | Calculus + Physics]   |
|  - Export Actions: [Download PNG Image] | [Export Graph JSON]                           |
|  - Mode Toggles: [Presentation Mode]                                                    |
+-----------------------------------------------------------------------------------------+
           │                                          │                               │
           ▼                                          ▼                               ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────────────────────────┐
│  GRAPH CANVAS (Cytoscape.js)    │       │  SIDE INSPECTOR                                     │
│  - Export Canvas API hook       │       │  [Summary] | [Concept] | [Bridge] | [Learn & Path]  │
│  - Fullscreen Presentation View │       │                                                     │
│  - Step-by-Step Path Spotlight  │       │  - Cross-Disciplinary Interactive Quiz (M11)        │
│                                 │       │  - Step-by-Step Learning Trajectory (M11)           │
│                                 │       │  - Live Score & Explanations                        │
└─────────────────────────────────┘       └─────────────────────────────────────────────────────┘
```

---

## 3. Module Specifications

### Module 11: Learning Features (Quiz & Study Path)
Located in `SideInspector.tsx` under a new tab: **"Practice & Path"**:
- **Cross-Disciplinary Quiz Engine**:
  - Dynamically synthesized from the graph's cross-disciplinary edges.
  - Each question poses a conceptual challenge linking Subject A and Subject B:
    - E.g.: *"How does Matrix Multiplication in Linear Algebra enable computation in Neural Network Layers?"*
    - 4 multiple choice options: 1 correct grounded in the AI inference, 3 plausible STEM distractors.
  - Interactive choice selection with instant correctness feedback:
    - Green check for correct answers; red for incorrect.
    - Reveals the exact underlying rationale and evidence quote.
    - Score counter: `"Score: 3/4 (75%)"`.
- **Sequential Learning Roadmap**:
  - Automatically arranges nodes into an ordered study progression:
    1. Phase 1: Foundational mathematical objects (no prerequisites, e.g. `Vector`, `Matrix`).
    2. Phase 2: Subject A core operations (e.g. `Matrix Multiplication`, `Linear Transformation`).
    3. Phase 3: Cross-Disciplinary Bridge (e.g. `Matrix Multiplication -> Neural Network Layer`).
    4. Phase 4: Subject B architecture & algorithms (e.g. `Neural Network Layer`, `Forward Propagation`).
  - Rendered as an interactive numbered timeline.
  - Clicking any step in the roadmap highlights that concept on the Cytoscape graph and centers the camera.

### Module 12: Presentation & Demo Polish
- **1-Click STEM Demo Presets** in `Header.tsx`:
  - Preset 1: **Linear Algebra + Neural Networks** (The Core Surprise Challenge MVP).
  - Preset 2: **Calculus + Classical Mechanics** (Derivatives & Integrals $\rightarrow$ Velocity, Acceleration, and Kinetic Energy).
  - Preset 3: **Graph Theory + Molecular Chemistry** (Adjacency Matrices & Graph Degrees $\rightarrow$ Molecular Structure & Covalent Bonds).
  - Selecting any preset populates the upload cards and immediately synthesizes the corresponding knowledge graph.
- **High-Resolution Graph Export**:
  - **Export PNG**: Uses Cytoscape's native `cy.png({ full: true, bg: '#0c121e', scale: 2 })` to download a crisp 2x resolution graphic for study notes and presentation slides.
  - **Export JSON**: Downloads the standardized `KnowledgeGraph` JSON payload matching PDR2.0 Section 32 schema.
- **Judge Presentation Mode**:
  - Toggle button that expands the graph viewport, dims distractions, and displays a guided narrative banner explaining the surprise challenge differentiator in 3 simple presentation points.

---

## 4. Verification Plan
- Verify clicking each of the 3 demo presets loads valid documents and generates the appropriate cross-disciplinary knowledge graph.
- Verify clicking "Export PNG" downloads a valid high-resolution image of the Cytoscape graph.
- Verify clicking "Export JSON" downloads a valid JSON file with nodes and relationships.
- Verify taking the cross-disciplinary quiz records selections, provides immediate feedback, and displays the underlying explanation.
- Verify clicking steps in the Learning Roadmap centers the graph camera on each sequential concept.
- Verify zero TypeScript or build errors with `npm run build`.
