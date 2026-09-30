# ConceptFlow

## Product Design Requirements Document (PDR)

**Version:** 2.0
**Purpose:** Hackathon MVP
**Primary Challenge:** Visual Concept Mapper for STEM Textbooks
**Surprise Challenge:** Cross-disciplinary concept mapping between two chapters from different subjects

---

# 1. Product Overview

ConceptFlow is an AI-powered educational tool that converts dense STEM textbook chapters into an interactive visual knowledge graph.

Instead of forcing students to read isolated chapters independently, ConceptFlow identifies important concepts, explains their relationships, and visually connects ideas across different subjects.

For the hackathon, ConceptFlow must support **two chapters from two different subjects** and automatically discover meaningful relationships between them.

### One-line description

> **ConceptFlow transforms two STEM textbook chapters into an interactive visual knowledge graph that reveals both within-subject and cross-disciplinary connections.**

---

# 2. Problem Statement

Undergraduate STEM students often study subjects independently even when the concepts are mathematically or conceptually connected.

For example:

* Linear Algebra teaches vectors, matrices, matrix multiplication and transformations.
* Neural Networks later uses vectors, matrices, transformations and optimization.

A student may understand both chapters individually but fail to see how they connect.

ConceptFlow addresses this problem by automatically extracting concepts from textbook material and constructing a visual map of how those concepts relate.

---

# 3. Hackathon Challenge Requirements

ConceptFlow must demonstrate:

### Input

Two chapters from different STEM subjects.

Example:

**Chapter A:** Linear Algebra
**Chapter B:** Neural Networks

The chapters may be supplied as:

* PDF
* TXT
* DOCX
* pasted text

For the MVP, supporting **PDF + pasted text** is sufficient if time is limited.

---

### Output

ConceptFlow generates:

1. Important concepts from Chapter A.
2. Important concepts from Chapter B.
3. Relationships within Chapter A.
4. Relationships within Chapter B.
5. Cross-disciplinary relationships between Chapter A and Chapter B.
6. Natural-language explanations of those relationships.
7. Source/evidence for relationships where available.
8. An interactive visual graph.

---

# 4. Core Product Differentiator

ConceptFlow is **not simply an AI mind-map generator**.

The primary differentiator is:

> **Relationship-first learning across disciplines.**

The system should answer:

> "How does something I learned in Subject A connect to something I am learning in Subject B?"

The most important demonstration is therefore:

**Concept A from Chapter 1 → meaningful relationship → Concept B from Chapter 2**

---

# 5. Example

### Chapter A — Linear Algebra

Possible concepts:

* Vector
* Matrix
* Matrix Multiplication
* Linear Transformation
* Eigenvalue
* Eigenvector

### Chapter B — Neural Networks

Possible concepts:

* Neuron
* Weight
* Bias
* Layer
* Activation Function
* Forward Propagation
* Loss Function

ConceptFlow may identify relationships such as:

**Matrix Multiplication**

→ "is used to perform the core computation in"

**Neural Network Layer**

---

**Linear Transformation**

→ "provides the mathematical foundation for"

**Neural Network Layer**

---

**Vector**

→ "can represent the input or state processed by"

**Neuron**

The system must explain **why** it believes the concepts are connected.

---

# 6. Product Goals

## Primary Goals

ConceptFlow should:

* Reduce cognitive load when studying dense STEM material.
* Reveal hidden relationships between concepts.
* Make cross-disciplinary connections visible.
* Provide concise explanations.
* Preserve source attribution.
* Distinguish explicit knowledge from AI-inferred relationships.
* Allow students to explore the knowledge graph interactively.

## Secondary Goals

If time permits:

* Generate summaries.
* Show definitions.
* Show formulas.
* Show examples.
* Identify prerequisites.
* Generate quizzes.
* Generate a learning path.

---

# 7. MVP Scope

The MVP must prioritize the following:

### Tier 1 — Critical

* Two-chapter input.
* Text extraction.
* Concept extraction.
* Concept classification.
* Intra-chapter relationships.
* Cross-disciplinary relationship inference.
* Interactive graph.
* Natural-language relationship labels.
* Explicit vs inferred relationships.
* Cross-disciplinary vs intra-disciplinary relationships.
* Relationship explanation.
* Source attribution.

### Tier 2 — Useful

