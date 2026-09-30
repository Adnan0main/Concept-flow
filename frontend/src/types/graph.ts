export interface DocumentMetadata {
  id: string;
  subject: string;
  chapter: string;
  filename?: string;
  character_count: number;
  concept_count: number;
}

export interface DocumentInput {
  id: string;
  subject: string;
  chapter: string;
  text: string;
  filename?: string;
}

export interface ConceptSource {
  document_id?: string;
  section?: string;
  quote?: string;
  page?: number;
}

export interface ConceptNode {
  id: string;
  name: string;
  subject: string;
  chapter: string;
  type: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  source?: ConceptSource;
  prerequisites: string[];
  examples: string[];
  formulas: string[];
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  scope: 'intra-disciplinary' | 'cross-disciplinary';
  evidence_type: 'explicit' | 'inferred';
  confidence: number;
  explanation: string;
  evidence: string[];
}

export interface GraphSummary {
  documents_count: number;
  concepts_count: number;
  intra_relationships_count: number;
  cross_relationships_count: number;
  explicit_relationships_count: number;
  inferred_relationships_count: number;
}

export interface KnowledgeGraph {
  title: string;
  documents: DocumentMetadata[];
  summary: string;
  stats?: GraphSummary;
  nodes: ConceptNode[];
  relationships: RelationshipEdge[];
}

export interface HealthResponse {
  status: string;
  version: string;
  project: string;
  ready: boolean;
}

export interface BackendStatus {
  status: string;
  llm_configured: boolean;
  active_provider: string;
  modules_active: string[];
}
