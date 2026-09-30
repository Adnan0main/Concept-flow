# ConceptFlow — Modules 3, 4, 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Module 3 (Concept Extraction Refinements), Module 4 (Intra-Disciplinary Explicit Relationship Extraction), Module 5 (Cross-Disciplinary Inference Engine), and assemble the unified end-to-end Knowledge Graph pipeline.

**Architecture:** A FastAPI backend pipeline that takes 2+ STEM chapters, extracts concepts per chapter with STEM classification and formulas, extracts intra-chapter relationships, applies a cross-disciplinary inference engine with dual-source attribution and confidence scoring, validates graph integrity, and delivers the complete knowledge graph to the interactive React frontend.

**Tech Stack:** Python 3.10+, FastAPI, Pydantic v2, Google Gemini REST API / OpenAI fallback / Deterministic STEM Heuristics, React 18, TypeScript, Cytoscape.js.

## Global Constraints
- All relationships must have meaningful natural-language action labels (not generic `RELATED_TO`).
- Cross-disciplinary edges must include dual evidence quotes and a concise explanation answering *how* and *why* the concepts connect across disciplines.
- Must support fallback deterministic heuristics so the system functions seamlessly even in offline or API-key-free environments.
- Node IDs and Edge references must be strictly validated (no dangling references, no self-loops).

---

### Task 1: Module 3 Refinement & Model Updates
**Files:**
- Modify: `backend/models/graph_models.py`
- Modify: `backend/services/concept_extractor.py`
- Test: `backend/tests/test_module3_extractor.py`

**Interfaces:**
- Produces: `extract_concepts_from_document(doc: DocumentInput) -> List[ConceptNode]`
- Produces: `extract_concepts_heuristic(doc: DocumentInput) -> List[ConceptNode]`

- [x] **Step 1: Update graph models if needed for structured extraction requests**
- [x] **Step 2: Enhance concept extractor heuristic rules with expanded STEM terminology and formula extractors**
- [x] **Step 3: Run standalone verification script to test concept extraction on Linear Algebra and Neural Networks**

---

### Task 2: Module 4 — Intra-Disciplinary Explicit Relationship Extractor
**Files:**
- Create: `backend/services/relationship_extractor.py`
- Test: `backend/tests/test_module4_relationships.py`

**Interfaces:**
- Consumes: `DocumentInput`, `List[ConceptNode]`
- Produces: `extract_intra_relationships(doc: DocumentInput, concepts: List[ConceptNode]) -> List[RelationshipEdge]`

- [x] **Step 1: Write `backend/services/relationship_extractor.py` with LLM prompt and JSON schema for intra-chapter relationships**
- [x] **Step 2: Add validation filter to ensure `source` and `target` exist in the document's concept IDs, drop self-loops, and drop duplicate edges**
- [x] **Step 3: Implement heuristic fallback intra-relationship builder based on prerequisites, definitions, and co-occurrences**
- [x] **Step 4: Run test to verify intra-disciplinary relationship generation and schema validation**

---

### Task 3: Module 5 — Cross-Disciplinary Inference Engine (Surprise Challenge)
**Files:**
- Create: `backend/services/cross_disciplinary_engine.py`
- Test: `backend/tests/test_module5_cross_disciplinary.py`

**Interfaces:**
- Consumes: `List[DocumentInput]`, `List[ConceptNode]`
- Produces: `infer_cross_disciplinary_relationships(documents: List[DocumentInput], concepts: List[ConceptNode]) -> List[RelationshipEdge]`

- [x] **Step 1: Write `backend/services/cross_disciplinary_engine.py` with cross-domain comparative prompt and anti-hallucination guardrails**
- [x] **Step 2: Implement confidence threshold filtering (>= 0.65) and dual-evidence synthesis**
- [x] **Step 3: Implement curated fallback cross-disciplinary knowledge rules for offline/demo robustness**
- [x] **Step 4: Run test to verify cross-disciplinary edge extraction between Linear Algebra and Neural Networks**

---

### Task 4: Unified Backend Endpoints & Graph Builder
**Files:**
- Modify: `backend/main.py`
- Test: `backend/tests/test_full_pipeline.py`

**Interfaces:**
- Endpoints:
  - `POST /api/extract-intra-relationships`
  - `POST /api/infer-cross-disciplinary`
  - `POST /api/generate-graph`

- [x] **Step 1: Implement endpoint handlers in `backend/main.py`**
- [x] **Step 2: Implement full graph synthesis logic that calculates statistics (concepts count, intra/cross count, explicit/inferred count) and builds `KnowledgeGraph`**
- [x] **Step 3: Test all endpoints using a verification script against running backend**

---

### Task 5: Frontend API Integration & Live Pipeline Wiring
**Files:**
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/UploadSection.tsx`

**Interfaces:**
- Frontend calls `generateCompleteKnowledgeGraph(documents)` and updates UI state with live processing step logs.

- [x] **Step 1: Add `generateKnowledgeGraph` and individual stage functions to `frontend/src/services/api.ts`**
- [x] **Step 2: Update `frontend/src/App.tsx` `handleGenerate` to execute real API call with loading states and error handling**
- [x] **Step 3: Ensure selected cross-disciplinary edge displays full dual evidence and explanation in `SideInspector`**

---

### Task 6: End-to-End System Verification
**Files:**
- Verification: Browser inspection and API test suite.

- [x] **Step 1: Run comprehensive backend test verifying Modules 3, 4, and 5**
- [x] **Step 2: Verify interactive frontend graph and cross-disciplinary relationship inspector in browser**
