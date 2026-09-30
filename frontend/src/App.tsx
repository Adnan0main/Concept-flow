import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { GraphCanvas } from './components/GraphCanvas';
import { SideInspector } from './components/SideInspector';
import { checkBackendHealth, getBackendStatus, generateKnowledgeGraph } from './services/api';
import { DEMO_GRAPH, DEMO_SCENARIOS } from './data/demoData';
import type { 
  HealthResponse, 
  BackendStatus, 
  DocumentInput, 
  KnowledgeGraph, 
  ConceptNode, 
  RelationshipEdge 
} from './types/graph';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('linear_algebra_nn');
  
  // Document inputs state (starts with 2 chapters, supports N >= 5)
  const [documents, setDocuments] = useState<DocumentInput[]>([
    {
      id: 'doc_1',
      subject: 'Linear Algebra',
      chapter: 'Matrix Transformations',
      text: '',
    },
    {
      id: 'doc_2',
      subject: 'Neural Networks',
      chapter: 'Forward Propagation and Layers',
      text: '',
    },
  ]);

  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<RelationshipEdge | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [healthData, statusData] = await Promise.all([
          checkBackendHealth(),
          getBackendStatus(),
        ]);
        setHealth(healthData);
        setStatus(statusData);
      } catch (err) {
        console.error('Failed to connect to ConceptFlow Backend:', err);
      }
    };
    fetchStatus();
  }, []);

  const handleAddDocument = () => {
    if (documents.length >= 5) return;
    const newIdx = documents.length + 1;
    setDocuments([
      ...documents,
      {
        id: `doc_${newIdx}`,
        subject: '',
        chapter: '',
        text: '',
      },
    ]);
  };

  const handleUpdateDocument = (index: number, updated: DocumentInput) => {
    const nextDocs = [...documents];
    nextDocs[index] = updated;
    setDocuments(nextDocs);
  };

  const handleRemoveDocument = (index: number) => {
    if (documents.length <= 1) return;
    setDocuments(documents.filter((_, idx) => idx !== index));
  };

  const handleSelectScenario = (scenarioKey: string) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (scenario) {
      setSelectedScenarioKey(scenarioKey);
      setDocuments(scenario.documents);
      setGraph(scenario.graph);
      setGenerationError(null);
      // Auto-select the first cross-disciplinary edge in this scenario
      const crossEdge = scenario.graph.relationships.find((r) => r.scope === 'cross-disciplinary');
      if (crossEdge) {
        setSelectedEdge(crossEdge);
        setSelectedNode(null);
      } else if (scenario.graph.nodes.length > 0) {
        setSelectedNode(scenario.graph.nodes[0]);
        setSelectedEdge(null);
      }
    }
  };

  const handleReset = () => {
    setGraph(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    setGenerationError(null);
  };

  const handleGenerate = async () => {
    const validDocs = documents.filter(
      (d) => d.text.trim().length > 0 && d.subject.trim().length > 0
    );
    if (validDocs.length === 0) {
      setGenerationError('Please provide at least one chapter with a subject name and chapter text.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const synthesizedGraph = await generateKnowledgeGraph(validDocs);
      setGraph(synthesizedGraph);
      
      // Auto-select the first cross-disciplinary edge to reveal the core surprise-challenge differentiator
      const crossEdge = synthesizedGraph.relationships.find((r) => r.scope === 'cross-disciplinary');
      if (crossEdge) {
        setSelectedEdge(crossEdge);
        setSelectedNode(null);
      } else if (synthesizedGraph.nodes.length > 0) {
        setSelectedNode(synthesizedGraph.nodes[0]);
        setSelectedEdge(null);
      }
    } catch (err: any) {
      console.error('Failed to generate knowledge graph via backend:', err);
      setGenerationError(err?.message || 'Failed to generate knowledge graph from backend. Falling back to demo mode.');
      setGraph(DEMO_GRAPH);
      const crossEdge = DEMO_GRAPH.relationships.find((r) => r.scope === 'cross-disciplinary');
      if (crossEdge) {
        setSelectedEdge(crossEdge);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        health={health}
        status={status}
        selectedScenario={selectedScenarioKey}
        onSelectScenario={handleSelectScenario}
        onReset={handleReset}
        hasGraph={Boolean(graph)}
      />

      {/* Main Workspace Layout */}
      <main
        style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Document Upload Section */}
        <UploadSection
          documents={documents}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
          onRemoveDocument={handleRemoveDocument}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Generation Error Banner */}
        {generationError && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{generationError}</span>
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                fontWeight: '700',
                padding: '2px 8px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Visual Graph + Inspector Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '20px',
            flex: 1,
            minHeight: '560px',
          }}
        >
          {/* Graph View Canvas */}
          <GraphCanvas
            graph={graph}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onSelectEdge={(edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
            isGenerating={isGenerating}
          />

          {/* Side Inspector & Explorer */}
          <SideInspector
            graph={graph}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onSelectEdge={(edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '12px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
        }}
      >
        ConceptFlow — Hackathon MVP • Modules 3, 4, 5 Cross-Disciplinary Knowledge Graph Active
      </footer>
    </div>
  );
};

export default App;
