# ConceptFlow

> **Turning isolated STEM chapters into a connected visual map of knowledge.**

ConceptFlow is an AI-powered educational tool that transforms **two STEM textbook chapters from different subjects** into an interactive knowledge graph. It extracts important concepts, discovers relationships within each chapter, and—most importantly—reveals meaningful **cross-disciplinary connections** between concepts that students normally learn separately.

**Hackathon MVP • Primary Challenge: Visual Concept Mapper for STEM Textbooks • Surprise Challenge: Cross-Disciplinary Concept Mapping**

---

## 🚀 Why ConceptFlow?

STEM knowledge is rarely isolated.

A student may learn **vectors, matrices, matrix multiplication, and transformations** in Linear Algebra, and later learn **weights, layers, and forward propagation** in Neural Networks. The concepts are deeply connected, but conventional textbook learning presents them as separate chapters.

ConceptFlow addresses this gap by answering:

> **“How does what I learned here connect to what I learned somewhere else?”**

Instead of generating only a summary or a conventional mind map, ConceptFlow focuses on the **relationships between concepts**.

### Core experience

```text
TWO STEM CHAPTERS
       │
       ├───────────────┐
       ↓               ↓
   SUBJECT A        SUBJECT B
       │               │
       ↓               ↓
   CONCEPTS         CONCEPTS
       │               │
       └───────┬───────┘
               ↓
      RELATIONSHIP ENGINE
               │
       ┌───────┴────────┐
       ↓                ↓
INTRA-DISCIPLINARY  CROSS-DISCIPLINARY
       │                │
       └───────┬────────┘
               ↓
        KNOWLEDGE GRAPH
               ↓
      INTERACTIVE VISUAL MAP
               ↓
     EXPLANATION + EVIDENCE
```

---

## 🎯 Problem Statement

Undergraduate STEM students often study subjects independently even when their concepts are mathematically or conceptually connected.

For example:

- **Linear Algebra** → vectors, matrices, matrix multiplication, transformations
- **Neural Networks** → neurons, weights, layers, activation functions, forward propagation

Understanding each chapter individually does not necessarily reveal how the concepts connect.

**ConceptFlow makes those hidden connections visible.**

---

## 💡 What Makes ConceptFlow Different?

ConceptFlow is **not simply an AI mind-map generator**.

Its primary differentiator is:

### **Relationship-first learning across disciplines**

The key output is not just:

```text
Concept → Definition
```

It is:

```text
Concept A
    ↓
Meaningful Relationship
    ↓
Concept B
    ↓
Why are they connected?
    ↓
Evidence + Confidence
```

This allows students to explore the **structure of knowledge**, rather than only reading isolated explanations.

---

# 🧠 How It Works

ConceptFlow analyzes each chapter independently before performing cross-disciplinary reasoning.

### AI Pipeline

```text
              USER
                │
                ▼
        Upload 2 Chapters
                │
                ▼
       Document Processing
                │
          ┌─────┴─────┐
          ▼           ▼
     Chapter A     Chapter B
          │           │
          ▼           ▼
     Concept       Concept
    Extraction    Extraction
          │           │
          ▼           ▼
   Relationship   Relationship
    Extraction     Extraction
          │           │
          └─────┬─────┘
                ▼
   Cross-Disciplinary Inference
                │
                ▼
       Graph Validation
                │
                ▼
        Knowledge Graph
                │
                ▼
       Interactive Graph
          ┌─────┴─────┐
          ▼           ▼
       Concept    Relationship
       Explorer     Explorer
```

### Processing stages

**1. Concept Extraction**

For each chapter, ConceptFlow identifies:

- Concept name
- Concept type
- Definition
- Importance
- Prerequisites
- Examples
- Formula
- Source section
- Source text

**2. Explicit Relationship Extraction**

The system identifies relationships directly stated or strongly supported within the source material.

**3. Cross-Disciplinary Inference**

ConceptFlow compares concepts from the two subjects and looks for meaningful:

- Semantic relationships
- Dependency relationships
- Mathematical relationships
- Application relationships
- Representation relationships

**4. Relationship Validation**

Generated relationships are checked for:

- Valid source and target concepts
- Meaningful relationship
- Logical explanation
- Sufficient confidence
- Duplicate relationships

**5. Graph Generation**

Validated concepts and relationships are converted into an interactive knowledge graph.

---

# 🌉 The Surprise Challenge: Cross-Disciplinary Mapping

This is the central demonstration of ConceptFlow.

The system must **not connect concepts merely because their names look similar**.

A cross-disciplinary relationship should have meaningful conceptual justification through:

- Textbook evidence
- Established conceptual knowledge
- Mathematical derivation
- A clear explanation using both concepts

Low-confidence relationships should not be presented as primary connections.

---

