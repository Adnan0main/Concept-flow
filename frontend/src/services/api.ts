import type { HealthResponse, BackendStatus, DocumentInput, DocumentMetadata } from '../types/graph';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function getBackendStatus(): Promise<BackendStatus> {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) {
    throw new Error(`Status check failed with HTTP ${response.status}`);
  }
  return response.json();
}

export interface ExtractedFileResult {
  success: boolean;
  filename: string;
  text: string;
  page_count: number;
  character_count: number;
  word_count: number;
}

export async function extractDocumentFile(file: File): Promise<ExtractedFileResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/documents/extract-file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Document extraction failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function validateDocumentsBatch(
  documents: DocumentInput[]
): Promise<{ success: boolean; valid_count: number; documents: DocumentMetadata[] }> {
  const response = await fetch(`${API_BASE}/documents/validate-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documents),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Document validation failed (HTTP ${response.status})`);
  }

  return response.json();
}

export interface ExtractConceptsResult {
  success: boolean;
  total_concepts: number;
  concepts: import('../types/graph').ConceptNode[];
  by_document: Record<string, import('../types/graph').ConceptNode[]>;
}

export async function extractConceptsFromDocuments(
  documents: DocumentInput[]
): Promise<ExtractConceptsResult> {
  const response = await fetch(`${API_BASE}/extract-concepts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documents),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Concept extraction failed (HTTP ${response.status})`);
  }

  return response.json();
}

export interface RelationshipsResult {
  success: boolean;
  total_relationships: number;
  relationships: import('../types/graph').RelationshipEdge[];
  by_document?: Record<string, import('../types/graph').RelationshipEdge[]>;
}

export async function extractIntraRelationships(
  documents: DocumentInput[],
  concepts: import('../types/graph').ConceptNode[]
): Promise<RelationshipsResult> {
  const response = await fetch(`${API_BASE}/extract-intra-relationships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, concepts }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Intra-relationship extraction failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function inferCrossDisciplinary(
  documents: DocumentInput[],
  concepts: import('../types/graph').ConceptNode[]
): Promise<RelationshipsResult> {
  const response = await fetch(`${API_BASE}/infer-cross-disciplinary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, concepts }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Cross-disciplinary inference failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function generateKnowledgeGraph(
  documents: DocumentInput[],
  title?: string
): Promise<import('../types/graph').KnowledgeGraph> {
  const response = await fetch(`${API_BASE}/generate-graph`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Knowledge graph generation failed (HTTP ${response.status})`);
  }

  return response.json();
}

