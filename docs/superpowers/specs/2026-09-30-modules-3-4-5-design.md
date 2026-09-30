# ConceptFlow — Modules 3, 4, 5 Design Specification

**Date:** 2026-09-30  
**Status:** Approved  
**Scope:** Module 3 (Concept Extraction Refinements), Module 4 (Intra-Disciplinary Explicit Relationship Extraction), Module 5 (Cross-Disciplinary Inference Engine), and Pipeline Integration.

---

## 1. Overview & Objectives

In accordance with [PDR2.0.md](file:///c:/Users/Adnan%20sayyed/Desktop/Learning%20Space/College/UNMAKE/Hackathon/PDR2.0.md), ConceptFlow is an educational knowledge mapping system that reveals relationships between STEM textbook chapters, with a special emphasis on **cross-disciplinary concept mapping** (the surprise challenge differentiator).

This document specifies the design for:
1. **Module 3 (Concept Extraction)**: Refined multi-document concept extraction with STEM classification, formulas, prerequisites, importance, and source references.
2. **Module 4 (Explicit & Intra-Disciplinary Relationship Extraction)**: Within-subject relationship extraction with natural-language predicates, evidence attribution, and graph structural validation.
3. **Module 5 (Cross-Disciplinary Inference Engine)**: Cross-subject conceptual bridging between Chapter A and Chapter B with dual-evidence backing, confidence scoring, and anti-hallucination filtering.
4. **Graph Pipeline Orchestration**: Unified API endpoints for individual stages and end-to-end knowledge graph synthesis.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------------------------+
|                             FASTAPI BACKEND PIPELINE                           |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [Doc A: Linear Algebra]                     [Doc B: Neural Networks]          |
|            │                                              │                   |
|            ▼                                              ▼                   |
|  ┌───────────────────────────┐               ┌───────────────────────────┐    |
|  │  Module 3: Concept Extr.  │               │  Module 3: Concept Extr.  │    |
|  └─────────────┬─────────────┘               └─────────────┬─────────────┘    |
|                │ Concepts A                                │ Concepts B       |
|                ▼                                           ▼                  |
|  ┌───────────────────────────┐               ┌───────────────────────────┐    |
|  │ Module 4: Intra-Rel Extr. │               │ Module 4: Intra-Rel Extr. │    |
|  └─────────────┬─────────────┘               └─────────────┬─────────────┘    |
|                │ Intra Edges A                             │ Intra Edges B    |
|                └──────────────────────┬────────────────────┘                  |
|                                       │                                       |
|                                       ▼                                       |
|                    ┌─────────────────────────────────────┐                    |
|                    │  Module 5: Cross-Disciplinary       │                    |
|                    │  Inference Engine (Challenge Core)  │                    |
|                    └──────────────────┬──────────────────┘                    |
|                                       │ Cross Edges                           |
|                                       ▼                                       |
|                    ┌─────────────────────────────────────┐                    |
|                    │  Graph Builder & Validator          │                    |
|                    │  - Node/Edge ID integrity check     │                    |
|                    │  - Duplicate & self-loop removal    │                    |
|                    │  - Summary statistics calculation   │                    |
|                    └──────────────────┬──────────────────┘                    |
|                                       │                                       |
|                                       ▼                                       |
|                           [KnowledgeGraph JSON Object]                        |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 3. Module Specifications

### Module 3: Concept Extraction
- **Input**: `DocumentInput` (text, subject, chapter, id).
- **Output**: `List[ConceptNode]`
- **Properties**:
  - `id`: Normalized unique lowercase identifier (e.g. `matrix_multiplication`).
  - `name`: Display name (e.g. `Matrix Multiplication`).
  - `subject`: Originating subject.
  - `chapter`: Originating chapter.
  - `type`: `definition`, `mathematical object`, `operation`, `formula`, `algorithm`, `process`, `model`, `principle`, `variable`, `function`, `application`, `other`.
  - `description`: 1-2 sentence definition/explanation.
  - `importance`: `high`, `medium`, `low`.
  - `prerequisites`: Array of prerequisite concepts.
  - `examples`: Concrete illustrative examples.
  - `formulas`: LaTeX/text formulas.
  - `source`: Attribution containing document ID, section, and text excerpt.
- **Engine**:
  - LLM extraction prompt with JSON schema enforcement.
  - Deterministic fallback heuristic regex extractor for zero-setup demo mode and offline testing.

### Module 4: Explicit & Intra-Disciplinary Relationship Extraction
- **Input**: `DocumentInput` + `List[ConceptNode]` for that document.
- **Output**: `List[RelationshipEdge]` where `scope == "intra-disciplinary"`.
- **Properties**:
  - `id`: e.g. `rel_intra_001`
  - `source`: Valid concept ID in same chapter.
  - `target`: Valid concept ID in same chapter.
  - `label`: Natural language action phrase (e.g., `provides the mathematical foundation for`, `is used to compute`, `is an instance of`, `transforms`).
  - `scope`: `intra-disciplinary`.
  - `evidence_type`: `explicit` (directly asserted in text) or `inferred` (logical within-chapter step).
  - `confidence`: Float between 0.0 and 1.0.
  - `explanation`: Why and how these two concepts connect within the subject.
  - `evidence`: Array of textual quotes or reasoning steps.
- **Validation**:
  - Drops self-loops (`source == target`).
  - Enforces `source` and `target` existence in current concept pool.
  - Drops duplicates or inverse redundant duplicates.

### Module 5: Cross-Disciplinary Inference Engine (Surprise Challenge)
- **Input**: `List[DocumentInput]` + `List[ConceptNode]` across all documents.
- **Output**: `List[RelationshipEdge]` where `scope == "cross-disciplinary"`.
- **Properties**:
  - `source`: Concept ID from Subject A.
  - `target`: Concept ID from Subject B.
  - `label`: Descriptive verb phrase (e.g., `provides the mathematical operation for`, `implements the optimization algorithm for`, `serves as physical representation of`).
  - `scope`: `cross-disciplinary`.
  - `evidence_type`: `inferred` or `explicit`.
  - `confidence`: Float >= 0.65 (filtered below threshold to prevent hallucinations).
  - `explanation`: Detailed cross-subject rationale answering *how* and *why* the concept in Subject A connects to the concept in Subject B.
  - `evidence`: Dual-source evidence quotes (from Subject A text and Subject B text).
- **Anti-Hallucination Rules**:
  - Rejects connections based solely on word similarity without conceptual justification.
  - Enforces explicit verification against domain semantics.
  - Curated fallback cross-disciplinary knowledge patterns for reliable offline hackathon demos.

---

## 4. API Endpoints

1. `POST /api/extract-concepts`
   - Accepts: `List[DocumentInput]`
   - Returns: `{ success: true, total_concepts: int, concepts: ConceptNode[], by_document: dict }`

2. `POST /api/extract-intra-relationships`
   - Accepts: `{ documents: DocumentInput[], concepts: ConceptNode[] }`
   - Returns: `{ success: true, total_relationships: int, relationships: RelationshipEdge[] }`

3. `POST /api/infer-cross-disciplinary`
   - Accepts: `{ documents: DocumentInput[], concepts: ConceptNode[] }`
   - Returns: `{ success: true, total_relationships: int, relationships: RelationshipEdge[] }`

4. `POST /api/generate-graph`
   - Accepts: `List[DocumentInput]`
   - Returns: `KnowledgeGraph` (Complete graph with all nodes, all intra & cross edges, summary, and statistics).

---

## 5. Testing & Verification Plan

- Unit test suite / verification script:
  - Verify concept extraction on sample chapters (Linear Algebra + Neural Networks).
  - Verify intra-disciplinary relationships extraction and edge integrity.
  - Verify cross-disciplinary inference produces valid bridging edges with explanations and evidence.
  - Verify end-to-end `generate-graph` endpoint and JSON contract.
- Frontend API client verification:
  - Wire frontend `api.ts` and `App.tsx` to call `/api/generate-graph`.
  - Test graph rendering, node clicking, edge clicking, and cross-disciplinary highlighting in browser.
