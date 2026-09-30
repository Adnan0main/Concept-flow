import re
import json
from typing import List, Dict, Any, Set, Tuple
from models.graph_models import ConceptNode, RelationshipEdge, DocumentInput
from services.llm_client import call_llm_json


def clean_predicate_label(label: str) -> str:
    """Standardizes relationship action labels into readable active verbs."""
    clean = label.strip().lower()
    clean = re.sub(r'[_]+', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean)
    # Filter out empty or generic labels
    if clean in {"related", "related to", "connected to", "links", "link", "is"}:
        return "is connected with"
    return clean


def extract_intra_relationships_heuristic(
    doc: DocumentInput,
    concepts: List[ConceptNode]
) -> List[RelationshipEdge]:
    """
    Intelligent STEM rule-based heuristic intra-chapter relationship extractor.
    Operates over concept prerequisites, text co-occurrences, and definitional dependencies.
    """
    if not concepts or len(concepts) < 2:
        return []

    concept_map: Dict[str, ConceptNode] = {c.id: c for c in concepts}
    concept_names: Dict[str, str] = {c.name.lower(): c.id for c in concepts}
    edges: List[RelationshipEdge] = []
    seen_pairs: Set[Tuple[str, str]] = set()

    edge_counter = 1

    # 1. Prerequisite based connections
    for c in concepts:
        for prereq in c.prerequisites:
            prereq_clean = prereq.strip().lower()
            matched_id = concept_names.get(prereq_clean)
            if not matched_id:
                # Try partial match
                for name_low, cid in concept_names.items():
                    if name_low in prereq_clean or prereq_clean in name_low:
                        matched_id = cid
                        break

            if matched_id and matched_id != c.id and (matched_id, c.id) not in seen_pairs:
                seen_pairs.add((matched_id, c.id))
                edges.append(
                    RelationshipEdge(
                        id=f"rel_intra_{edge_counter:03d}",
                        source=matched_id,
                        target=c.id,
                        label="is required as prerequisite for",
                        scope="intra-disciplinary",
                        evidence_type="explicit",
                        confidence=0.95,
                        explanation=f"Understanding {concept_map[matched_id].name} is an established prerequisite for mastering {c.name} in {doc.subject}.",
                        evidence=[f"Chapter prerequisite: {concept_map[matched_id].name} -> {c.name}"]
                    )
                )
                edge_counter += 1

    # 2. Text / Description reference connections
    for c in concepts:
        desc_lower = c.description.lower()
        for other in concepts:
            if other.id == c.id:
                continue
            pair = (other.id, c.id)
            if pair in seen_pairs:
                continue

            # Check if other's name appears in c's description or quote
            other_name_low = other.name.lower()
            quote_lower = (c.source.quote if c.source and c.source.quote else "").lower()

            if other_name_low in desc_lower or other_name_low in quote_lower:
                seen_pairs.add(pair)
                
                # Determine meaningful label by concept types
                label = "is used in the definition and calculation of"
                if other.type in {"operation", "algorithm"} and c.type in {"model", "process"}:
                    label = "computes the core operations for"
                elif other.type == "mathematical object" and c.type in {"operation", "transformation"}:
                    label = "serves as the mathematical input for"
                elif other.type in {"formula", "principle"} and c.type in {"definition", "algorithm"}:
                    label = "provides the mathematical rule governing"

                edges.append(
                    RelationshipEdge(
                        id=f"rel_intra_{edge_counter:03d}",
                        source=other.id,
                        target=c.id,
                        label=label,
                        scope="intra-disciplinary",
                        evidence_type="explicit" if other_name_low in quote_lower else "inferred",
                        confidence=0.90 if other_name_low in quote_lower else 0.82,
                        explanation=f"{other.name} is directly utilized to construct and understand {c.name} in {doc.chapter}.",
                        evidence=[
                            f"Context from {doc.chapter}: {c.description[:180]}"
                        ]
                    )
                )
                edge_counter += 1

    # 3. Structural fallback if very few connections exist
    if len(edges) < 2 and len(concepts) >= 2:
        # Link adjacent chronological concepts in the chapter
        for i in range(len(concepts) - 1):
            src = concepts[i]
            tgt = concepts[i + 1]
            pair = (src.id, tgt.id)
            if pair not in seen_pairs:
                seen_pairs.add(pair)
                edges.append(
                    RelationshipEdge(
                        id=f"rel_intra_{edge_counter:03d}",
                        source=src.id,
                        target=tgt.id,
                        label="provides foundational context for",
                        scope="intra-disciplinary",
                        evidence_type="inferred",
                        confidence=0.75,
                        explanation=f"In {doc.chapter}, {src.name} introduces foundational concepts that lead into {tgt.name}.",
                        evidence=[f"Chapter flow in {doc.subject}: {src.name} -> {tgt.name}"]
                    )
                )
                edge_counter += 1

    return edges


