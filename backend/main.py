import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.graph_models import (
    HealthResponse,
    DocumentInput,
    DocumentMetadata,
    ConceptNode,
    RelationshipEdge,
    KnowledgeGraph,
    GraphSummary,
    IntraRelationshipsRequest,
    BatchIntraRelationshipsRequest,
    CrossDisciplinaryRequest,
    GenerateGraphRequest,
)
from services.pdf_parser import (
    extract_text_from_pdf_bytes,
    clean_extracted_text,
    validate_chapter_text,
)
from services.concept_extractor import (
    extract_concepts_from_document,
)
from services.relationship_extractor import (
    extract_intra_relationships,
)
from services.cross_disciplinary_engine import (
    infer_cross_disciplinary_relationships,
)

load_dotenv()

app = FastAPI(
    title="ConceptFlow API",
    description="AI-powered visual knowledge graph for STEM textbooks with cross-disciplinary discovery",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for frontend-backend communication verification."""
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        project="ConceptFlow",
        ready=True
    )


@app.get("/api/status")
async def status_check():
    """Returns backend environment and engine readiness status."""
    has_groq = bool(os.getenv("GROQ_API_KEY"))
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    
    provider = "demo_mode"
    if has_groq:
        provider = "groq"
    elif has_gemini:
        provider = "gemini"
    elif has_openai:
        provider = "openai"

    return {
        "status": "online",
        "llm_configured": has_groq or has_gemini or has_openai,
        "active_provider": provider,
        "modules_active": [
            "Module 0: Project Foundation",
            "Module 1: Basic UI",
            "Module 2: Dual/Multi Document Processing",
            "Module 3: Concept Extraction",
            "Module 4: Explicit & Intra-Disciplinary Relationships",
            "Module 5: Cross-Disciplinary Inference Engine (Surprise Challenge)",
            "Module 6: Unified Graph Synthesis"
        ]
    }


@app.post("/api/documents/extract-file")
async def extract_file(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Extracts, cleans, and validates text from an uploaded PDF or text file.
    """
    filename = file.filename or "uploaded_file"
    ext = filename.lower().split(".")[-1] if "." in filename else ""

    try:
        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if ext == "pdf":
            text, pages = extract_text_from_pdf_bytes(content_bytes)
            validation = validate_chapter_text(text)
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail=validation["error"])
            
            return {
                "success": True,
                "filename": filename,
                "text": text,
                "page_count": pages,
                "character_count": validation["character_count"],
                "word_count": validation["word_count"],
            }
        else:
            try:
                raw_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raw_text = content_bytes.decode("latin-1", errors="ignore")

            text = clean_extracted_text(raw_text)
            validation = validate_chapter_text(text)
            if not validation["valid"]:
                raise HTTPException(status_code=400, detail=validation["error"])

            return {
                "success": True,
                "filename": filename,
                "text": text,
                "page_count": 1,
                "character_count": validation["character_count"],
                "word_count": validation["word_count"],
            }

    except HTTPException as he:
        raise he
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected document extraction error: {str(e)}")


@app.post("/api/documents/validate-batch")
async def validate_batch(
    documents: List[DocumentInput]
) -> Dict[str, Any]:
    """
    Validates a list of document inputs (pasted text or extracted files).
    Produces validated DocumentMetadata for downstream AI stages.
    """
    if not documents or len(documents) == 0:
        raise HTTPException(status_code=400, detail="At least 1 chapter is required.")

    validated_docs: List[DocumentMetadata] = []
    errors: List[str] = []

    for idx, doc in enumerate(documents):
        if not doc.subject.strip():
            errors.append(f"Chapter #{idx + 1} is missing a Subject name.")
        if not doc.chapter.strip():
            errors.append(f"Chapter #{idx + 1} ({doc.subject or 'Unknown'}) is missing a Chapter title.")
        
        val = validate_chapter_text(doc.text, min_chars=20)
        if not val["valid"]:
            errors.append(f"Chapter #{idx + 1} ({doc.subject or 'Unknown'}): {val['error']}")
        else:
            validated_docs.append(
                DocumentMetadata(
                    id=doc.id or f"doc_{idx + 1}",
                    subject=doc.subject.strip(),
                    chapter=doc.chapter.strip(),
                    filename=doc.filename,
                    character_count=val["character_count"],
                    concept_count=0,
                )
            )

    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    return {
        "success": True,
        "valid_count": len(validated_docs),
        "documents": [d.model_dump() for d in validated_docs]
    }


