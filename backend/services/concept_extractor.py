import re
import json
from typing import List, Dict, Any, Optional
from models.graph_models import ConceptNode, ConceptSource, DocumentInput
from services.llm_client import call_llm_json


def clean_concept_name(name: str) -> str:
    """Strips leading articles and trims concept names."""
    clean = re.sub(r'^(?:A|An|The)\s+', '', name.strip(), flags=re.IGNORECASE)
    return clean.strip()


def normalize_concept_id(name: str) -> str:
    """Converts a concept name into a clean, normalized ID."""
    clean_name = clean_concept_name(name)
    clean = re.sub(r'[^a-zA-Z0-9\s_]', '', clean_name.lower())
    clean = re.sub(r'\s+', '_', clean)
    return clean or "concept_node"


def extract_concepts_heuristic(doc: DocumentInput) -> List[ConceptNode]:
    """
    Intelligent STEM rule-based heuristic concept extractor.
    Used when LLM is offline or as a deterministic fallback.
    """
    text = doc.text.strip()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    concepts: List[ConceptNode] = []
    seen_ids = set()

    # Common STEM definitional and entity patterns
    def_patterns = [
        r'(?:A|An|The)?\s*([A-Z][A-Za-z0-9\s\-]{2,35}?)\s+(?:is|are|is defined as|represents|denotes|refers to|consists of)\s+([^.!?]+[.!?])',
        r'([A-Z][A-Za-z0-9\s\-]{2,35}?)\s*:\s*([^.!?\n]+)',
        r'(?:Definition|Concept|Principle)\s*:\s*([A-Z][A-Za-z0-9\s\-]{2,35}?)\s*[-—–]\s*([^.!?\n]+)',
    ]

    # Formula detection pattern
    formula_pattern = re.compile(r'([A-Za-z0-9_^\(\)\{\}\[\]\*\+\-\/\\=><\s]{3,}\s*=\s*[A-Za-z0-9_^\(\)\{\}\[\]\*\+\-\/\\><\s]{2,})')

    for line in lines:
        for pattern in def_patterns:
            matches = re.finditer(pattern, line)
            for m in matches:
                raw_name = m.group(1).strip()
                raw_desc = m.group(2).strip()

                # Filter out generic words or very long sentences
                if len(raw_name.split()) > 5 or len(raw_name) < 3:
                    continue
                if raw_name.lower() in {"chapter", "section", "figure", "table", "example", "theorem", "lemma", "note"}:
                    continue

                cid = normalize_concept_id(raw_name)
                if cid in seen_ids:
                    continue
                seen_ids.add(cid)

                # Determine type heuristically
                ctype = "definition"
                lower_name = raw_name.lower()
                lower_desc = raw_desc.lower()

                if any(w in lower_name or w in lower_desc for w in ["matrix", "vector", "tensor", "scalar", "set", "space", "field"]):
                    ctype = "mathematical object"
                elif any(w in lower_name or w in lower_desc for w in ["multiplication", "addition", "operation", "transformation", "product"]):
                    ctype = "operation"
                elif any(w in lower_name or w in lower_desc for w in ["algorithm", "propagation", "gradient descent", "backprop"]):
                    ctype = "algorithm"
                elif any(w in lower_name or w in lower_desc for w in ["layer", "neuron", "network", "perceptron", "model", "architecture"]):
                    ctype = "model"
                elif any(w in lower_name or w in lower_desc for w in ["function", "activation", "sigmoid", "relu", "loss"]):
                    ctype = "function"
                elif any(w in lower_name or w in lower_desc for w in ["rule", "theorem", "law", "principle", "property"]):
                    ctype = "principle"

                # Check for formula in line
                formulas = []
                f_matches = formula_pattern.findall(line)
                for f in f_matches:
                    f_clean = f.strip()
                    if len(f_clean) > 4 and "=" in f_clean:
                        formulas.append(f_clean)

                clean_name = clean_concept_name(raw_name)
                concepts.append(
                    ConceptNode(
                        id=cid,
                        name=clean_name,
                        subject=doc.subject,
                        chapter=doc.chapter,
                        type=ctype,
                        description=raw_desc,
                        importance="high" if len(concepts) < 4 else "medium",
                        prerequisites=[],
                        examples=[],
                        formulas=formulas[:2],
                        source=ConceptSource(
                            document_id=doc.id,
                            section=doc.chapter,
                            quote=line[:200]
                        )
                    )
                )

    # If heuristic found fewer than 3 concepts, extract key capitalized terms
    if len(concepts) < 3:
        for line in lines:
            words = re.findall(r'\b[A-Z][a-zA-Z0-9\-]+(?:\s+[A-Z][a-zA-Z0-9\-]+)*\b', line)
            for term in words:
                if len(term) > 3 and term.lower() not in {"the", "this", "that", "chapter", "section"}:
                    cid = normalize_concept_id(term)
                    if cid not in seen_ids:
                        seen_ids.add(cid)
                        concepts.append(
                            ConceptNode(
                                id=cid,
                                name=term,
                                subject=doc.subject,
                                chapter=doc.chapter,
                                type="definition",
                                description=f"Core concept in {doc.subject}: {term}.",
                                importance="high" if len(concepts) < 3 else "medium",
                                prerequisites=[],
                                examples=[],
                                formulas=[],
                                source=ConceptSource(document_id=doc.id, section=doc.chapter, quote=line[:200])
                            )
                        )
                if len(concepts) >= 8:
                    break

    return concepts[:10]


