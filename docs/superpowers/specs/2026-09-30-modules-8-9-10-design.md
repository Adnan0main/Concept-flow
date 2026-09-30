# ConceptFlow — Modules 8, 9, 10 Design Specification

**Date:** 2026-09-30  
**Status:** Approved  
**Scope:** Module 8 (Interactive Concept Explorer & Graph Traversal), Module 9 (Relationship & Dual-Evidence Explorer), and Module 10 (Real-Time Search & Multi-Dimensional Filtering).

---

## 1. Overview & Objectives

In accordance with [PDR2.0.md](file:///c:/Users/Adnan%20sayyed/Desktop/Learning%20Space/College/UNMAKE/Hackathon/PDR2.0.md), ConceptFlow transforms dense STEM textbook chapters into an interactive visual knowledge graph with a central emphasis on cross-disciplinary concept mapping.

While Modules 3, 4, and 5 provided the extraction and inference pipeline, Modules 8, 9, and 10 provide the user exploration layer:
1. **Module 8 (Concept Explorer)**: Allows students to deeply inspect any concept, its mathematical formalisms, prerequisites, importance, and interactively traverse to adjacent upstream/downstream concepts.
2. **Module 9 (Relationship & Evidence Explorer)**: Spotlights the surprise challenge differentiator by displaying the cross-subject bridge rationale, confidence metric, and side-by-side supporting textbook evidence quotes.
3. **Module 10 (Real-Time Search & Filtering)**: Empowers students and hackathon judges to instantly find concepts across multiple disciplines and filter by cross-disciplinary bridges, subject domains, evidence type, and confidence thresholds.

---

## 2. Architecture & Component Interaction

```
+-----------------------------------------------------------------------------------------+
|                                    APP.TSX STATE STORE                                  |
|  - graph: KnowledgeGraph | null                                                         |
|  - selectedNode: ConceptNode | null                                                     |
|  - selectedEdge: RelationshipEdge | null                                                |
|  - searchQuery: string                                                                  |
|  - activeFilters: { scope, subject, evidenceType, minConfidence }                       |
+-----------------------------------------------------------------------------------------+
           ▲                                          ▲                               ▲
           │ User Search/Filter Events                │ Selection Synchronizer        │ Traverse Clicks
           ▼                                          ▼                               ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────────────────────────┐
│  GRAPH CANVAS (Cytoscape.js)    │       │  SIDE INSPECTOR                                     │
│  - Live Floating Search Bar     │       │  [Summary] | [Concept (M8)] | [Relationship (M9)]   │
│  - Filter Pills & Confidence    │       │                                                     │
│  - Dynamic Highlighting/Dimming │       │  - Full metadata, formulas, examples, prerequisites │
│  - Smooth Center on Click       │       │  - "Connected Concepts" clickable traversal links   │
│  - Legend & Zoom/Fit controls   │       │  - Dual-evidence side-by-side quote blocks          │
└─────────────────────────────────┘       │  - Jump-to-endpoint navigation buttons              │
                                          └─────────────────────────────────────────────────────┘
```

---

## 3. Module Specifications

### Module 8: Interactive Concept Explorer
Located in `SideInspector.tsx` (Concept Tab):
- **Header Section**:
  - Concept name with bold typography.
  - Subject badge (color-coded using subject palette: Indigo for Subject A, Emerald for Subject B, etc.).
  - Chapter attribution.
  - Concept type badge (`model`, `operation`, `mathematical object`, `formula`, `algorithm`, etc.).
  - Importance indicator (`high`, `medium`, `low`).
- **Core Definition**:
  - Clean explanation describing the concept in 1-2 clear STEM sentences.
- **Formulas & Mathematical Notation**:
  - Formatted monospace code blocks for LaTeX/text mathematical representations (e.g. `C = A * B`, `y_hat = f(W*x + b)`).
- **Prerequisites & Examples**:
  - Prerequisite chips: If a prerequisite exists in the graph, clicking it instantly selects that node and centers the graph view on it.
  - Examples list illustrating concrete applications.
- **Connected Concepts Traversal (Graph Navigation)**:
  - Downstream list: `Current Concept --[action label]--> Target Concept`
  - Upstream list: `Source Concept --[action label]--> Current Concept`
  - Each item shows whether the link is intra-subject or a cross-disciplinary bridge.
  - Clicking any connected item switches selection and smoothly highlights that node on the canvas.

### Module 9: Relationship & Dual-Evidence Explorer
Located in `SideInspector.tsx` (Relationship Tab):
- **Visual Flow Banner**:
  - `Source Concept (Subject A)` $\xrightarrow{\text{"action predicate"}}$ `Target Concept (Subject B)`
  - Quick action buttons: `Jump to Source` and `Jump to Target` to immediately pivot the inspection view.
- **Classification & Confidence**:
  - Scope badge: `cross-disciplinary` (bright violet `#c084fc`) or `intra-disciplinary` (`#10b981`).
  - Evidence type badge: `explicit` (solid) or `inferred` (dashed).
  - Confidence Gauge: Colored percentage progress bar (e.g. 95% green/violet, 70% amber).
- **"Why Are They Connected?" Conceptual Rationale**:
  - In-depth explanation clarifying how the mathematical or physical principles in Subject A connect to Subject B.
- **Dual Supporting Source Evidence Quotes**:
  - Dedicated callout cards displaying:
    - Evidence from Document A (Subject A chapter quote).
    - Evidence from Document B (Subject B chapter quote).

### Module 10: Real-Time Search & Multi-Dimensional Filtering
Embedded in `GraphCanvas.tsx` / `App.tsx`:
- **Real-Time Search Bar**:
  - Text input with search icon and clear button.
  - Searches concept names, descriptions, formulas, and subjects in real time.
  - Matching nodes are highlighted on the canvas; non-matching nodes and edges are dimmed.
  - If a single concept matches exactly, auto-selects or suggests 1-click focus.
- **Multi-Dimensional Filters**:
  - **Scope Filter**: `All` | `Cross-Subject Only` (hero differentiator) | `Intra-Subject Only`.
  - **Subject Filter**: Filter toggles dynamically populated for each uploaded chapter subject.
  - **Evidence Filter**: `All` | `Explicit (Solid)` | `Inferred (Dashed)`.
  - **Confidence Filter**: Toggle between `All (>=65%)` and `High Confidence (>=85%)`.
- **Live Status Count**:
  - Live counter: `"Showing X of Y concepts • Z cross-bridges visible"`.

---

## 4. UI/UX Design System Guidelines
- **Color Palettes**:
  - Subject A: Indigo (`#6366f1` / `rgba(99, 102, 241, 0.25)`)
  - Subject B: Emerald (`#10b981` / `rgba(16, 185, 129, 0.25)`)
  - Cross-Disciplinary Bridges: Neon Violet (`#c084fc` / `#a855f7`) with glowing dashed styling
  - Selected state: Pink/Rose accent (`#ec4899`)
- **Typography & Layout**:
  - Monospace code fonts for formulas.
  - Micro-animations for tab transitions and selection changes.

---

## 5. Verification Plan
- Verify search bar filters nodes and dims non-matches on the live canvas.
- Verify clicking a prerequisite tag in the Concept Explorer navigates to the prerequisite node.
- Verify clicking a connected concept in the Concept Explorer traverses to that node.
- Verify clicking `Jump to Source` and `Jump to Target` in the Relationship Explorer inspects the respective nodes.
- Verify dual evidence quotes and confidence gauge render cleanly for cross-disciplinary edges.
- Verify all filter pills (`Cross-Subject Only`, `Explicit`, `Inferred`, `Subject`) correctly filter the Cytoscape elements.
