import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Network, 
  Sparkles, 
  Filter, 
  Search, 
  X,
  Download,
  Image,
  Presentation
} from 'lucide-react';
import type { KnowledgeGraph, ConceptNode, RelationshipEdge } from '../types/graph';

interface GraphCanvasProps {
  graph: KnowledgeGraph | null;
  selectedNode: ConceptNode | null;
  selectedEdge: RelationshipEdge | null;
  onSelectNode: (node: ConceptNode | null) => void;
  onSelectEdge: (edge: RelationshipEdge | null) => void;
  isGenerating?: boolean;
}

const SUBJECT_PALETTES = [
  { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.25)', text: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.6)' }, // Indigo (Subject A)
  { border: '#10b981', bg: 'rgba(16, 185, 129, 0.25)', text: '#d1fae5', glow: 'rgba(16, 185, 129, 0.6)' }, // Emerald (Subject B)
  { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.25)', text: '#fef3c7', glow: 'rgba(245, 158, 11, 0.6)' }, // Amber (Subject C)
  { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.25)', text: '#cffafe', glow: 'rgba(6, 182, 212, 0.6)' },  // Cyan (Subject D)
  { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.25)', text: '#fce7f3', glow: 'rgba(236, 72, 153, 0.6)' }, // Pink (Subject E)
];

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
  isGenerating,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'cross' | 'explicit' | 'inferred' | 'high_confidence'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    try {
      const pngData = cyRef.current.png({
        full: true,
        scale: 2,
        bg: '#0c121e',
      });
      const link = document.createElement('a');
      link.href = pngData;
      const titleSlug = graph?.title ? graph.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'conceptflow';
      link.download = `${titleSlug}-knowledge-graph.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export high-res PNG:', err);
    }
  };

  const handleExportJSON = () => {
    if (!graph) return;
    try {
      const jsonStr = JSON.stringify(graph, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const titleSlug = graph?.title ? graph.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'conceptflow';
      link.download = `${titleSlug}-knowledge-graph.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export graph JSON:', err);
    }
  };

  // Derive unique subjects and color mappings
  const subjectList = React.useMemo(() => {
    if (!graph) return [];
    return Array.from(new Set(graph.nodes.map((n) => n.subject).filter(Boolean)));
  }, [graph]);

  const subjectColorMap = React.useMemo(() => {
    const map: Record<string, typeof SUBJECT_PALETTES[0]> = {};
    subjectList.forEach((sub, idx) => {
      map[sub] = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length];
    });
    return map;
  }, [subjectList]);

  // Derived visible counts for real-time status pill
  const matchingNodesCount = React.useMemo(() => {
    if (!graph) return 0;
    if (!searchQuery.trim()) return graph.nodes.length;
    const q = searchQuery.toLowerCase().trim();
    return graph.nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        (n.formulas && n.formulas.some((f) => f.toLowerCase().includes(q))) ||
        (n.prerequisites && n.prerequisites.some((p) => p.toLowerCase().includes(q)))
    ).length;
  }, [graph, searchQuery]);

  const visibleCrossCount = React.useMemo(() => {
    if (!graph) return 0;
    return graph.relationships.filter(
      (r) =>
        r.scope === 'cross-disciplinary' &&
        (filterMode !== 'high_confidence' || r.confidence >= 0.85) &&
        (filterMode !== 'explicit' || r.evidence_type === 'explicit') &&
        (filterMode !== 'inferred' || r.evidence_type === 'inferred')
    ).length;
  }, [graph, filterMode]);

  // Initialize and mount Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graph || graph.nodes.length === 0) {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      return;
    }

    // Build Cytoscape elements
    const elements: cytoscape.ElementDefinition[] = [];

    // Add nodes
    graph.nodes.forEach((node) => {
      const palette = subjectColorMap[node.subject] || SUBJECT_PALETTES[0];
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.name,
          subject: node.subject,
          chapter: node.chapter,
          type: node.type,
          importance: node.importance,
          bgColor: palette.bg,
          borderColor: palette.border,
          textColor: palette.text,
          glowColor: palette.glow,
          rawNode: node,
        },
      });
    });

    // Add edges
    graph.relationships.forEach((rel) => {
      elements.push({
        group: 'edges',
        data: {
          id: rel.id,
          source: rel.source,
          target: rel.target,
          label: rel.label,
          scope: rel.scope,
          evidence_type: rel.evidence_type,
          confidence: rel.confidence,
          rawEdge: rel,
        },
      });
    });

    // Destroy prior instance if present
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Mount Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      wheelSensitivity: 0.25,
      style: [
        // Base Node Style
        {
          selector: 'node',
          style: {
            'shape': 'round-rectangle',
            'background-color': 'data(bgColor)',
            'border-color': 'data(borderColor)',
            'border-width': 2,
            'color': 'data(textColor)',
            'label': 'data(label)',
            'font-family': 'Inter, system-ui, -apple-system, sans-serif',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'padding': '10px',
            'width': 'label',
            'height': 'label',
            'min-width': '90px',
            'min-height': '36px',
            'transition-property': 'background-color, border-color, border-width, opacity, shadow-blur',
            'transition-duration': 0.2,
          } as any,
        },

        // Base Intra-disciplinary Edges (Gray / Subdued)
        {
          selector: 'edge[scope = "intra-disciplinary"]',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#6b7280',
            'line-color': '#4b5563',
            'width': 2,
            'label': 'data(label)',
            'font-size': '8.5px',
            'color': '#9ca3af',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.85,
            'text-background-color': '#111827',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'arrow-scale': 1.0,
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': 0.2,
          } as any,
        },

        // Explicit Edges: Solid Line
        {
          selector: 'edge[evidence_type = "explicit"][scope = "intra-disciplinary"]',
          style: {
            'line-style': 'solid',
          },
        },

        // Inferred Intra Edges: Dashed Line
        {
          selector: 'edge[evidence_type = "inferred"][scope = "intra-disciplinary"]',
          style: {
            'line-style': 'dashed',
            'line-dash-pattern': [5, 4],
          } as any,
        },

        // CROSS-DISCIPLINARY BRIDGES (The Surprise Challenge Hero!)
        {
          selector: 'edge[scope = "cross-disciplinary"]',
          style: {
            'curve-style': 'bezier',
            'line-style': 'dashed',
            'line-dash-pattern': [7, 4],
            'line-color': '#c084fc',
            'target-arrow-color': '#c084fc',
            'target-arrow-shape': 'triangle',
            'width': 3.5,
            'arrow-scale': 1.25,
            'label': 'data(label)',
            'color': '#f3e8ff',
            'font-size': '9.5px',
            'font-weight': 700,
            'text-rotation': 'autorotate',
            'text-background-color': '#3b0764',
            'text-background-opacity': 0.95,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#a855f7',
            'text-border-width': 1.5,
            'text-border-opacity': 0.9,
            'shadow-blur': 12,
            'shadow-color': 'rgba(192, 132, 252, 0.5)',
            'shadow-opacity': 0.8,
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': 0.2,
          } as any,
        },

        // Selected / Active Node State
        {
          selector: 'node.selected, node:selected',
          style: {
            'border-width': 3.5,
            'border-color': '#ffffff',
            'shadow-blur': 22,
            'shadow-color': 'data(glowColor)',
            'shadow-opacity': 1,
          } as any,
        },

        // Selected / Active Edge State
        {
          selector: 'edge.selected, edge:selected',
          style: {
            'line-color': '#ec4899',
            'target-arrow-color': '#ec4899',
            'width': 4.5,
            'text-background-color': '#831843',
            'text-border-color': '#f472b6',
            'text-border-width': 2,
            'shadow-blur': 16,
            'shadow-color': 'rgba(236, 72, 153, 0.8)',
            'shadow-opacity': 1,
          } as any,
        },

        // Neighbor Highlighting
        {
          selector: '.highlighted',
          style: {
            'opacity': 1.0,
            'z-index': 999,
          },
        },

        // Dimmed Elements when something is selected
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.18,
          },
        },

        // Search Highlight Match
        {
          selector: 'node.search-match',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'shadow-blur': 22,
            'shadow-color': 'rgba(56, 189, 248, 0.9)',
            'shadow-opacity': 1,
            'opacity': 1.0,
            'z-index': 998,
          } as any,
        },

        // Search Dimmed Non-Matches
        {
          selector: '.search-dimmed',
          style: {
            'opacity': 0.15,
          },
        },

        // Hidden by filter
        {
          selector: '.filtered-out',
          style: {
            'display': 'none',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        idealEdgeLength: (edge: any) => edge.data('scope') === 'cross-disciplinary' ? 160 : 90,
        nodeOverlap: 25,
        refresh: 20,
        fit: true,
        padding: 50,
        randomize: false,
        componentSpacing: 90,
        nodeRepulsion: () => 800000,
        edgeElasticity: (edge: any) => edge.data('scope') === 'cross-disciplinary' ? 35 : 100,
        gravity: 0.2,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      } as any,
    });

    // Tap Node Event Handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const rawNode: ConceptNode = node.data('rawNode');
      onSelectNode(rawNode);
      onSelectEdge(null);

      // Highlight neighbourhood
      cy.batch(() => {
        cy.elements().removeClass('selected highlighted dimmed');
        node.addClass('selected');
        const connectedEdges = node.connectedEdges();
        const neighbors = connectedEdges.connectedNodes();
        connectedEdges.addClass('highlighted');
        neighbors.addClass('highlighted');
        cy.elements().not(node).not(connectedEdges).not(neighbors).addClass('dimmed');
      });
    });

    // Tap Edge Event Handler
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const rawEdge: RelationshipEdge = edge.data('rawEdge');
      onSelectEdge(rawEdge);
      onSelectNode(null);

      // Highlight edge and connecting endpoints
      cy.batch(() => {
        cy.elements().removeClass('selected highlighted dimmed');
        edge.addClass('selected');
        const sourceNode = edge.source();
        const targetNode = edge.target();
        sourceNode.addClass('highlighted');
        targetNode.addClass('highlighted');
        cy.elements().not(edge).not(sourceNode).not(targetNode).addClass('dimmed');
      });
    });

    // Tap Canvas Background to clear selection
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onSelectNode(null);
        onSelectEdge(null);
        cy.batch(() => {
          cy.elements().removeClass('selected highlighted dimmed');
        });
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph, subjectColorMap, onSelectNode, onSelectEdge]);

  // Synchronize external selection (e.g. from demo load or sidebar click) with cytoscape visual state
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass('selected highlighted dimmed');

      if (selectedNode) {
        const nodeEl = cy.getElementById(selectedNode.id);
        if (nodeEl.length > 0) {
          nodeEl.addClass('selected');
          const connectedEdges = nodeEl.connectedEdges();
          const neighbors = connectedEdges.connectedNodes();
          connectedEdges.addClass('highlighted');
          neighbors.addClass('highlighted');
          cy.elements().not(nodeEl).not(connectedEdges).not(neighbors).addClass('dimmed');
        }
      } else if (selectedEdge) {
        const edgeEl = cy.getElementById(selectedEdge.id);
        if (edgeEl.length > 0) {
          edgeEl.addClass('selected');
          const src = edgeEl.source();
          const tgt = edgeEl.target();
          src.addClass('highlighted');
          tgt.addClass('highlighted');
          cy.elements().not(edgeEl).not(src).not(tgt).addClass('dimmed');
        }
      }
    });
  }, [selectedNode, selectedEdge]);

  // Smooth Camera Centering when selectedNode changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !selectedNode) return;
    const nodeEl = cy.getElementById(selectedNode.id);
    if (nodeEl.length > 0) {
      cy.animate({
        center: { eles: nodeEl },
        duration: 400,
      });
    }
  }, [selectedNode]);

  // Apply Real-Time Search Query Matching
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !graph) return;

    const q = searchQuery.trim().toLowerCase();
    cy.batch(() => {
      if (!q) {
        cy.elements().removeClass('search-match search-dimmed');
        return;
      }

      cy.nodes().each((node) => {
        const raw: ConceptNode = node.data('rawNode');
        const matches =
          raw.name.toLowerCase().includes(q) ||
          raw.description.toLowerCase().includes(q) ||
          raw.subject.toLowerCase().includes(q) ||
          (raw.formulas && raw.formulas.some((f) => f.toLowerCase().includes(q))) ||
          (raw.prerequisites && raw.prerequisites.some((p) => p.toLowerCase().includes(q)));

        if (matches) {
          node.addClass('search-match').removeClass('search-dimmed');
        } else {
          node.addClass('search-dimmed').removeClass('search-match');
        }
      });

      // Dim edges unless both endpoints match search
      cy.edges().each((edge) => {
        const src = edge.source();
        const tgt = edge.target();
        if (src.hasClass('search-match') && tgt.hasClass('search-match')) {
          edge.removeClass('search-dimmed');
        } else {
          edge.addClass('search-dimmed');
        }
      });
    });
  }, [searchQuery, graph]);

  // Apply Filter Mode (All, Cross-Disciplinary, Explicit, Inferred, High Confidence)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.edges().removeClass('filtered-out');
      if (filterMode === 'cross') {
        cy.edges('[scope != "cross-disciplinary"]').addClass('filtered-out');
      } else if (filterMode === 'explicit') {
        cy.edges('[evidence_type != "explicit"]').addClass('filtered-out');
      } else if (filterMode === 'inferred') {
        cy.edges('[evidence_type != "inferred"]').addClass('filtered-out');
      } else if (filterMode === 'high_confidence') {
        cy.edges().each((edge) => {
          const conf = edge.data('confidence') || 0;
          if (conf < 0.85) {
            edge.addClass('filtered-out');
          }
        });
      }
    });
  }, [filterMode]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '540px',
        backgroundColor: '#0c121e',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Canvas Top Bar / Dynamic Subject Legend */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          pointerEvents: 'none',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '6px 12px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
            backdropFilter: 'blur(12px)',
          }}
        >
          {subjectList.length > 0 ? (
            subjectList.map((sub) => {
              const pal = subjectColorMap[sub] || SUBJECT_PALETTES[0];
              return (
                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: pal.border,
                      boxShadow: `0 0 8px ${pal.glow}`,
                    }}
                  />
                  <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{sub}</span>
                </div>
              );
            })
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Subject A</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Subject B</span>
              </div>
            </>
          )}

          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: '#9ca3af' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Intra-Chapter</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '2px', borderTop: '2px dashed #c084fc' }}></span>
            <span style={{ color: '#c084fc', fontWeight: '700' }}>Cross-Disciplinary Bridge</span>
          </div>
        </div>
      </div>

      {/* Floating Search & Filter Toolbar (Top Right) */}
      {graph && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {/* Live Search Input */}
          <div
            className="glass-panel"
            style={{
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Search size={13} color="#9ca3af" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or formulas..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f3f4f6',
                fontSize: '0.74rem',
                width: '160px',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div
            className="glass-panel"
            style={{
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Filter size={12} color="#a5b4fc" style={{ marginLeft: '4px' }} />
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'all' ? '#6366f1' : 'transparent',
                color: filterMode === 'all' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: filterMode === 'all' ? '600' : 'normal',
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('cross')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'cross' ? '#a855f7' : 'transparent',
                color: filterMode === 'cross' ? '#fff' : '#c084fc',
                cursor: 'pointer',
                fontWeight: filterMode === 'cross' ? '700' : 'normal',
              }}
            >
              Cross-Subject Only
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('explicit')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'explicit' ? '#374151' : 'transparent',
                color: filterMode === 'explicit' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Explicit
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('inferred')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'inferred' ? '#374151' : 'transparent',
                color: filterMode === 'inferred' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Inferred
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('high_confidence')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: filterMode === 'high_confidence' ? '#10b981' : 'transparent',
                color: filterMode === 'high_confidence' ? '#fff' : '#34d399',
                cursor: 'pointer',
                fontWeight: filterMode === 'high_confidence' ? '700' : 'normal',
              }}
            >
              Conf &ge; 85%
            </button>
          </div>

          {/* Live Status Count Pill */}
          <div
            className="glass-panel"
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              color: '#c7d2fe',
              fontWeight: '500',
              backdropFilter: 'blur(12px)',
            }}
          >
            {matchingNodesCount}/{graph.nodes.length} concepts • {visibleCrossCount} cross-bridges
          </div>
        </div>
      )}

      {/* Judge Pitch Presentation Mode Overlay */}
      {isPresentationMode && graph && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            width: '92%',
            maxWidth: '740px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(192, 132, 252, 0.5)',
            boxShadow: '0 12px 36px rgba(168, 85, 247, 0.28)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c084fc', boxShadow: '0 0 10px #c084fc' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f3e8ff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                🏆 Judge Pitch Mode • Cross-Disciplinary Differentiators
              </span>
            </div>
            <button
              onClick={() => setIsPresentationMode(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Exit Presentation Mode"
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#818cf8', marginBottom: '4px' }}>1. Dual Input Synthesis</div>
              <p style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                Simultaneously ingests disparate textbook domains without pre-linked silo boundaries.
              </p>
            </div>
            <div style={{ backgroundColor: 'rgba(192, 132, 252, 0.14)', border: '1px solid rgba(192, 132, 252, 0.4)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c084fc', marginBottom: '4px' }}>2. Inferred Cross-Bridges</div>
              <p style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                Discovers unstated analogical & computational links across subjects (dashed purple lines).
              </p>
            </div>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>3. Evidence Attribution</div>
              <p style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                Verifiable textbook quotes, confidence metrics, and cross-domain practice challenges.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => {
                setFilterMode('cross');
                const crossEdge = graph.relationships.find((r) => r.scope === 'cross-disciplinary');
                if (crossEdge) onSelectEdge(crossEdge);
              }}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 14px rgba(192, 132, 252, 0.35)',
              }}
            >
              <Sparkles size={13} />
              <span>Highlight Cross-Subject Bridges</span>
            </button>
          </div>
        </div>
      )}

      {/* Canvas Navigation Toolbar (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {graph && (
          <div
            className="glass-panel"
            style={{
              padding: '4px',
              display: 'flex',
              gap: '4px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Judge Pitch Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              title="Toggle Judge Pitch Presentation Mode"
              style={{
                background: isPresentationMode ? 'rgba(192, 132, 252, 0.25)' : 'transparent',
                border: isPresentationMode ? '1px solid #c084fc' : 'none',
                color: isPresentationMode ? '#c084fc' : 'var(--text-secondary)',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Presentation size={15} />
              <span>Pitch Mode</span>
            </button>

            <div style={{ width: '1px', background: 'var(--border-color)', margin: '2px 2px' }} />

            {/* Export PNG */}
            <button
              type="button"
              onClick={handleExportPNG}
              title="Export High-Res PNG (Retina 2x)"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '5px 9px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
              }}
            >
              <Image size={15} />
              <span>PNG</span>
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportJSON}
              title="Export Knowledge Graph JSON"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '5px 9px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
              }}
            >
              <Download size={15} />
              <span>JSON</span>
            </button>
          </div>
        )}

        <div
          className="glass-panel"
          style={{
            padding: '4px',
            display: 'flex',
            gap: '4px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={handleZoomIn}
            className="btn-icon"
            title="Zoom In"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="btn-icon"
            title="Zoom Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="btn-icon"
            title="Fit to Screen"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Graph Display Area */}
      <div
        ref={containerRef}
        id="cy-container"
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isGenerating ? (
          /* Live Generation State */
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 28px rgba(168, 85, 247, 0.3)',
              }}
            >
              <Sparkles size={32} color="#c084fc" className="animate-spin" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
              Synthesizing Cross-Disciplinary Knowledge Graph...
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Extracting STEM concepts, validating intra-subject theorems, and computing cross-domain relational bridges across chapters.
            </p>
          </div>
        ) : !graph ? (
          /* Empty / Initial State */
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.2)',
              }}
            >
              <Network size={32} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Interactive Visual Knowledge Graph
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Enter two or more textbook chapters above and click <strong>"Generate Knowledge Graph"</strong> or <strong>"Load Demo Chapters"</strong> to visualize concepts and cross-disciplinary bridges.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

