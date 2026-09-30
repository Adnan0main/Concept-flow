import re
import json
from typing import List, Dict, Any, Set, Tuple, Optional
from models.graph_models import ConceptNode, RelationshipEdge, DocumentInput
from services.llm_client import call_llm_json
from services.relationship_extractor import clean_predicate_label


# Curated high-confidence cross-domain STEM bridge definitions for fallback/offline demo
CROSS_DOMAIN_KNOWLEDGE_BASE = [
    {
        "domain_a": ["linear algebra", "matrix algebra", "vector space"],
        "domain_b": ["neural network", "deep learning", "machine learning", "artificial intelligence"],
        "match_a": ["matrix multiplication", "matrix product", "dot product"],
        "match_b": ["neural network layer", "neuron", "layer", "forward propagation", "perceptron"],
        "label": "is used to perform the core linear computation in",
        "explanation": "Matrix multiplication computes the weighted sum of inputs and synaptic weights across neurons in parallel during forward propagation.",
        "confidence": 0.95,
        "evidence_a": "Linear algebra defines matrix multiplication as combining row and column vectors.",
        "evidence_b": "Neural network layers execute affine transformations: z = W · x + b."
    },
    {
        "domain_a": ["linear algebra", "matrix algebra", "vector space"],
        "domain_b": ["neural network", "deep learning", "machine learning", "artificial intelligence"],
        "match_a": ["linear transformation", "transformation", "affine transformation"],
        "match_b": ["neural network layer", "forward propagation", "layer"],
        "label": "provides the geometric and mathematical basis for",
        "explanation": "Each neural network layer performs a parameterized linear transformation on the input space before applying a non-linear activation function.",
        "confidence": 0.93,
        "evidence_a": "A linear transformation maps vectors from one coordinate space to another preserving vector space properties.",
        "evidence_b": "Layers map high-dimensional representation vectors through weight matrices."
    },
    {
        "domain_a": ["linear algebra", "vector space"],
        "domain_b": ["neural network", "deep learning", "machine learning"],
        "match_a": ["vector", "vectors", "vector space"],
        "match_b": ["neuron", "activation", "layer", "weight", "weights"],
        "label": "serves as the mathematical representation for inputs and states in",
        "explanation": "Inputs, synaptic weights, and hidden states in neural networks are structured and manipulated as multidimensional vectors.",
        "confidence": 0.91,
        "evidence_a": "Vectors represent ordered lists of numerical values in coordinate space.",
        "evidence_b": "Neuron inputs and weight values are formalized as feature vectors."
    },
    {
        "domain_a": ["linear algebra", "matrix algebra"],
        "domain_b": ["neural network", "deep learning", "machine learning"],
        "match_a": ["matrix", "matrices"],
        "match_b": ["weight matrix", "weights", "layer"],
        "label": "structures the learnable parameter weights of",
        "explanation": "All connection weights between consecutive neural layers are organized as a weight matrix for parallel evaluation.",
        "confidence": 0.94,
        "evidence_a": "Matrices represent rectangular grids of coefficients.",
        "evidence_b": "Weight parameters connecting layer i to layer j form a weight matrix W."
    },
    {
        "domain_a": ["linear algebra", "matrix algebra"],
        "domain_b": ["neural network", "deep learning", "machine learning"],
        "match_a": ["eigenvalue", "eigenvector", "eigenvalues", "eigenvectors"],
        "match_b": ["loss function", "gradient descent", "optimization", "forward propagation"],
        "label": "governs convergence stability and curvature in",
        "explanation": "Eigenvalues of the Hessian matrix in neural optimization determine loss landscape curvature and learning rate stability bounds.",
        "confidence": 0.88,
        "evidence_a": "Eigenvalues describe the scaling factor along invariant transformation axes.",
        "evidence_b": "Optimization dynamics in gradient updates depend on the conditioning of curvature tensors."
    },
    {
        "domain_a": ["calculus", "multivariable calculus", "differentiation"],
        "domain_b": ["neural network", "deep learning", "machine learning"],
        "match_a": ["derivative", "gradient", "partial derivative", "chain rule"],
        "match_b": ["backpropagation", "loss function", "gradient descent", "optimization"],
        "label": "provides the analytical mechanism for computing updates in",
        "explanation": "The calculus chain rule enables backpropagation to systematically compute partial derivatives of the loss function with respect to every weight.",
        "confidence": 0.96,
        "evidence_a": "The chain rule computes the derivative of composite functional mappings.",
        "evidence_b": "Backpropagation recursively applies the chain rule backward through computational graphs."
    }
]


