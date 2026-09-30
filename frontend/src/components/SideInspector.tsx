import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  GitCommit, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Compass
} from 'lucide-react';
import type { KnowledgeGraph, ConceptNode, RelationshipEdge } from '../types/graph';

interface SideInspectorProps {
  graph: KnowledgeGraph | null;
  selectedNode: ConceptNode | null;
  selectedEdge: RelationshipEdge | null;
  onSelectNode?: (node: ConceptNode | null) => void;
  onSelectEdge?: (edge: RelationshipEdge | null) => void;
}

interface QuizQuestion {
  id: string;
  sourceName: string;
  targetName: string;
  sourceSubject: string;
  targetSubject: string;
  question: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  evidence: string[];
}

export const SideInspector: React.FC<SideInspectorProps> = ({
  graph,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'concept' | 'relationship' | 'practice'>('summary');
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Auto switch tab when user selects an item
  React.useEffect(() => {
    if (selectedNode) setActiveTab('concept');
  }, [selectedNode]);

  React.useEffect(() => {
    if (selectedEdge) setActiveTab('relationship');
  }, [selectedEdge]);

  // Derive connected relationships for the selected concept (Module 8)
  const connectedRelations = useMemo(() => {
    if (!graph || !selectedNode) return { outgoing: [], incoming: [] };
    const outgoing: { edge: RelationshipEdge; targetNode?: ConceptNode }[] = [];
    const incoming: { edge: RelationshipEdge; sourceNode?: ConceptNode }[] = [];

    graph.relationships.forEach((rel) => {
      if (rel.source === selectedNode.id) {
        const targetNode = graph.nodes.find((n) => n.id === rel.target);
        outgoing.push({ edge: rel, targetNode });
      } else if (rel.target === selectedNode.id) {
        const sourceNode = graph.nodes.find((n) => n.id === rel.source);
        incoming.push({ edge: rel, sourceNode });
      }
    });

    return { outgoing, incoming };
  }, [graph, selectedNode]);

  // Derive source and target nodes for the selected edge (Module 9)
  const edgeEndpoints = useMemo(() => {
    if (!graph || !selectedEdge) return { sourceNode: null, targetNode: null };
    const sourceNode = graph.nodes.find((n) => n.id === selectedEdge.source) || null;
    const targetNode = graph.nodes.find((n) => n.id === selectedEdge.target) || null;
    return { sourceNode, targetNode };
  }, [graph, selectedEdge]);

  // Synthesize Quiz Questions dynamically from Cross-Disciplinary Bridges (Module 11)
  const quizQuestions: QuizQuestion[] = useMemo(() => {
    if (!graph) return [];
    const crossEdges = graph.relationships.filter((r) => r.scope === 'cross-disciplinary');
    if (crossEdges.length === 0) return [];

    const plausibleDistractors = [
      'serves as an asymptotic regularization boundary for',
      'calculates the loss surface gradient descent rate for',
      'approximates the non-convex optimization manifold of',
      'normalizes feature distributions across hidden activation units in',
      'determines the orthogonal projection subspace for',
      'initializes stochastic momentum parameters across',
    ];

    return crossEdges.map((edge, idx) => {
      const srcNode = graph.nodes.find((n) => n.id === edge.source);
      const tgtNode = graph.nodes.find((n) => n.id === edge.target);

      const srcName = srcNode?.name || edge.source;
      const tgtName = tgtNode?.name || edge.target;
      const srcSub = srcNode?.subject || 'Subject A';
      const tgtSub = tgtNode?.subject || 'Subject B';

      const correctAnswer = edge.label;
      const distractors = plausibleDistractors
        .filter((d) => d !== correctAnswer)
        .slice((idx * 2) % 3, ((idx * 2) % 3) + 3);

      // Deterministically interleave options
      const options = [correctAnswer, ...distractors].sort((a, b) => a.localeCompare(b));

      return {
        id: edge.id || `quiz_${idx}`,
        sourceName: srcName,
        targetName: tgtName,
        sourceSubject: srcSub,
        targetSubject: tgtSub,
        question: `How does "${srcName}" (${srcSub}) connect conceptually to "${tgtName}" (${tgtSub})?`,
        correctAnswer,
        options,
        explanation: edge.explanation,
        evidence: edge.evidence || [],
      };
    });
  }, [graph]);

  // Derive Sequential Learning Roadmap (Module 11)
  const learningRoadmap = useMemo(() => {
    if (!graph || graph.nodes.length === 0) return [];

    // Phase 1: Foundational concepts (low or zero prerequisites)
    const foundations = graph.nodes.filter(
      (n) => !n.prerequisites || n.prerequisites.length === 0 || n.type === 'mathematical object' || n.type === 'definition'
    );

    // Phase 2: Operations, Algorithms, and Models
    const operations = graph.nodes.filter(
      (n) => !foundations.some((f) => f.id === n.id) && (n.type === 'operation' || n.type === 'formula' || n.type === 'algorithm')
    );

    // Phase 3: Advanced Applications & Remaining Nodes
    const advanced = graph.nodes.filter(
      (n) => !foundations.some((f) => f.id === n.id) && !operations.some((o) => o.id === n.id)
    );

    return [
      { phase: '1. Foundational Objects', nodes: foundations },
      { phase: '2. Core Operations & Transformations', nodes: operations },
      { phase: '3. Multi-Disciplinary Systems & Architectures', nodes: advanced },
    ].filter((p) => p.nodes.length > 0);
  }, [graph]);

  const handleSelectQuizOption = (option: string) => {
    if (selectedOption !== null) return; // already answered current question
    setSelectedOption(option);
    setAnsweredCount((prev) => prev + 1);
    const currentQ = quizQuestions[quizIndex];
    if (currentQ && option === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setScore(0);
    setAnsweredCount(0);
  };

  // Confidence color utility
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return '#10b981'; // Emerald
    if (conf >= 0.8) return '#c084fc'; // Violet
    return '#f59e0b'; // Amber
  };

  return (
    <aside
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '540px',
        overflow: 'hidden',
      }}
    >
      {/* Panel Tabs Header */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          style={{
            flex: 1,
            padding: '12px 6px',
            fontSize: '0.78rem',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'summary' ? '2px solid #6366f1' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'summary' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <BarChart3 size={13} />
          <span>Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('concept')}
          style={{
            flex: 1,
            padding: '12px 6px',
            fontSize: '0.78rem',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'concept' ? '2px solid #6366f1' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'concept' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <BookOpen size={13} />
          <span>Concept</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('relationship')}
          style={{
            flex: 1,
            padding: '12px 6px',
            fontSize: '0.78rem',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'relationship' ? '2px solid #a855f7' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'relationship' ? '#c084fc' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <GitCommit size={13} />
          <span>Bridge {selectedEdge?.scope === 'cross-disciplinary' ? '★' : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          style={{
            flex: 1,
            padding: '12px 6px',
            fontSize: '0.78rem',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === 'practice' ? '2px solid #10b981' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'practice' ? '#34d399' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <GraduationCap size={14} />
          <span>Practice</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
                Graph Overview
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {graph?.summary || 'Generate a graph to view chapter statistics and cross-disciplinary metrics.'}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Concepts</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#818cf8', marginTop: '2px' }}>
                  {graph?.nodes.length || 0}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Links</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399', marginTop: '2px' }}>
                  {graph?.relationships.length || 0}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Within-Subject</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#9ca3af', marginTop: '2px' }}>
                  {graph?.stats?.intra_relationships_count ?? (graph?.relationships.filter((r) => r.scope === 'intra-disciplinary').length || 0)}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '600' }}>Cross-Disciplinary</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#c084fc', marginTop: '2px' }}>
                  {graph?.stats?.cross_relationships_count ?? (graph?.relationships.filter((r) => r.scope === 'cross-disciplinary').length || 0)}
                </div>
              </div>
            </div>

            {/* Document Sources List */}
            {graph && graph.documents && graph.documents.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Synthesized Chapters ({graph.documents.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {graph.documents.map((d, i) => (
                    <div
                      key={d.id || i}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(31, 41, 55, 0.4)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#fff' }}>{d.subject}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                        {d.chapter} • {d.concept_count} concepts extracted
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONCEPT EXPLORER TAB (Module 8) */}
        {activeTab === 'concept' && (
          <div>
            {!selectedNode ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                <BookOpen size={36} color="#6b7280" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>
                  Concept Explorer
                </h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                  Click on any concept node on the visual graph to inspect its definition, formulas, prerequisites, and connected knowledge links.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    <span className="badge badge-info">{selectedNode.subject}</span>
                    <span className="badge badge-warning">{selectedNode.type}</span>
                    <span className={`badge ${selectedNode.importance === 'high' ? 'badge-success' : 'badge-neutral'}`}>
                      {selectedNode.importance} priority
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', lineHeight: '1.2' }}>
                    {selectedNode.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Chapter: {selectedNode.chapter}
                  </div>
                </div>

                {/* Definition */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Definition / Description
                  </label>
                  <p style={{ fontSize: '0.88rem', color: '#e5e7eb', lineHeight: '1.5' }}>
                    {selectedNode.description}
                  </p>
                </div>

                {/* Formulas & Mathematical Notation */}
                {selectedNode.formulas && selectedNode.formulas.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Formulas / Mathematical Notation
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedNode.formulas.map((f, i) => (
                        <code
                          key={i}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(17, 24, 39, 0.9)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#a5b4fc',
                            fontFamily: 'monospace',
                          }}
                        >
                          {f}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites (Clickable Traversal) */}
                {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Prerequisites (Click to Navigate)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedNode.prerequisites.map((p, i) => {
                        const targetNode = graph?.nodes.find(
                          (n) => n.name.toLowerCase() === p.toLowerCase() || n.id === p.toLowerCase().replace(/\s+/g, '_')
                        );
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => targetNode && onSelectNode && onSelectNode(targetNode)}
                            disabled={!targetNode}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: targetNode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(55, 65, 81, 0.3)',
                              border: targetNode ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: targetNode ? '#a5b4fc' : 'var(--text-secondary)',
                              fontSize: '0.72rem',
                              fontWeight: targetNode ? '600' : 'normal',
                              cursor: targetNode ? 'pointer' : 'default',
                            }}
                          >
                            <span>{p}</span>
                            {targetNode && <ExternalLink size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {selectedNode.examples && selectedNode.examples.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Concrete STEM Applications
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedNode.examples.map((ex, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(31, 41, 55, 0.3)',
                            borderLeft: '2px solid #10b981',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            color: '#d1d5db',
                          }}
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Knowledge Traversal (Downstream & Upstream Links) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <Layers size={13} color="#a855f7" />
                    <span>Connected Knowledge Traversal</span>
                  </label>

                  {connectedRelations.outgoing.length === 0 && connectedRelations.incoming.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      No relationships recorded for this concept.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Outgoing connections */}
                      {connectedRelations.outgoing.map(({ edge, targetNode }) => (
                        <button
                          key={edge.id}
                          type="button"
                          onClick={() => {
                            if (targetNode && onSelectNode) {
                              onSelectNode(targetNode);
                            } else if (onSelectEdge) {
                              onSelectEdge(edge);
                            }
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: edge.scope === 'cross-disciplinary' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(31, 41, 55, 0.4)',
                            border: edge.scope === 'cross-disciplinary' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', color: edge.scope === 'cross-disciplinary' ? '#c084fc' : '#9ca3af', fontStyle: 'italic' }}>
                              --[{edge.label}]--&gt;
                            </span>
                            <span className={`badge ${edge.scope === 'cross-disciplinary' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                              {edge.scope === 'cross-disciplinary' ? 'cross-bridge' : 'intra'}
                            </span>
                          </div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.82rem' }}>
                            {targetNode?.name || edge.target}
                          </div>
                        </button>
                      ))}

                      {/* Incoming connections */}
                      {connectedRelations.incoming.map(({ edge, sourceNode }) => (
                        <button
                          key={edge.id}
                          type="button"
                          onClick={() => {
                            if (sourceNode && onSelectNode) {
                              onSelectNode(sourceNode);
                            } else if (onSelectEdge) {
                              onSelectEdge(edge);
                            }
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: edge.scope === 'cross-disciplinary' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(31, 41, 55, 0.4)',
                            border: edge.scope === 'cross-disciplinary' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', color: edge.scope === 'cross-disciplinary' ? '#c084fc' : '#9ca3af', fontStyle: 'italic' }}>
                              &lt;--[{edge.label}]--
                            </span>
                            <span className={`badge ${edge.scope === 'cross-disciplinary' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                              {edge.scope === 'cross-disciplinary' ? 'cross-bridge' : 'intra'}
                            </span>
                          </div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.82rem' }}>
                            {sourceNode?.name || edge.source}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RELATIONSHIP & DUAL-EVIDENCE EXPLORER TAB (Module 9) */}
        {activeTab === 'relationship' && (
          <div>
            {!selectedEdge ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                <GitCommit size={36} color="#6b7280" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>
                  Relationship & Evidence Explorer
                </h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                  Click on any graph connection (especially purple <strong>cross-disciplinary bridges</strong>) to reveal the AI's conceptual rationale and textbook evidence.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Edge Classification & Confidence Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span
                      className={`badge ${
                        selectedEdge.scope === 'cross-disciplinary' ? 'badge-info' : 'badge-success'
                      }`}
                      style={{
                        background: selectedEdge.scope === 'cross-disciplinary' ? 'rgba(168, 85, 247, 0.25)' : undefined,
                        border: selectedEdge.scope === 'cross-disciplinary' ? '1px solid #c084fc' : undefined,
                        color: selectedEdge.scope === 'cross-disciplinary' ? '#f3e8ff' : undefined,
                      }}
                    >
                      {selectedEdge.scope === 'cross-disciplinary' ? '★ Cross-Disciplinary Bridge' : 'Intra-Disciplinary'}
                    </span>
                    <span className="badge badge-warning">
                      {selectedEdge.evidence_type}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: getConfidenceColor(selectedEdge.confidence) }}>
                    {Math.round(selectedEdge.confidence * 100)}% Confidence
                  </span>
                </div>

                {/* Dynamic Confidence Meter */}
                <div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(selectedEdge.confidence * 100)}%`,
                        height: '100%',
                        backgroundColor: getConfidenceColor(selectedEdge.confidence),
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Flow Chain Banner with Endpoint Navigation Buttons */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(31, 41, 55, 0.6)',
                    borderRadius: '8px',
                    border: selectedEdge.scope === 'cross-disciplinary' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>
                      {edgeEndpoints.sourceNode?.name || selectedEdge.source}
                      {edgeEndpoints.sourceNode && (
                        <span style={{ fontSize: '0.7rem', color: '#a5b4fc', marginLeft: '6px' }}>
                          ({edgeEndpoints.sourceNode.subject})
                        </span>
                      )}
                    </div>
                    {edgeEndpoints.sourceNode && onSelectNode && (
                      <button
                        type="button"
                        onClick={() => onSelectNode(edgeEndpoints.sourceNode)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#818cf8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span>Inspect</span>
                        <ExternalLink size={10} />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#c084fc',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(17, 24, 39, 0.6)',
                      borderRadius: '4px',
                    }}
                  >
                    <ArrowRight size={14} />
                    <span>"{selectedEdge.label}"</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>
                      {edgeEndpoints.targetNode?.name || selectedEdge.target}
                      {edgeEndpoints.targetNode && (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', marginLeft: '6px' }}>
                          ({edgeEndpoints.targetNode.subject})
                        </span>
                      )}
                    </div>
                    {edgeEndpoints.targetNode && onSelectNode && (
                      <button
                        type="button"
                        onClick={() => onSelectNode(edgeEndpoints.targetNode)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#34d399',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span>Inspect</span>
                        <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Sparkles size={13} color="#c084fc" />
                    <span>Why are they connected? (Conceptual Rationale)</span>
                  </label>
                  <p style={{ fontSize: '0.88rem', color: '#e5e7eb', lineHeight: '1.5', background: 'rgba(31, 41, 55, 0.3)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #c084fc' }}>
                    {selectedEdge.explanation}
                  </p>
                </div>

                {/* Dual Supporting Evidence Quotes */}
                {selectedEdge.evidence && selectedEdge.evidence.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Supporting Source Evidence Quotes ({selectedEdge.evidence.length})
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedEdge.evidence.map((quote, i) => {
                        const isSubjectA = quote.toLowerCase().includes('linear algebra') || quote.startsWith('[Subject A]') || i === 0;
                        const borderColor = isSubjectA ? '#6366f1' : '#10b981';

                        return (
                          <div
                            key={i}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(17, 24, 39, 0.7)',
                              borderLeft: `3px solid ${borderColor}`,
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              color: '#d1d5db',
                              lineHeight: '1.45',
                            }}
                          >
                            {quote}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PRACTICE & LEARNING PATH TAB (Module 11) */}
        {activeTab === 'practice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Cross-Disciplinary Quiz Engine */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={16} color="#34d399" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                    Cross-Discipline Challenge
                  </h4>
                </div>
                {answeredCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    title="Reset Quiz"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {quizQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Generate a multi-chapter graph to unlock cross-disciplinary challenge questions!
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Progress & Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                    <span style={{ color: '#34d399', fontWeight: '600' }}>
                      Score: {score}/{answeredCount} ({answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0}%)
                    </span>
                  </div>

                  {/* Question Stem */}
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f3f4f6', lineHeight: '1.4' }}>
                    {quizQuestions[quizIndex]?.question}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {quizQuestions[quizIndex]?.options.map((opt, i) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt === quizQuestions[quizIndex]?.correctAnswer;
                      const showResult = selectedOption !== null;

                      let bg = 'rgba(17, 24, 39, 0.7)';
                      let border = '1px solid var(--border-color)';
                      let textColor = '#e5e7eb';

                      if (showResult) {
                        if (isCorrect) {
                          bg = 'rgba(16, 185, 129, 0.2)';
                          border = '1px solid #10b981';
                          textColor = '#34d399';
                        } else if (isSelected) {
                          bg = 'rgba(239, 68, 68, 0.2)';
                          border = '1px solid #ef4444';
                          textColor = '#f87171';
                        }
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectQuizOption(opt)}
                          disabled={showResult}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: bg,
                            border,
                            borderRadius: '6px',
                            color: textColor,
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            cursor: showResult ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span>"{opt}"</span>
                          {showResult && isCorrect && <CheckCircle2 size={14} color="#10b981" />}
                          {showResult && isSelected && !isCorrect && <XCircle size={14} color="#ef4444" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer Explanation & Next Button */}
                  {selectedOption !== null && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '10px',
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${selectedOption === quizQuestions[quizIndex]?.correctAnswer ? '#10b981' : '#f59e0b'}`,
                        fontSize: '0.78rem',
                        lineHeight: '1.45',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ color: '#d1d5db' }}>
                        {quizQuestions[quizIndex]?.explanation}
                      </div>

                      <button
                        type="button"
                        onClick={handleNextQuizQuestion}
                        className="btn-primary"
                        style={{
                          alignSelf: 'flex-end',
                          padding: '6px 14px',
                          fontSize: '0.76rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                      >
                        <span>Next Question</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Recommended Study Roadmap */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Compass size={16} color="#6366f1" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                  Sequential Learning Roadmap
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {learningRoadmap.map((section, pIdx) => (
                  <div key={pIdx}>
                    <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      {section.phase}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.nodes.map((node, nIdx) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => {
                            if (onSelectNode) {
                              onSelectNode(node);
                              setActiveTab('concept');
                            }
                          }}
                          style={{
                            padding: '8px 10px',
                            backgroundColor: 'rgba(31, 41, 55, 0.35)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                                color: '#a5b4fc',
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {nIdx + 1}
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#f3f4f6' }}>
                              {node.name}
                            </span>
                          </div>
                          <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                            {node.subject}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
