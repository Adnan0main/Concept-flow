from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    id: str = Field(..., description="Unique document ID (e.g. doc_1)")
    subject: str = Field(..., description="Subject name (e.g. Linear Algebra)")
    chapter: str = Field(..., description="Chapter title (e.g. Matrix Transformations)")
    filename: Optional[str] = None
    character_count: int = 0
    concept_count: int = 0


class DocumentInput(BaseModel):
    id: str
    subject: str
    chapter: str
    text: str
    filename: Optional[str] = None


class ConceptSource(BaseModel):
    document_id: Optional[str] = None
    section: Optional[str] = None
    quote: Optional[str] = None
    page: Optional[int] = None


class ConceptNode(BaseModel):
    id: str = Field(..., description="Normalized unique node ID")
    name: str = Field(..., description="Display name of the concept")
    subject: str = Field(..., description="Subject or discipline")
    chapter: str = Field(..., description="Originating chapter")
    type: str = Field(
        default="definition",
        description="Concept type: definition, mathematical object, operation, formula, algorithm, process, model, principle, etc."
    )
    description: str = Field(..., description="Concise definition or explanation")
    importance: Literal["high", "medium", "low"] = "high"
    source: Optional[ConceptSource] = None
    prerequisites: List[str] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)
    formulas: List[str] = Field(default_factory=list)


class RelationshipEdge(BaseModel):
    id: str = Field(..., description="Unique edge ID")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Natural language relationship label")
    scope: Literal["intra-disciplinary", "cross-disciplinary"] = "intra-disciplinary"
    evidence_type: Literal["explicit", "inferred"] = "explicit"
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    explanation: str = Field(..., description="Natural language reasoning why these concepts connect")
    evidence: List[str] = Field(default_factory=list, description="Textual or logical evidence")


class GraphSummary(BaseModel):
    documents_count: int = 0
    concepts_count: int = 0
    intra_relationships_count: int = 0
    cross_relationships_count: int = 0
    explicit_relationships_count: int = 0
    inferred_relationships_count: int = 0


class KnowledgeGraph(BaseModel):
    title: str = "ConceptFlow Knowledge Graph"
    documents: List[DocumentMetadata] = Field(default_factory=list)
    summary: str = ""
    stats: Optional[GraphSummary] = None
    nodes: List[ConceptNode] = Field(default_factory=list)
    relationships: List[RelationshipEdge] = Field(default_factory=list)


class IntraRelationshipsRequest(BaseModel):
    document: DocumentInput
    concepts: List[ConceptNode] = Field(default_factory=list)


class BatchIntraRelationshipsRequest(BaseModel):
    documents: List[DocumentInput]
    concepts: Optional[List[ConceptNode]] = None


class CrossDisciplinaryRequest(BaseModel):
    documents: List[DocumentInput]
    concepts: List[ConceptNode] = Field(default_factory=list)


class GenerateGraphRequest(BaseModel):
    documents: List[DocumentInput]
    title: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "2.0.0"
    project: str = "ConceptFlow"
    ready: bool = True