def infer_cross_disciplinary_heuristic(
    documents: List[DocumentInput],
    concepts: List[ConceptNode]
) -> List[RelationshipEdge]:
    """
    Intelligent STEM rule-based heuristic cross-disciplinary inference engine.
    Finds cross-subject bridges when LLM is unavailable or for deterministic demonstration.
    """
    if len(documents) < 2 or len(concepts) < 2:
        return []

    # Partition concepts by subject
    by_subject: Dict[str, List[ConceptNode]] = {}
    for c in concepts:
        subj = c.subject.strip()
        by_subject.setdefault(subj, []).append(c)

    subjects = list(by_subject.keys())
    if len(subjects) < 2:
        return []

    edges: List[RelationshipEdge] = []
    seen_pairs: Set[Tuple[str, str]] = set()
    edge_counter = 1

    # Compare concept pairs across distinct subjects
    for i in range(len(subjects)):
        for j in range(i + 1, len(subjects)):
            subj_a, subj_b = subjects[i], subjects[j]
            concepts_a = by_subject[subj_a]
            concepts_b = by_subject[subj_b]

            for ca in concepts_a:
                for cb in concepts_b:
                    ca_name_low = ca.name.lower()
                    cb_name_low = cb.name.lower()
                    ca_desc_low = ca.description.lower()
                    cb_desc_low = cb.description.lower()

                    # Check against curated STEM bridge knowledge base
                    for bridge in CROSS_DOMAIN_KNOWLEDGE_BASE:
                        domain_match = (
                            any(d in subj_a.lower() for d in bridge["domain_a"]) and
                            any(d in subj_b.lower() for d in bridge["domain_b"])
                        )
                        rev_domain_match = (
                            any(d in subj_b.lower() for d in bridge["domain_a"]) and
                            any(d in subj_a.lower() for d in bridge["domain_b"])
                        )

                        if domain_match:
                            src_concept, tgt_concept = ca, cb
                        elif rev_domain_match:
                            src_concept, tgt_concept = cb, ca
                        else:
                            continue

                        src_match = any(m in src_concept.name.lower() or m in src_concept.id.lower() for m in bridge["match_a"])
                        tgt_match = any(m in tgt_concept.name.lower() or m in tgt_concept.id.lower() for m in bridge["match_b"])

                        if src_match and tgt_match:
                            pair = (src_concept.id, tgt_concept.id)
                            if pair not in seen_pairs:
                                seen_pairs.add(pair)
                                edges.append(
                                    RelationshipEdge(
                                        id=f"rel_cross_{edge_counter:03d}",
                                        source=src_concept.id,
                                        target=tgt_concept.id,
                                        label=bridge["label"],
                                        scope="cross-disciplinary",
                                        evidence_type="inferred",
                                        confidence=bridge["confidence"],
                                        explanation=bridge["explanation"],
                                        evidence=[
                                            f"[{src_concept.subject}]: {bridge['evidence_a']}",
                                            f"[{tgt_concept.subject}]: {bridge['evidence_b']}"
                                        ]
                                    )
                                )
                                edge_counter += 1

    # If no specific knowledge base match, build semantic cross-concept bridges
    if not edges:
        # Cross connect the primary high-importance concepts across the two subjects
        subj_a, subj_b = subjects[0], subjects[1]
        primary_a = next((c for c in by_subject[subj_a] if c.importance == "high"), by_subject[subj_a][0])
        primary_b = next((c for c in by_subject[subj_b] if c.importance == "high"), by_subject[subj_b][0])
        
        pair = (primary_a.id, primary_b.id)
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            edges.append(
                RelationshipEdge(
                    id=f"rel_cross_{edge_counter:03d}",
                    source=primary_a.id,
                    target=primary_b.id,
                    label="provides foundational principles applied in",
                    scope="cross-disciplinary",
                    evidence_type="inferred",
                    confidence=0.85,
                    explanation=f"{primary_a.name} from {subj_a} establishes core mathematical and structural mechanisms leveraged to understand {primary_b.name} in {subj_b}.",
                    evidence=[
                        f"[{subj_a}]: {primary_a.description}",
                        f"[{subj_b}]: {primary_b.description}"
                    ]
                )
            )

    return edges