# ==============================================================================
# Module 3: Concept Extraction Endpoint
# ==============================================================================
@app.post("/api/extract-concepts")
async def extract_concepts_endpoint(
    documents: List[DocumentInput]
) -> Dict[str, Any]:
    """
    Module 3: Extracts structured STEM concepts independently from each chapter.
    """
    if not documents or len(documents) == 0:
        raise HTTPException(status_code=400, detail="At least 1 document is required for concept extraction.")

    all_concepts: List[ConceptNode] = []
    by_document: Dict[str, List[Dict[str, Any]]] = {}

    for doc in documents:
        if not doc.text.strip():
            continue
        doc_concepts = extract_concepts_from_document(doc)
        all_concepts.extend(doc_concepts)
        by_document[doc.id or doc.subject] = [c.model_dump() for c in doc_concepts]

    return {
        "success": True,
        "total_concepts": len(all_concepts),
        "concepts": [c.model_dump() for c in all_concepts],
        "by_document": by_document,
    }


# ==============================================================================
# Module 4: Intra-Disciplinary Relationships Endpoint
# ==============================================================================
@app.post("/api/extract-intra-relationships")
async def extract_intra_relationships_endpoint(
    payload: BatchIntraRelationshipsRequest
) -> Dict[str, Any]:
    """
    Module 4: Extracts explicit and inferred intra-disciplinary relationships within chapters.
    """
    if not payload.documents:
        raise HTTPException(status_code=400, detail="Documents are required for relationship extraction.")

    all_edges: List[RelationshipEdge] = []
    by_document: Dict[str, List[Dict[str, Any]]] = {}

    for doc in payload.documents:
        # Filter concepts belonging to this document if provided, otherwise extract them first
        doc_concepts: List[ConceptNode] = []
        if payload.concepts:
            doc_concepts = [
                c for c in payload.concepts 
                if (c.source and c.source.document_id == doc.id) or (c.subject.lower() == doc.subject.lower())
            ]
        
        if not doc_concepts:
            doc_concepts = extract_concepts_from_document(doc)

        edges = extract_intra_relationships(doc, doc_concepts)
        all_edges.extend(edges)
        by_document[doc.id or doc.subject] = [e.model_dump() for e in edges]

    return {
        "success": True,
        "total_relationships": len(all_edges),
        "relationships": [e.model_dump() for e in all_edges],
        "by_document": by_document,
    }


# ==============================================================================
# Module 5: Cross-Disciplinary Inference Endpoint (Surprise Challenge)
# ==============================================================================
@app.post("/api/infer-cross-disciplinary")
async def infer_cross_disciplinary_endpoint(
    payload: CrossDisciplinaryRequest
) -> Dict[str, Any]:
    """
    Module 5 (Surprise Challenge): Discovers cross-disciplinary relationships between concepts
    belonging to different subjects.
    """
    if len(payload.documents) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Cross-disciplinary inference requires at least 2 chapters from different subjects."
        )

    concepts = payload.concepts
    if not concepts:
        # Extract concepts from documents if not supplied
        for doc in payload.documents:
            concepts.extend(extract_concepts_from_document(doc))

    cross_edges = infer_cross_disciplinary_relationships(payload.documents, concepts)

    return {
        "success": True,
        "total_relationships": len(cross_edges),
        "relationships": [e.model_dump() for e in cross_edges],
    }


