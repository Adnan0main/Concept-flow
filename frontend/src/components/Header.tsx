import React from 'react';
import { 
  Network, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';
import type { HealthResponse, BackendStatus } from '../types/graph';

interface HeaderProps {
  health: HealthResponse | null;
  status: BackendStatus | null;
  selectedScenario: string;
  onSelectScenario: (scenarioKey: string) => void;
  onReset: () => void;
  hasGraph: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  status,
  selectedScenario,
  onSelectScenario,
  onReset,
  hasGraph,
}) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 14, 23, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Network size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#fff' }}>
              Concept<span style={{ color: '#818cf8' }}>Flow</span>
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontWeight: '700',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              HACKATHON MVP
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Cross-Disciplinary Visual Concept Discovery for STEM
          </p>
        </div>
      </div>

      {/* Action Controls & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Scenario Presets Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            id="scenario-select"
            value={selectedScenario}
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              color: '#f8fafc',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '250px',
            }}
            title="Choose a curated cross-disciplinary STEM benchmark scenario"
          >
            <option value="linear_algebra_nn">📐 Linear Algebra + Neural Networks</option>
            <option value="calculus_physics">🚀 Calculus + Classical Mechanics</option>
            <option value="graph_chemistry">🧪 Graph Theory + Organic Chemistry</option>
          </select>

          <button
            onClick={() => onSelectScenario(selectedScenario)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              whiteSpace: 'nowrap',
            }}
            title="Preload selected STEM chapters"
          >
            <Sparkles size={14} />
            <span>Load Preset</span>
          </button>
        </div>

        {hasGraph && (
          <button
            onClick={onReset}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}

        {/* Backend Connection Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status?.llm_configured && (
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
              AI: {status.active_provider}
            </span>
          )}
          <div
            className={`badge ${health?.ready ? 'badge-success' : 'badge-warning'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px' }}
          >
            {health?.ready ? (
              <>
                <CheckCircle2 size={13} />
                <span>Backend Ready</span>
              </>
            ) : (
              <>
                <XCircle size={13} />
                <span>Backend Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