def extract_intra_relationships(
    doc: DocumentInput,
    concepts: List[ConceptNode]
) -> List[RelationshipEdge]:
    """
    Extracts explicit and inferred intra-disciplinary relationships within a single chapter.
    Uses LLM with strict JSON schema validation, falling back to heuristic engine.
    """
    if not concepts or len(concepts) < 2:
        return []

    concept_ids = {c.id for c in concepts}
    concept_map = {c.id: c for c in concepts}

    concept_summary_list = [
        {"id": c.id, "name": c.name, "type": c.type, "description": c.description}
        for c in concepts
    ]

    prompt = f"""
You are an expert STEM textbook knowledge graph architect.
Extract meaningful INTRA-DISCIPLINARY relationships between concepts within the SAME chapter:

SUBJECT: {doc.subject}
CHAPTER TITLE: {doc.chapter}

AVAILABLE CONCEPTS (Use ONLY these exact concept IDs for 'source' and 'target'):
{json.dumps(concept_summary_list, indent=2)}

CHAPTER TEXT EXCERPT:
\"\"\"
{doc.text[:6000]}
\"\"\"

INSTRUCTIONS:
1. Extract 3 to 7 high-quality intra-chapter relationships between the concepts listed above.
2. 'source' and 'target' MUST be exact IDs from the concept list above.
3. 'source' and 'target' MUST NOT be the same concept (no self-loops).
4. 'label' must be a concise active natural-language verb phrase (e.g. "provides the foundation for", "is transformed by", "computes the state for", "is an instance of", "depends on", "enables"). Do NOT use generic labels like "related to".
5. 'evidence_type' must be either "explicit" (directly stated in the textbook text) or "inferred" (logically derived).
6. 'confidence' must be a float between 0.70 and 1.00.
7. 'explanation' must clearly describe why and how the source concept relates to the target concept.
8. 'evidence' must be a list of 1-2 text quotes or concise logical justifications.

Return a valid JSON object with the key "relationships" containing an array of relationship objects matching this schema:
{{
  "relationships": [
    {{
      "source": "concept_id_1",
      "target": "concept_id_2",
      "label": "is used to compute",
      "evidence_type": "explicit",
      "confidence": 0.95,
      "explanation": "Clear explanation of within-subject relationship.",
      "evidence": ["Direct quote or evidence from text."]
    }}
  ]
}}
"""

    system_instruction = "You are a STEM textbook relationship extraction engine. Output strictly valid JSON conforming to the requested schema."

    try:
        data = call_llm_json(prompt, system_instruction)
        raw_rels = []
        if isinstance(data, dict):
            raw_rels = data.get("relationships", [])
        elif isinstance(data, list):
            raw_rels = data

        validated_edges: List[RelationshipEdge] = []
        seen_pairs: Set[Tuple[str, str]] = set()
        edge_counter = 1

        for r in raw_rels:
            if not isinstance(r, dict):
                continue
            
            src = str(r.get("source", "")).strip()
            tgt = str(r.get("target", "")).strip()
            
            # Validation checks
            if not src or not tgt or src == tgt:
                continue
            if src not in concept_ids or tgt not in concept_ids:
                # Attempt soft match
                src_match = next((cid for cid in concept_ids if cid.lower() == src.lower()), None)
                tgt_match = next((cid for cid in concept_ids if cid.lower() == tgt.lower()), None)
                if src_match and tgt_match and src_match != tgt_match:
                    src, tgt = src_match, tgt_match
                else:
                    continue

            pair = (src, tgt)
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            label = clean_predicate_label(str(r.get("label", "connects with")))
            ev_type = str(r.get("evidence_type", "explicit")).lower()
            if ev_type not in ["explicit", "inferred"]:
                ev_type = "explicit"

            conf = float(r.get("confidence", 0.9))
            conf = max(0.5, min(1.0, conf))

            explanation = str(r.get("explanation", f"{concept_map[src].name} connects to {concept_map[tgt].name} in {doc.subject}.")).strip()
            raw_ev = r.get("evidence", [])
            evidence = [str(e).strip() for e in raw_ev if str(e).strip()] if isinstance(raw_ev, list) else [str(raw_ev)]

            validated_edges.append(
                RelationshipEdge(
                    id=f"rel_intra_{edge_counter:03d}",
                    source=src,
                    target=tgt,
                    label=label,
                    scope="intra-disciplinary",
                    evidence_type=ev_type,  # type: ignore
                    confidence=round(conf, 2),
                    explanation=explanation,
                    evidence=evidence or [f"Mentioned in {doc.chapter} ({doc.subject})"]
                )
            )
            edge_counter += 1

        if len(validated_edges) >= 2:
            return validated_edges

    except Exception as e:
        print(f"LLM intra-relationship extraction fallback triggered for '{doc.subject}': {e}")

    # Fallback to heuristic
    return extract_intra_relationships_heuristic(doc, concepts)