# ==============================================================================
# End-to-End Knowledge Graph Synthesis Endpoint
# ==============================================================================
@app.post("/api/generate-graph", response_model=KnowledgeGraph)
async def generate_graph_endpoint(
    payload: GenerateGraphRequest
) -> KnowledgeGraph:
    """
    Full End-to-End Orchestrator:
    1. Validates documents (Module 2)
    2. Extracts structured concepts per chapter (Module 3)
    3. Extracts within-chapter intra-disciplinary relationships (Module 4)
    4. Discovers cross-disciplinary bridges between subjects (Module 5)
    5. Validates structural graph consistency and calculates statistics
    """
    documents = payload.documents
    if not documents or len(documents) == 0:
        raise HTTPException(status_code=400, detail="At least 1 chapter is required to generate a graph.")

    doc_metadata_list: List[DocumentMetadata] = []
    all_nodes: List[ConceptNode] = []
    all_edges: List[RelationshipEdge] = []
    concept_id_set = set()

    # Step 1 & 2: Process documents and extract concepts per document (Module 3)
    for idx, doc in enumerate(documents):
        val = validate_chapter_text(doc.text, min_chars=10)
        doc_id = doc.id or f"doc_{idx + 1}"
        
        doc_concepts = extract_concepts_from_document(doc)
        
        # Deduplicate node IDs across entire graph
        for c in doc_concepts:
            if c.id not in concept_id_set:
                concept_id_set.add(c.id)
                all_nodes.append(c)

        doc_meta = DocumentMetadata(
            id=doc_id,
            subject=doc.subject.strip(),
            chapter=doc.chapter.strip(),
            filename=doc.filename,
            character_count=val.get("character_count", len(doc.text)),
            concept_count=len(doc_concepts),
        )
        doc_metadata_list.append(doc_meta)

        # Step 3: Extract Intra-Disciplinary Relationships (Module 4)
        intra_edges = extract_intra_relationships(doc, doc_concepts)
        all_edges.extend(intra_edges)

    # Step 4: Discover Cross-Disciplinary Relationships if >= 2 documents (Module 5)
    if len(documents) >= 2:
        cross_edges = infer_cross_disciplinary_relationships(documents, all_nodes)
        all_edges.extend(cross_edges)

    # Step 5: Validate and clean edges
    validated_edges: List[RelationshipEdge] = []
    seen_edge_keys = set()

    for edge in all_edges:
        # Check source and target existence
        if edge.source not in concept_id_set or edge.target not in concept_id_set:
            continue
        if edge.source == edge.target:
            continue

        edge_key = (edge.source, edge.target, edge.scope)
        if edge_key in seen_edge_keys:
            continue
        seen_edge_keys.add(edge_key)
        validated_edges.append(edge)

    # Calculate statistics
    intra_count = sum(1 for e in validated_edges if e.scope == "intra-disciplinary")
    cross_count = sum(1 for e in validated_edges if e.scope == "cross-disciplinary")
    explicit_count = sum(1 for e in validated_edges if e.evidence_type == "explicit")
    inferred_count = sum(1 for e in validated_edges if e.evidence_type == "inferred")

    stats = GraphSummary(
        documents_count=len(documents),
        concepts_count=len(all_nodes),
        intra_relationships_count=intra_count,
        cross_relationships_count=cross_count,
        explicit_relationships_count=explicit_count,
        inferred_relationships_count=inferred_count,
    )

    # Create descriptive summary title and overview
    subjects = list(dict.fromkeys(d.subject for d in documents if d.subject))
    title = payload.title or (" + ".join(subjects) if subjects else "STEM Knowledge Graph")
    
    summary = (
        f"ConceptFlow mapped {len(all_nodes)} core concepts across "
        f"{', '.join(subjects)}, uncovering {intra_count} within-subject foundations "
        f"and {cross_count} cross-disciplinary conceptual bridges."
    )

    return KnowledgeGraph(
        title=title,
        documents=doc_metadata_list,
        summary=summary,
        stats=stats,
        nodes=all_nodes,
        relationships=validated_edges,
    )


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
