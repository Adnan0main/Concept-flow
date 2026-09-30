import React from 'react';
import { DocumentUploadCard } from './DocumentUploadCard';
import { 
  PlusCircle, 
  Sparkles, 
  Workflow, 
  ArrowRight,
  Zap
} from 'lucide-react';
import type { DocumentInput } from '../types/graph';

interface UploadSectionProps {
  documents: DocumentInput[];
  onAddDocument: () => void;
  onUpdateDocument: (index: number, doc: DocumentInput) => void;
  onRemoveDocument: (index: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onRemoveDocument,
  onGenerate,
  isGenerating,
}) => {
  const validDocCount = documents.filter((d) => d.text.trim().length > 0 && d.subject.trim().length > 0).length;
  const isReady = validDocCount >= 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px' }}>
            STEM Source Material Input
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Provide 1 chapter for intra-subject mapping, or 2+ chapters to discover cross-disciplinary bridges.
          </p>
        </div>

        {documents.length < 5 && (
          <button
            type="button"
            onClick={onAddDocument}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(31, 41, 55, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#a5b4fc',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={14} />
            <span>+ Add Chapter ({documents.length}/5)</span>
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: documents.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
        }}
      >
        {documents.map((doc, idx) => (
          <DocumentUploadCard
            key={doc.id || idx}
            index={idx}
            doc={doc}
            canRemove={documents.length > 1}
            onUpdate={(updated) => onUpdateDocument(idx, updated)}
            onRemove={() => onRemoveDocument(idx)}
          />
        ))}
      </div>

      {/* Action Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          border: isReady ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} color={isReady ? '#34d399' : '#9ca3af'} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              {validDocCount === 1
                ? '1 Chapter Ready (Single-Chapter Intra-Disciplinary Mode)'
                : validDocCount >= 2
                ? `${validDocCount} Chapters Ready (Multi-Discipline Cross-Inference Active)`
                : 'Enter at least 1 chapter with text & subject'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {validDocCount >= 2
                ? 'Cross-disciplinary reasoning will compare conceptual representations across disciplines.'
                : 'Will extract core concepts, definitions, formulas, and intra-chapter relationships.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!isReady || isGenerating}
          className="btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '0.95rem',
            background: isReady
              ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
              : 'rgba(55, 65, 81, 0.5)',
          }}
        >
          {isGenerating ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              <span>Analyzing & Building Graph...</span>
            </>
          ) : (
            <>
              <Workflow size={18} />
              <span>Generate Knowledge Graph</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
