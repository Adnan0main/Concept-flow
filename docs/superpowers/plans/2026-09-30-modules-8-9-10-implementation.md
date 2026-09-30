# ConceptFlow — Modules 8, 9, 10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Module 8 (Interactive Concept Explorer & Traversal), Module 9 (Relationship & Dual-Evidence Explorer), and Module 10 (Real-Time Search & Multi-Dimensional Filtering) in the ConceptFlow web application.

**Architecture:** Extend `SideInspector.tsx` with deep concept inspection, clickable prerequisite navigation, and upstream/downstream graph traversal. Enhance `SideInspector.tsx` relationship tab with dual-evidence quotes, confidence gauges, and jump-to-endpoint buttons. Equip `GraphCanvas.tsx` with a floating search bar, multi-dimensional filter pills, live count statistics, and two-way Cytoscape highlight/fly-to animations.

**Tech Stack:** React 19, TypeScript, Cytoscape.js, Lucide Icons, Vanilla CSS design tokens.

## Global Constraints
- Cross-disciplinary edges must always be highlighted as the primary surprise-challenge differentiator.
- Clicking any prerequisite, connected concept, or relationship endpoint must smoothly update selection and center Cytoscape without page reload.
- Real-time search must match concept names, descriptions, and formulas, dimming non-matches while keeping matching nodes visible.
- Dual source attribution must clearly distinguish evidence from Subject A vs. Subject B.

---

### Task 1: Module 10 — Real-Time Search & Multi-Dimensional Filters in GraphCanvas
**Files:**
- Modify: `frontend/src/components/GraphCanvas.tsx`

**Interfaces:**
- Produces: Live search input with instant matching, filter buttons (`All`, `Cross-Subject Only`, `Explicit`, `Inferred`, `High Confidence`), and count status.
- Synchronizes with Cytoscape: Adds `.search-match`, `.search-dimmed`, and `.filtered-out` classes to nodes and edges.

- [x] **Step 1: Add search query state and debounced/instant matching logic in `GraphCanvas.tsx`**
- [x] **Step 2: Add floating search bar UI with search icon, clear button, and live count indicator**
- [x] **Step 3: Add confidence threshold filter pill (`>= 85%`) alongside scope and evidence filters**
- [x] **Step 4: Update Cytoscape stylesheet to apply search dimming and glowing border for matches**
- [x] **Step 5: Verify build passes with `npm run build`**

---

### Task 2: Module 8 — Interactive Concept Explorer & Graph Traversal in SideInspector
**Files:**
- Modify: `frontend/src/components/SideInspector.tsx`

**Interfaces:**
- Consumes: `selectedNode: ConceptNode | null`, `graph: KnowledgeGraph | null`
- Produces: `onSelectNode: (node: ConceptNode) => void`, `onSelectEdge: (edge: RelationshipEdge) => void`
- Renders: Prerequisites as clickable buttons, formatted formula blocks, examples, and Connected Knowledge traversal list.

- [x] **Step 1: Compute incoming and outgoing relationships for the selected concept from `graph.relationships`**
- [x] **Step 2: Render clickable prerequisite chips that invoke `onSelectNode` when clicked**
- [x] **Step 3: Render "Connected Concepts (Knowledge Traversal)" section listing adjacent concepts with relationship labels and cross-disciplinary badges**
- [x] **Step 4: Verify build passes with `npm run build`**

---

### Task 3: Module 9 — Relationship & Dual-Evidence Explorer in SideInspector
**Files:**
- Modify: `frontend/src/components/SideInspector.tsx`

**Interfaces:**
- Consumes: `selectedEdge: RelationshipEdge | null`, `graph: KnowledgeGraph | null`
- Produces: `Jump to Source` and `Jump to Target` actions, confidence meter, and separated Subject A / Subject B evidence cards.

- [x] **Step 1: Add `Jump to Source` and `Jump to Target` buttons in the visual flow banner to inspect endpoints**
- [x] **Step 2: Implement dynamic visual confidence meter with color coding (emerald for >= 90%, violet for >= 80%, amber for < 80%)**
- [x] **Step 3: Separate supporting source evidence into dedicated Subject A and Subject B callout cards**
- [x] **Step 4: Verify build passes with `npm run build`**

---

### Task 4: Two-Way Synchronization & Smooth Camera Centering
**Files:**
- Modify: `frontend/src/components/GraphCanvas.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: Smooth Cytoscape camera animation when a node is selected from `SideInspector` or search.

- [x] **Step 1: Add camera center-on-node animation in `GraphCanvas.tsx` when `selectedNode` changes**
- [x] **Step 2: Pass `onSelectNode` and `onSelectEdge` handlers down to `SideInspector` in `App.tsx`**
- [x] **Step 3: Verify build passes with `npm run build`**

---

### Task 5: End-to-End System Verification
**Files:**
- Verification: Live browser check and build validation.

- [x] **Step 1: Run `npm run build` to verify zero TypeScript errors**
- [x] **Step 2: Test live search, filtering, prerequisite navigation, and dual-evidence explorer in browser**