## 🔬 Example: Linear Algebra × Neural Networks

### Chapter A — Linear Algebra

Possible concepts:

- Vector
- Matrix
- Matrix Multiplication
- Linear Transformation
- Eigenvalue
- Eigenvector

### Chapter B — Neural Networks

Possible concepts:

- Neuron
- Weight
- Bias
- Layer
- Activation Function
- Forward Propagation
- Loss Function

### Example discovered relationships

```text
Matrix Multiplication
        │
        │ "is used to perform the core computation in"
        ▼
Neural Network Layer
```

```text
Linear Transformation
        │
        │ "provides the mathematical foundation for"
        ▼
Neural Network Layer
```

```text
Vector
        │
        │ "can represent the input or state processed by"
        ▼
Neuron
```

The important part is not simply displaying the edge.

**ConceptFlow explains why the concepts are connected.**

---

# 🔎 Evidence-Aware Knowledge Graph

ConceptFlow distinguishes relationships using two dimensions.

## 1. Scope

### Intra-disciplinary

Both concepts belong to the same subject/chapter.

Example:

```text
Matrix
  │
  │ used in
  ▼
Matrix Multiplication
```

### Cross-disciplinary

Concepts originate from different subjects.

Example:

```text
Matrix Multiplication
  │
  │ used to perform
  ▼
Neural Network Layer
```

## 2. Evidence

### Explicit relationship

Directly supported by the textbook material.

**Visual representation:** Solid line

### AI-inferred relationship

Not directly stated, but reasonably derived from documented concepts and their meanings.

**Visual representation:** Dashed line

### Four relationship categories

| Scope | Evidence | Meaning |
|---|---|---|
| Intra-disciplinary | Explicit | Direct relationship within a chapter |
| Intra-disciplinary | Inferred | AI-derived relationship within a chapter |
| Cross-disciplinary | Explicit | Cross-subject relationship supported by supplied material |
| Cross-disciplinary | Inferred | Meaningful AI-derived connection across subjects |

The **inferred + cross-disciplinary** category is the key surprise-challenge demonstration.

---

# 🧩 Relationship Intelligence

ConceptFlow avoids generic graph edges such as:

```text
RELATED_TO
CONNECTED_TO
LINKED_TO
```

Instead, relationships use meaningful natural-language labels such as:

- **is used in**
- **provides the foundation for**
- **depends on**
- **enables**
- **represents**
- **transforms**
- **computes**
- **produces**
- **extends**
- **is derived from**
- **is required for**
- **provides the mathematical basis for**

This makes the graph understandable as a learning tool rather than just a visualization.

---

# 📊 Relationship Data

Each relationship can contain:

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

This structure allows the application to show not only **what is connected**, but also:

- How it is connected
- Why it is connected
- Whether it is explicit or inferred
- Confidence
- Supporting evidence

---

# 🕸️ Interactive Knowledge Graph

The graph is designed around **Cytoscape.js** as the recommended visualization library.

The graph should support:

- Pan
- Zoom
- Node selection
- Edge selection
- Dragging nodes
- Highlighting connected concepts
- Relationship filtering

### Visual language

```text
Solid edge  ─────────►  Explicit relationship

Dashed edge - - - - -►  AI-inferred relationship

Subject A nodes  → one visual treatment
Subject B nodes  → another visual treatment
Cross-disciplinary connections → visually distinct
```

The exact visual styling can be adapted during implementation, while maintaining readability.

---

# 🔍 Concept Explorer

Selecting a concept provides its learning context:

```text
Concept Name

Subject
Chapter

Definition

Why it matters

Prerequisites

Examples

Formula

Source

Connected Concepts
```

This turns the graph into an interactive study interface rather than a static diagram.

---

# 🔗 Relationship Explorer

Selecting a relationship exposes the reasoning behind the connection:

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

This is one of the most important product interactions because it makes an AI-generated relationship **inspectable**.

---

# 📚 Source Attribution

ConceptFlow is designed around traceability.

Every extracted concept should maintain its source.

Explicit relationships should maintain supporting source text where possible.

Inferred relationships should show the concepts/evidence used to generate the inference.

The goal is to let a student ask:

> **“Where did ConceptFlow get this idea?”**

---

# 🛡️ Hallucination & Output Validation

ConceptFlow does not directly trust raw LLM output.

The backend should validate:

- JSON structure
- Required fields
- Node references
- Relationship references
- Duplicate concepts
- Duplicate relationships
- Confidence values
- Allowed relationship types

Invalid output should be rejected or repaired.

For inferred relationships, the system requires a meaningful conceptual explanation and supporting evidence.

---

# 🎓 Target User Experience

### Step 1 — Upload

```text
Upload Chapter A
Upload Chapter B
```

### Step 2 — Analyze