* Concept details.
* Search.
* Filtering.
* Summary.
* Definitions.
* Prerequisites.
* Formulas.
* Examples.

### Tier 3 — Stretch

* Quiz generation.
* Personalized learning path.
* Persistent knowledge graph.
* Multiple chapters.
* Long-term student knowledge profile.

If time becomes limited, **Tier 1 must be completed before Tier 2 or Tier 3.**

---

# 8. Input Model

ConceptFlow accepts two independent sources.

```text
Document A
├── Subject
├── Chapter Title
├── Chapter Text
└── Source Metadata

Document B
├── Subject
├── Chapter Title
├── Chapter Text
└── Source Metadata
```

Example:

```text
Document A
Subject: Linear Algebra
Chapter: Matrix Transformations

Document B
Subject: Neural Networks
Chapter: Forward Propagation
```

---

# 9. Concept Extraction

The AI analyzes each chapter independently before attempting cross-disciplinary reasoning.

For every chapter, extract:

* Concept name
* Concept type
* Definition
* Importance
* Prerequisites
* Examples
* Formula
* Source section
* Source text

### Example concept

```json
{
  "id": "matrix_multiplication",
  "name": "Matrix Multiplication",
  "subject": "Linear Algebra",
  "chapter": "Matrix Transformations",
  "type": "operation",
  "description": "An operation used to combine matrices.",
  "importance": "high"
}
```

---

# 10. Concept Types

The system may classify concepts as:

* Definition
* Mathematical object
* Operation
* Formula
* Algorithm
* Process
* Model
* Principle
* Variable
* Function
* Application
* Other

The classification should remain flexible rather than forcing every concept into a rigid category.

---

# 11. Relationship Extraction

Relationships are divided into two major dimensions.

## Dimension 1 — Scope

### Intra-disciplinary

Both concepts belong to the same chapter/subject.

Example:

```text
Matrix
    ↓ used in
Matrix Multiplication
```

### Cross-disciplinary

The concepts originate from different chapters/subjects.

Example:

```text
Matrix Multiplication
    ↓ used to perform
Neural Network Layer Computation
```

---

# 12. Dimension 2 — Evidence

## Explicit Relationship

The relationship is directly supported by the textbook content.

Represent visually using:

**Solid line**

---

## AI-Inferred Relationship

The relationship is not directly stated but can reasonably be derived from the concepts and their documented meanings.

Represent visually using:

**Dashed line**

---

# 13. Four Relationship Categories

The system therefore supports:

### 1. Explicit + Intra-disciplinary

A direct relationship inside one chapter.

### 2. Inferred + Intra-disciplinary

An AI-derived relationship inside one chapter.

### 3. Explicit + Cross-disciplinary

A cross-subject relationship directly supported by the supplied material.

### 4. Inferred + Cross-disciplinary

A meaningful connection inferred by the AI between concepts from different subjects.

### Priority

The fourth category is the most important demonstration of the surprise challenge.

---

# 14. Relationship Data Model

Each relationship should contain:

```json
{
  "id": "rel_001",
  "source": "matrix_multiplication",
  "target": "neural_network_layer",
  "label": "is used to perform the core computation in",
  "scope": "cross-disciplinary",
  "evidence_type": "inferred",
  "confidence": 0.91,
  "explanation": "A neural network layer commonly computes a weighted sum using matrix multiplication.",
  "evidence": [
    "Chapter A discusses matrix multiplication.",
    "Chapter B describes weighted computation within a layer."
  ]
}
```

---

# 15. Natural-Language Relationship Labels

Relationships should not be limited to generic labels such as:

```text
RELATED_TO
CONNECTED_TO
LINKED_TO
```

Prefer meaningful labels such as:

* is used in
* provides the foundation for
* depends on
* enables
* represents
* transforms
* computes
* produces
* extends
* is an example of
* is derived from
* is required for
* explains
* generalizes
* provides the mathematical basis for

The AI may generate an appropriate relationship label based on context.

---

# 16. Cross-Disciplinary Inference

This is a core feature.

After extracting concepts independently, ConceptFlow should compare concepts across the two chapters.

The AI should identify:

### Semantic relationships

Concepts that describe similar ideas.

### Dependency relationships

One concept provides a prerequisite for another.

### Mathematical relationships

A mathematical concept provides the foundation for another concept.

### Application relationships

A concept from one subject is used as a tool in another subject.

### Representation relationships