def infer_cross_disciplinary_relationships(
    documents: List[DocumentInput],
    concepts: List[ConceptNode]
) -> List[RelationshipEdge]:
    """
    Surprise Challenge Core Engine:
    Discovers high-value cross-disciplinary connections between concepts across distinct STEM subjects.
    Uses LLM with multi-document comparative prompting and anti-hallucination confidence filtering.
    """
    if len(documents) < 2 or len(concepts) < 2:
        return []

    concept_ids = {c.id for c in concepts}
    concept_map = {c.id: c for c in concepts}

    # Group concepts by subject/document
    concepts_by_subject: Dict[str, List[Dict[str, Any]]] = {}
    for c in concepts:
        concepts_by_subject.setdefault(c.subject, []).append({
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "description": c.description,
            "formulas": c.formulas,
            "importance": c.importance,
        })

    if len(concepts_by_subject) < 2:
        # If all concepts have the same subject label, use document IDs
        concepts_by_subject.clear()
        for c in concepts:
            key = c.chapter or "General"
            concepts_by_subject.setdefault(key, []).append({
                "id": c.id,
                "name": c.name,
                "type": c.type,
                "description": c.description,
                "formulas": c.formulas,
                "importance": c.importance,
            })

    doc_summaries = [
        f"--- SUBJECT: {d.subject} (Chapter: {d.chapter}) ---\nText Excerpt:\n{d.text[:3000]}\n"
        for d in documents
    ]

    prompt = f"""
You are an expert cross-disciplinary STEM reasoning engine for ConceptFlow.
Your primary mission is the SURPRISE CHALLENGE: discover deep, meaningful relationships between concepts that belong to DIFFERENT STEM subjects/chapters.

CHAPTER CONTEXTS:
{"".join(doc_summaries)}

EXTRACTED CONCEPTS GROUPED BY SUBJECT:
{json.dumps(concepts_by_subject, indent=2)}

DISCOVERY RULES:
1. Connect Concept A (from Subject 1) to Concept B (from Subject 2).
2. 'source' and 'target' MUST come from DIFFERENT subjects.
3. 'source' and 'target' MUST be exact concept IDs from the provided concept list above.
4. Do NOT make connections based merely on superficial name similarity. There must be a genuine mathematical, algorithmic, representational, dependency, or application connection.
5. 'label' must be a concise, active natural-language predicate explaining the cross-disciplinary bridge (e.g. "provides the mathematical foundation for", "is used to compute affine states in", "implements the optimization algorithm for", "represents the state vector in").
6. 'confidence' must be a float between 0.65 and 1.00. Do NOT return low-confidence guesses.
7. 'explanation' must be a thorough 1-3 sentence educational synthesis answering: "Why and how does this concept from Subject 1 connect to that concept in Subject 2?"
8. 'evidence' MUST contain an array of 2 quotes or points: one supporting point/quote from Subject 1, and one from Subject 2.

Return a valid JSON object with the key "cross_relationships" containing an array of relationship objects matching this schema:
{{
  "cross_relationships": [
    {{
      "source": "concept_id_from_subject_1",
      "target": "concept_id_from_subject_2",
      "label": "is used to perform the core computation in",
      "evidence_type": "inferred",
      "confidence": 0.92,
      "explanation": "Matrix multiplication from Linear Algebra enables the parallel computation of weighted inputs across artificial neurons in Neural Networks.",
      "evidence": [
        "Linear Algebra: Matrix multiplication computes inner products across coordinate arrays.",
        "Neural Networks: Layer activations are computed via affine matrix equations."
      ]
    }}
  ]
}}
"""

    system_instruction = (
        "You are ConceptFlow's Cross-Disciplinary Knowledge Engine. "
        "Discover genuine inter-subject connections between concepts. "
        "Strictly output valid JSON adhering to the requested schema without hallucinations."
    )

    try:
        data = call_llm_json(prompt, system_instruction)
        raw_cross = []
        if isinstance(data, dict):
            raw_cross = data.get("cross_relationships", []) or data.get("relationships", [])
        elif isinstance(data, list):
            raw_cross = data

        validated_edges: List[RelationshipEdge] = []
        seen_pairs: Set[Tuple[str, str]] = set()
        edge_counter = 1

        for r in raw_cross:
            if not isinstance(r, dict):
                continue

            src = str(r.get("source", "")).strip()
            tgt = str(r.get("target", "")).strip()

            if not src or not tgt or src == tgt:
                continue

            # Check if IDs exist
            if src not in concept_ids or tgt not in concept_ids:
                src_match = next((cid for cid in concept_ids if cid.lower() == src.lower()), None)
                tgt_match = next((cid for cid in concept_ids if cid.lower() == tgt.lower()), None)
                if src_match and tgt_match and src_match != tgt_match:
                    src, tgt = src_match, tgt_match
                else:
                    continue

            # Enforce cross-disciplinary requirement (different subjects)
            src_node = concept_map[src]
            tgt_node = concept_map[tgt]
            if src_node.subject.strip().lower() == tgt_node.subject.strip().lower():
                continue

            pair = (src, tgt)
            if pair in seen_pairs or (tgt, src) in seen_pairs:
                continue
            seen_pairs.add(pair)

            conf = float(r.get("confidence", 0.88))
            if conf < 0.65:
                continue  # Filter out low-confidence hallucinations

            label = clean_predicate_label(str(r.get("label", "bridges across to")))
            ev_type = str(r.get("evidence_type", "inferred")).lower()
            if ev_type not in ["explicit", "inferred"]:
                ev_type = "inferred"

            explanation = str(r.get("explanation", f"{src_node.name} from {src_node.subject} directly informs {tgt_node.name} in {tgt_node.subject}.")).strip()
            raw_ev = r.get("evidence", [])
            evidence = [str(e).strip() for e in raw_ev if str(e).strip()] if isinstance(raw_ev, list) else [str(raw_ev)]

            validated_edges.append(
                RelationshipEdge(
                    id=f"rel_cross_{edge_counter:03d}",
                    source=src,
                    target=tgt,
                    label=label,
                    scope="cross-disciplinary",
                    evidence_type=ev_type,  # type: ignore
                    confidence=round(conf, 2),
                    explanation=explanation,
                    evidence=evidence or [
                        f"[{src_node.subject}]: {src_node.description}",
                        f"[{tgt_node.subject}]: {tgt_node.description}"
                    ]
                )
            )
            edge_counter += 1

        if len(validated_edges) >= 1:
            return validated_edges

    except Exception as e:
        print(f"LLM cross-disciplinary inference fallback triggered: {e}")

    # Fallback to heuristic cross-disciplinary engine
    return infer_cross_disciplinary_heuristic(documents, concepts)