def extract_concepts_from_document(doc: DocumentInput) -> List[ConceptNode]:
    """
    Extracts structured concepts from a single document.
    Tries LLM first, with automatic fallback to heuristic extractor.
    """
    prompt = f"""
You are an expert STEM curriculum analyzer for textbook concept mapping.
Extract 5 to 8 of the most important concepts from the following chapter:

SUBJECT: {doc.subject}
CHAPTER TITLE: {doc.chapter}

TEXTBOOK EXCERPT:
\"\"\"
{doc.text[:6000]}
\"\"\"

Return a valid JSON object with the key "concepts" containing an array of concept objects.
Each concept object MUST follow this schema:
{{
  "name": "Display Name (e.g. Matrix Multiplication)",
  "type": "one of: definition, mathematical object, operation, formula, algorithm, process, model, principle, variable, function, application, other",
  "description": "Clear 1-2 sentence definition or explanation.",
  "importance": "high" or "medium" or "low",
  "prerequisites": ["List", "of", "prerequisite", "concept", "names"],
  "examples": ["Concrete example 1"],
  "formulas": ["Mathematical formula if applicable (e.g. C = A * B)"],
  "quote": "Direct quote from excerpt supporting this concept."
}}
"""

    system_instruction = "You are a STEM textbook concept extraction engine. Respond strictly with valid JSON conforming to the requested schema. Do not include conversational text or unescaped characters."

    try:
        data = call_llm_json(prompt, system_instruction)
        raw_list = []
        if isinstance(data, dict):
            raw_list = data.get("concepts", [])
        elif isinstance(data, list):
            raw_list = data

        concepts: List[ConceptNode] = []
        seen_ids = set()

        for item in raw_list:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            if not name:
                continue

            cid = normalize_concept_id(name)
            if cid in seen_ids:
                continue
            seen_ids.add(cid)

            ctype = str(item.get("type", "definition")).lower()
            desc = str(item.get("description", f"Concept from {doc.subject}")).strip()
            imp = str(item.get("importance", "high")).lower()
            if imp not in ["high", "medium", "low"]:
                imp = "high"

            prereqs = [str(p).strip() for p in item.get("prerequisites", []) if str(p).strip()]
            examples = [str(e).strip() for e in item.get("examples", []) if str(e).strip()]
            formulas = [str(f).strip() for f in item.get("formulas", []) if str(f).strip()]
            quote = str(item.get("quote", ""))

            concepts.append(
                ConceptNode(
                    id=cid,
                    name=name,
                    subject=doc.subject,
                    chapter=doc.chapter,
                    type=ctype,
                    description=desc,
                    importance=imp,  # type: ignore
                    prerequisites=prereqs,
                    examples=examples,
                    formulas=formulas,
                    source=ConceptSource(
                        document_id=doc.id,
                        section=doc.chapter,
                        quote=quote or doc.text[:150]
                    )
                )
            )

        if len(concepts) >= 2:
            return concepts

    except Exception as e:
        print(f"LLM extraction fallback triggered for '{doc.subject}': {e}")

    # Fallback to heuristic extractor
    return extract_concepts_heuristic(doc)