```text
Analyzing Chapter A...
Analyzing Chapter B...
Finding relationships...
Discovering cross-disciplinary connections...
Building knowledge graph...
```

### Step 3 — Explore

An interactive graph appears.

### Step 4 — Investigate

The user selects a concept or relationship.

### Step 5 — Understand

ConceptFlow explains:

> **Why these two concepts are connected.**

---

# 🏆 Primary Hackathon Demo

The demo should focus on the **connection**, not merely the number of extracted concepts.

### Demo input

**Chapter A:** Linear Algebra — Matrix Transformations

**Chapter B:** Neural Networks — Forward Propagation

### Demo flow

```text
1. Upload Linear Algebra chapter
              ↓
2. Upload Neural Networks chapter
              ↓
3. ConceptFlow builds the graph
              ↓
4. Cross-disciplinary connection appears
              ↓
5. Matrix Multiplication
          ↓
   Neural Network Layer
              ↓
6. Click the relationship
              ↓
7. Explanation + evidence + confidence
```

The audience should immediately see the central idea:

> **ConceptFlow discovers a meaningful connection between two textbook worlds.**

---

# 🆚 Why This Is More Than a Textbook Summarizer

Traditional AI textbook assistance can answer questions or summarize chapters.

ConceptFlow focuses on a different interaction:

```text
Traditional:
Text → Answer

ConceptFlow:
Text A + Text B
      ↓
Concepts
      ↓
Relationships
      ↓
Cross-disciplinary connections
      ↓
Visual knowledge graph
      ↓
Explanation + evidence
```

### Product philosophy

1. **Explain relationships, not just concepts.**
2. **Show evidence, not just AI claims.**
3. **Make connections visible.**

---

# 🧱 MVP Scope

## Tier 1 — Critical

- Two-chapter input
- Text extraction
- Concept extraction
- Concept classification
- Intra-chapter relationships
- Cross-disciplinary relationship inference
- Interactive graph
- Natural-language relationship labels
- Explicit vs inferred relationships
- Cross-disciplinary vs intra-disciplinary relationships
- Relationship explanation
- Source attribution

## Tier 2 — Useful

- Concept details
- Search
- Filtering
- Summary
- Definitions
- Prerequisites
- Formulas
- Examples

## Tier 3 — Stretch

- Quiz generation
- Personalized learning path
- Persistent knowledge graph
- Multiple chapters
- Long-term student knowledge profile

**Priority rule:** Tier 1 comes before Tier 2 and Tier 3.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────┐
│                 FRONTEND                    │
│                                             │
│ Upload │ Graph │ Concept │ Relationship     │
│        │       │ Explorer│ Explorer         │
│        │       │         │ Search/Filters   │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              FASTAPI BACKEND                │
│                                             │
│ Document Parser                             │
│ Concept Extraction                          │
│ Relationship Extraction                     │
│ Cross-Disciplinary Inference                │
│ Validation                                  │
│ Graph Builder                               │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│                  LLM API                    │
│          One configured provider             │
└─────────────────────────────────────────────┘
```

---

# 🛠️ Technology Direction

The PDR recommends the following MVP stack:

### Frontend

- HTML
- CSS
- JavaScript

**or**

- React
- Vite
- JavaScript/TypeScript

### Backend

- Python
- FastAPI

### Graph Visualization

- Cytoscape.js

### AI

One LLM provider, such as:

- OpenAI
- Gemini
- Claude

### Document Processing

A lightweight PDF/text extraction library.

### Storage

No database is required for the MVP. Appropriate lightweight state can use:

- In-memory state
- Browser state
- Local storage

---

# 📁 Input Model

ConceptFlow accepts two independent sources:

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

Supported source formats in the PDR:

- PDF
- TXT
- DOCX
- Pasted text

For a time-limited MVP, **PDF + pasted text** is sufficient.

---

# 🔌 Core API Direction

Suggested backend endpoints:

```text
POST /upload
POST /extract
POST /generate-graph
POST /infer-cross-disciplinary
GET  /graph
GET  /concept/{id}
GET  /relationship/{id}
```

The exact API structure can be simplified when necessary to reduce development time.

---

# 🔐 Security Principles

For the MVP:

- Never expose AI API keys in frontend code.
- Keep API keys in environment variables.
- Route AI-provider communication through the backend.
- Do not permanently store textbook content unless necessary.
- Avoid logging sensitive document content.

---

# ⚡ Performance Strategy

The MVP is optimized for a fast hackathon demonstration.

Key principles:

- Avoid unnecessary AI API calls.
- Process chapters independently.
- Keep prompts focused.
- Request structured JSON.
- Avoid repeatedly sending the same text.
- Limit displayed concepts if the graph becomes unreadable.

The objective is a **clear, responsive demonstration**, not production-scale processing.

---

# 🧪 Error Handling

The application should gracefully handle:

- Invalid files
- Empty chapters
- Failed PDF extraction
- AI API failure
- Invalid AI JSON
- Missing concepts
- Invalid relationships
- Low-confidence relationships

Users should see understandable messages instead of raw backend errors.

---

# 📋 Definition of Done

ConceptFlow reaches its MVP goal when:

### Input
Two different STEM chapters can be provided.

### Processing
Meaningful concepts are extracted from both chapters.

### Relationships
Relationships within each chapter are identified.

### Surprise Challenge
Meaningful relationships between concepts from **different subjects** are identified.

### Visualization
Relationships appear in an interactive graph.

### Explanation
Selecting a cross-disciplinary relationship shows:

- What the relationship is
- Why the concepts are connected
- Whether it is explicit or inferred
- Confidence
- Supporting evidence

### UX
A non-technical student can explore concepts and relationships.

---

# 🌟 Future Possibilities

The PDR identifies several extensions beyond the core MVP:

- Chapter summaries
- Definitions
- Examples
- Formula discovery
- Prerequisite mapping
- Quiz generation
- Personalized learning paths
- Persistent knowledge graphs
- Multiple-chapter knowledge networks
- Long-term student knowledge profiles

A future knowledge graph could evolve from:

```text
Linear Algebra
      │
      ├── Neural Networks
      │
      ├── Computer Graphics
      │
      └── Computer Vision