One concept provides a mathematical or conceptual representation of another.

---

# 17. Cross-Disciplinary Inference Rules

The AI must not connect concepts merely because their names look similar.

A relationship should be generated only when there is meaningful conceptual justification.

For each inferred relationship, the AI should provide:

1. Source concept.
2. Target concept.
3. Relationship.
4. Explanation.
5. Confidence.
6. Supporting evidence.

---

# 18. Avoiding Hallucinated Relationships

The system must avoid creating arbitrary connections.

A cross-disciplinary relationship should satisfy at least one of:

* Supported by textbook evidence.
* Supported by established conceptual knowledge.
* Mathematically derivable.
* Clearly explained using both concepts.

If confidence is low, the relationship should not be displayed as a primary connection.

---

# 19. Knowledge Graph Structure

The graph contains:

```text
Nodes
+
Relationships
+
Source Information
```

Example:

```text
                Linear Algebra
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
     Vector       Matrix      Linear Transform
        │            │              │
        │            │              │
        └────────────┼──────────────┘
                     │
              CROSS-DISCIPLINARY
                     │
                     ↓
              Neural Networks
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      Neuron       Layer      Activation
                     │
                     ↓
              Forward Propagation
```

---

# 20. Visual Design

The graph should make different relationship types visually understandable.

### Node distinction

Nodes should indicate their source subject.

For example:

**Subject A nodes**

One visual treatment.

**Subject B nodes**

Another visual treatment.

### Relationship distinction

**Solid line**

→ Explicit

**Dashed line**

→ AI-inferred

### Cross-disciplinary relationship

Use a visually distinct treatment for cross-disciplinary connections.

The exact colors can be decided during implementation, but readability on a light background is mandatory.

---

# 21. Interactive Graph

Recommended library:

**Cytoscape.js**

Alternative:

React Flow or another graph visualization library if the coding tool determines it is faster.

The graph should support:

* Pan.
* Zoom.
* Node selection.
* Edge selection.
* Dragging nodes.
* Highlighting connected concepts.
* Filtering relationships.

---

# 22. Concept Explorer

When the user clicks a concept, display:

```text
Concept Name

Subject:
Chapter:

Definition:

Why it matters:

Prerequisites:

Examples:

Formula:

Source:
```

Also display:

```text
Connected Concepts
```

---

# 23. Relationship Explorer

When the user clicks a relationship, display:

```text
Relationship

Matrix Multiplication
        ↓
"provides the computation for"
        ↓
Neural Network Layer

Type:
Cross-disciplinary

Evidence:
AI-inferred

Confidence:
91%

Why are they connected?

[AI-generated explanation]

Evidence:

[Relevant information from Chapter A]

[Relevant information from Chapter B]
```

This interaction is one of the most important parts of the product.

---

# 24. Source Attribution

Every extracted concept should maintain its source.

Every explicit relationship should maintain supporting source text where possible.

Every inferred relationship should show the concepts/evidence used to generate the inference.

The user should be able to understand:

> "Where did ConceptFlow get this idea?"

---

# 25. Summary Panel

The interface should provide an overall summary:

```text
Chapter A:
Linear Algebra

Chapter B:
Neural Networks

Concepts Found:
24

Intra-disciplinary Relationships:
31

Cross-disciplinary Relationships:
8

AI-Inferred Relationships:
12
```

If exact counts are inconvenient during the MVP, they may be omitted.

---

# 26. Search and Filtering

Users should be able to search concepts.

Useful filters:

```text
All
Subject A
Subject B
Cross-disciplinary
Explicit
AI-inferred
High confidence
```

---

# 27. AI Pipeline

The complete pipeline should be:

```text
             USER
               │
        Upload 2 Chapters
               │
               ↓
       Document Processing
               │
        ┌──────┴──────┐
        ↓             ↓
   Chapter A      Chapter B
        │             │
        ↓             ↓
Concept Extraction  Concept Extraction
        │             │
        ↓             ↓
Relationship       Relationship
Extraction         Extraction
        │             │
        └──────┬──────┘
               ↓
      Cross-Disciplinary
        Inference Engine
               │
               ↓
        Graph Validation
               │
               ↓
       Knowledge Graph
               │
               ↓
      Interactive Visual
             Graph
               │
        ┌──────┴──────┐
        ↓             ↓
 Concept Explorer  Relationship
                   Explorer
```