```

---

# 🚫 Deliberate Non-Goals for the Hackathon MVP

To keep the focus on the core challenge, the MVP does **not** prioritize:

- Authentication
- Payments
- User accounts
- Mobile application
- Custom AI model
- Fine-tuning
- Vector database
- Complex RAG infrastructure
- Multi-agent architecture
- Admin dashboard
- Production-scale deployment
- Advanced analytics
- Full LMS functionality
- Complex database architecture

These are intentionally outside the core MVP so development effort remains focused on the **cross-disciplinary knowledge graph**.

---

# 👥 Team Development Model

For a three-person team:

### AI / Backend

- Document processing
- Prompts
- Concept extraction
- Relationship extraction
- Cross-disciplinary inference

### Frontend

- UI
- Upload interface
- Graph
- Concept panel
- Relationship panel

### Integration / Testing

- Frontend/backend integration
- JSON testing
- Debugging
- Demo dataset
- UX polish
- Error handling

---

# ⏱️ Hackathon Execution Priority

The PDR defines an approximately **2–2.5 hour** implementation strategy.

The critical sequence is:

```text
Project Foundation
      ↓
Basic UI + Dual Upload
      ↓
Document Processing
      ↓
Concept Extraction
      ↓
Relationship Extraction
      ↓
Cross-Disciplinary Inference
      ↓
Graph Visualization
      ↓
Relationship / Concept Explorer
      ↓
Polish + Demo
```

If time becomes limited, prioritize:

> **Two chapters → concepts → cross-disciplinary relationships → graph → explanation**

---

# 🎯 What Judges Should See

ConceptFlow is designed to make five things immediately visible:

### 1. Dual-source understanding
The system works with **two independent STEM chapters**.

### 2. Structured concept extraction
The system converts dense textbook material into structured concepts.

### 3. Relationship intelligence
The graph represents meaningful relationships, not generic links.

### 4. Cross-disciplinary reasoning
The system discovers connections between concepts from **different subjects**.

### 5. Explainable AI
The system provides **relationship type, explanation, confidence, and evidence** rather than presenting an unexplained AI claim.

---

# 🧭 The Core Product Promise

```text
┌──────────────────────────────────────────┐
│              CONCEPTFLOW                 │
├──────────────────────────────────────────┤
│                                          │
│  TWO STEM CHAPTERS                       │
│          ↓                               │
│  CONCEPT EXTRACTION                      │
│          ↓                               │
│  RELATIONSHIP DISCOVERY                  │
│          ↓                               │
│  CROSS-DISCIPLINARY INFERENCE            │
│          ↓                               │
│  VALIDATION + EVIDENCE                   │
│          ↓                               │
│  INTERACTIVE KNOWLEDGE GRAPH             │
│          ↓                               │
│  EXPLANATION + VISUAL CONTEXT            │
│                                          │
└──────────────────────────────────────────┘
```

> ### **ConceptFlow turns isolated STEM chapters into a connected visual map of knowledge — including relationships between different disciplines.**

---

## 📌 Project Status

**Hackathon MVP**

The implementation should prioritize the cross-disciplinary relationship engine and the interactive graph before secondary learning features.

---

## 📄 Product Design Reference

This README is derived from the project's **Product Design Requirements Document (PDR) v2.0**, whose primary challenge is a visual concept mapper for STEM textbooks and whose surprise challenge is cross-disciplinary concept mapping between two chapters from different subjects.