---

# 28. AI Processing Stages

## Stage A — Concept Extraction

Extract important concepts independently from each chapter.

## Stage B — Explicit Relationship Extraction

Identify relationships directly stated or strongly supported within the chapters.

## Stage C — Cross-Disciplinary Inference

Compare concepts from both chapters and identify meaningful connections.

## Stage D — Relationship Validation

Check:

* Does the source concept exist?
* Does the target concept exist?
* Is the relationship meaningful?
* Is the explanation logically consistent?
* Is confidence sufficient?
* Is it duplicate?

## Stage E — Graph Generation

Convert validated concepts and relationships into the visualization format.

---

# 29. Recommended Technology Stack

For the hackathon MVP:

### Frontend

* HTML
* CSS
* JavaScript

OR:

* React
* Vite
* JavaScript/TypeScript

Use whichever the coding tool can implement fastest and most reliably.

### Backend

Python + FastAPI.

### Graph

Cytoscape.js.

### AI

One LLM API.

Possible providers include:

* OpenAI
* Gemini
* Claude

Use **one provider**, not multiple providers.

### Document Processing

Use a lightweight PDF/text extraction library.

### Storage

No database required for MVP.

Use:

* In-memory state
* Browser state
* Local storage

where appropriate.

---

# 30. System Architecture

```text
Frontend
│
├── Upload Interface
├── Graph Visualization
├── Concept Explorer
├── Relationship Explorer
└── Filters/Search
        │
        ↓
FastAPI Backend
│
├── Document Parser
├── Concept Extraction
├── Relationship Extraction
├── Cross-Disciplinary Inference
├── Validation
└── Graph Builder
        │
        ↓
LLM API
```

---

# 31. Core API Structure

Suggested endpoints:

```text
POST /upload
POST /extract
POST /generate-graph
POST /infer-cross-disciplinary
GET  /graph
GET  /concept/{id}
GET  /relationship/{id}
```

The exact API structure can be simplified if it reduces development time.

---

# 32. Graph JSON Structure

The primary graph object:

```json
{
  "title": "Linear Algebra + Neural Networks",
  "documents": [],
  "summary": "",
  "nodes": [],
  "relationships": []
}
```

Node:

```json
{
  "id": "",
  "name": "",
  "subject": "",
  "chapter": "",
  "type": "",
  "description": "",
  "importance": "",
  "source": {},
  "prerequisites": [],
  "examples": [],
  "formulas": []
}
```

Relationship:

```json
{
  "id": "",
  "source": "",
  "target": "",
  "label": "",
  "scope": "intra-disciplinary",
  "evidence_type": "explicit",
  "confidence": 1.0,
  "explanation": "",
  "evidence": []
}
```

---

# 33. User Experience Flow

### Step 1

User opens ConceptFlow.

### Step 2

User sees:

```text
Upload Chapter A
Upload Chapter B
```

### Step 3

User selects two chapters.

### Step 4

ConceptFlow displays:

```text
Analyzing Chapter A...
Analyzing Chapter B...
Finding relationships...
Discovering cross-disciplinary connections...
Building knowledge graph...
```

### Step 5

Interactive graph appears.

### Step 6

User explores concepts.

### Step 7

User clicks a cross-disciplinary connection.

### Step 8

ConceptFlow explains:

> Why these two concepts are connected.

This should be the primary demo flow.

---

# 34. Demo Scenario

Recommended demonstration:

### Chapter A

Linear Algebra — Matrix Transformations

### Chapter B

Neural Networks — Forward Propagation

The demo should show:

```text
Matrix
   ↓
Matrix Multiplication
   ↓
Linear Transformation
          │
          │ CROSS-DISCIPLINARY
          ↓
Neural Network Layer
   ↓
Forward Propagation
```

Then click the cross-disciplinary edge and display the explanation.

---

# 35. Differentiation From ChatGPT

ConceptFlow should not position itself as:

> "ChatGPT but for textbooks."

Instead:

> **ChatGPT explains concepts through conversation. ConceptFlow reveals the structure connecting concepts.**

The core experience is visual and relational.

The product's key output is not just an answer.

It is:

```text
Concept
    ↓
Relationship
    ↓
Explanation
    ↓
Visual Context
```

---

# 36. Non-Goals

Do NOT build during the core hackathon MVP:

* Authentication.
* Payments.
* User accounts.
* Mobile application.
* Custom AI model.
* Fine-tuning.
* Vector database.
* Complex RAG infrastructure.
* Multi-agent architecture.
* Admin dashboard.
* Production-scale deployment.
* Advanced analytics.
* Full LMS functionality.
* Complex database architecture.

These features consume time without directly improving the surprise-challenge demonstration.

---

# 37. Development Modules

The application must be built incrementally.

## Module 0 — Project Foundation

Create:

* Project structure.
* Frontend.
* Backend.
* Dependency configuration.
* Basic frontend-backend communication.

### Acceptance Criteria

* Project starts successfully.
* Frontend loads.
* Backend runs.
* Frontend can communicate with backend.

---

# 38. Module 1 — Basic UI

Create:

* ConceptFlow branding.
* Main layout.
* Chapter A upload.
* Chapter B upload.
* Generate button.
* Graph area.
* Side panel.

Do not implement AI yet.

---

# 39. Module 2 — Dual Document Processing

Implement:

* PDF upload.
* Text extraction.
* Text validation.
* Subject/chapter metadata.

The backend should be able to produce:

```text
Chapter A → extracted text
Chapter B → extracted text
```

---

# 40. Module 3 — Concept Extraction

Implement AI extraction independently for each chapter.

Output structured JSON.

Test with sample textbook chapters.

---

# 41. Module 4 — Explicit Relationship Extraction

Extract relationships within each chapter.

Validate:

* Node IDs.
* Relationship IDs.
* Source/target validity.

---

# 42. Module 5 — Cross-Disciplinary Inference

This is the **surprise challenge module**.

Compare concepts from Chapter A and Chapter B.

Generate:

* Cross-disciplinary relationships.
* Natural-language labels.
* Explanation.
* Confidence.
* Evidence.

This module should be treated as a core MVP feature.

---

# 43. Module 6 — Graph Builder

Combine:

```text
Chapter A concepts
+
Chapter B concepts
+
Intra-disciplinary relationships
+
Cross-disciplinary relationships
```

into one graph JSON.

---

# 44. Module 7 — Interactive Graph

Implement:

* Nodes.
* Edges.
* Zoom.
* Pan.
* Drag.
* Selection.
* Relationship styling.

---

# 45. Module 8 — Concept Explorer

Implement the concept information panel.

---

# 46. Module 9 — Relationship Explorer

Implement the relationship explanation panel.

This should clearly show:

```text
Relationship type
Scope
Evidence
Confidence
Explanation
```

---

# 47. Module 10 — Search and Filtering

Implement:

* Search.
* Subject filtering.
* Cross-disciplinary filtering.
* Explicit/inferred filtering.

---

# 48. Module 11 — Learning Features

If time remains:

* Chapter summaries.
* Definitions.
* Examples.
* Prerequisites.
* Formulas.
* Quiz generation.
* Learning path.

These features are secondary to the cross-disciplinary graph.

---

# 49. Module 12 — Polish and Demo

Focus on:

* Visual quality.
* Loading states.
* Error messages.
* Graph readability.
* Empty states.
* Demo dataset.
* Cross-disciplinary edge visibility.
* Relationship explanation UX.

---

# 50. Optional Module 13 — Persistent Knowledge Graph

Only implement if significant time remains.

Allow users to add additional chapters later and connect them to existing knowledge.

Example:

```text
Linear Algebra
      │
      ├── Neural Networks
      │
      ├── Computer Graphics
      │
      └── Computer Vision
```

This is a future feature, not required for the surprise challenge.

---

# 51. Team Development Strategy

Three team members can work in parallel.

### Person 1 — AI / Backend

Responsible for:

* Document processing.
* Prompts.
* Concept extraction.
* Relationship extraction.
* Cross-disciplinary inference.

### Person 2 — Frontend

Responsible for:

* UI.
* Upload interface.
* Graph.
* Concept panel.
* Relationship panel.

### Person 3 — Integration / Testing

Responsible for:

* Connecting frontend/backend.
* Testing JSON.
* Debugging.
* Demo dataset.
* UX polish.
* Error handling.

---

# 52. Time Strategy

Total available time:

**Approximately 2–2.5 hours**

### 0–15 minutes

Project foundation.

### 15–30 minutes

Basic UI + dual upload.

### 30–50 minutes

Document processing.

### 50–70 minutes

Concept extraction.

### 70–90 minutes

Relationship extraction.

### 90–110 minutes

Cross-disciplinary inference.

### 110–130 minutes

Graph visualization.

### 130–145 minutes

Relationship/concept explorer.

### 145–150 minutes

Polish + demo.

If behind schedule:

**Stop adding features.**

Prioritize:

> Two chapters → concepts → cross-disciplinary relationships → graph → explanation.

---

# 53. Error Handling

The application must handle:

* Invalid files.
* Empty chapters.
* Failed PDF extraction.
* AI API failure.
* Invalid AI JSON.
* Missing concepts.
* Invalid relationships.
* Low-confidence relationships.

The UI should show understandable messages instead of raw errors.

---

# 54. AI Output Validation

Never directly trust raw LLM output.

The backend should validate:

* JSON structure.
* Required fields.
* Node references.
* Relationship references.
* Duplicate concepts.
* Duplicate relationships.
* Confidence values.
* Allowed relationship types.

Invalid output should be rejected or repaired.

---

# 55. Performance Requirements

For the hackathon MVP:

* Avoid unnecessary API calls.
* Process each chapter independently.
* Keep prompts focused.
* Request structured JSON.
* Avoid sending unnecessary repeated text to the AI.
* Limit the number of concepts displayed if the graph becomes unreadable.

The goal is a fast demo, not production-scale processing.

---

# 56. Security Requirements

For the MVP:

* Do not expose API keys in frontend code.
* Store API keys in environment variables.
* Backend communicates with the AI provider.
* Do not permanently store uploaded textbook content unless necessary.
* Avoid logging sensitive document content.

---

# 57. Definition of Done

ConceptFlow is considered MVP-complete when:

### Input

Two different STEM chapters can be uploaded.

### Processing

The system extracts meaningful concepts from both chapters.

### Relationships

The system identifies relationships within each chapter.

### Surprise Challenge

The system identifies meaningful relationships **between concepts belonging to different subjects**.

### Visualization

The relationships appear in an interactive graph.

### Explanation

Clicking a cross-disciplinary relationship explains:

* What the relationship is.
* Why the concepts are connected.
* Whether it was explicit or inferred.
* Its confidence.
* Supporting evidence.

### UX

The user can explore concepts and relationships without needing technical knowledge.

---

# 58. Primary Hackathon Demo Moment

The presentation should not focus on:

> "Look, our AI extracted 30 concepts."

Instead, demonstrate:

### Step 1

Upload Linear Algebra chapter.

### Step 2

Upload Neural Networks chapter.

### Step 3

ConceptFlow builds the graph.

### Step 4

The system highlights:

**Matrix Multiplication → Neural Network Layer**

### Step 5

Click the relationship.

### Step 6

ConceptFlow explains:

> These concepts come from different subjects, but matrix multiplication provides the mathematical operation used to combine inputs and weights during neural-network computation.

The audience should immediately understand:

> **The system discovered a connection between two textbook worlds.**

---

# 59. Product Philosophy

ConceptFlow should follow three principles:

### 1. Explain relationships, not just concepts.

### 2. Show evidence, not just AI claims.

### 3. Make connections visible.

The fundamental question ConceptFlow answers is:

> **"How does what I learned here connect to what I learned somewhere else?"**

---

# 60. Final MVP Definition

The minimum successful ConceptFlow experience is:

```text
             TWO CHAPTERS
                  │
          ┌───────┴───────┐
          ↓               ↓
      SUBJECT A       SUBJECT B
          │               │
          ↓               ↓
      CONCEPTS         CONCEPTS
          │               │
          └───────┬───────┘
                  ↓
       RELATIONSHIP ENGINE
                  │
       ┌──────────┴──────────┐
       ↓                     ↓
 INTRA-DISCIPLINARY    CROSS-DISCIPLINARY
       │                     │
       └──────────┬──────────┘
                  ↓
          KNOWLEDGE GRAPH
                  │
                  ↓
       INTERACTIVE VISUAL MAP
                  │
          ┌───────┴────────┐
          ↓                ↓
      CONCEPTS         RELATIONSHIPS
                         │
                         ↓
                    EXPLANATION
                    + EVIDENCE
```

**Core promise:**

> **ConceptFlow turns isolated STEM chapters into a connected visual map of knowledge — including relationships between different disciplines.**
