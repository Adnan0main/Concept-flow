import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  AlignLeft,
  Loader2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { extractDocumentFile } from '../services/api';
import type { DocumentInput } from '../types/graph';

interface DocumentUploadCardProps {
  index: number;
  doc: DocumentInput;
  canRemove: boolean;
  onUpdate: (updated: DocumentInput) => void;
  onRemove: () => void;
}

const SUBJECT_COLORS = [
  { border: 'rgba(99, 102, 241, 0.4)', badge: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', label: 'Subject A' },
  { border: 'rgba(16, 185, 129, 0.4)', badge: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: 'Subject B' },
  { border: 'rgba(245, 158, 11, 0.4)', badge: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Subject C' },
  { border: 'rgba(236, 72, 153, 0.4)', badge: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', label: 'Subject D' },
  { border: 'rgba(6, 182, 212, 0.4)', badge: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', label: 'Subject E' },
];

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  index,
  doc,
  canRemove,
  onUpdate,
  onRemove,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<string | null>(null);

  const theme = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  const charCount = doc.text.length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Call backend PDF/Document extraction service
      const res = await extractDocumentFile(file);
      setPageInfo(`${res.page_count} page(s), ${res.word_count.toLocaleString()} words`);
      
      // Auto-populate subject / chapter if empty based on filename
      const inferredChapter = doc.chapter.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      
      onUpdate({
        ...doc,
        filename: file.name,
        chapter: inferredChapter,
        text: res.text,
      });
    } catch (err: any) {
      console.error('File extraction error:', err);
      setUploadError(err.message || 'Failed to extract text from document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        borderLeft: `4px solid ${theme.text}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: theme.badge,
              color: theme.text,
              fontSize: '0.75rem',
              fontWeight: '700',
            }}
          >
            Chapter {String.fromCharCode(65 + index)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            STEM Source #{index + 1}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(31, 41, 55, 0.6)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setInputMode('text')}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                background: inputMode === 'text' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                color: inputMode === 'text' ? '#fff' : 'var(--text-muted)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlignLeft size={12} />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('file')}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                background: inputMode === 'file' ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                color: inputMode === 'file' ? '#fff' : 'var(--text-muted)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Upload size={12} />
              <span>PDF / File</span>
            </button>
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f43f5e',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
              }}
              title="Remove Chapter"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Metadata Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Subject / Discipline
          </label>
          <input
            type="text"
            value={doc.subject}
            onChange={(e) => onUpdate({ ...doc, subject: e.target.value })}
            placeholder="e.g. Linear Algebra"
            className="input-field"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Chapter Title
          </label>
          <input
            type="text"
            value={doc.chapter}
            onChange={(e) => onUpdate({ ...doc, chapter: e.target.value })}
            placeholder="e.g. Matrix Transformations"
            className="input-field"
          />
        </div>
      </div>

      {/* Content Input Body */}
      {inputMode === 'text' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Chapter Textbook Content (Text / Notes)
            </label>
            <span style={{ fontSize: '0.7rem', color: charCount > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {charCount.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={doc.text}
            onChange={(e) => onUpdate({ ...doc, text: e.target.value })}
            placeholder="Paste textbook chapter text, key definitions, or excerpt here..."
            rows={5}
            className="textarea-field"
          />
        </div>
      ) : (
        <div>
          <div
            style={{
              border: doc.filename ? '1px solid rgba(16, 185, 129, 0.4)' : '2px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: doc.filename ? 'rgba(16, 185, 129, 0.05)' : 'rgba(17, 24, 39, 0.4)',
              cursor: isUploading ? 'wait' : 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".txt,.pdf,.md"
              disabled={isUploading}
              onChange={handleFileChange}
              style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                cursor: isUploading ? 'wait' : 'pointer',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {isUploading ? (
                <>
                  <Loader2 size={24} color="#818cf8" className="animate-spin" />
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#a5b4fc' }}>
                    Parsing Document with Backend Engine...
                  </div>
                </>
              ) : doc.filename ? (
                <>
                  <FileCheck size={26} color="#34d399" />
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f3f4f6' }}>
                    {doc.filename}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                    ✓ Extracted {charCount.toLocaleString()} characters {pageInfo ? `(${pageInfo})` : ''}
                  </div>
                </>
              ) : (
                <>
                  <Upload size={24} color={theme.text} />
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    Click or Drag PDF/TXT here
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Extracts raw chapter text & structure via backend PDF parser
                  </p>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={14} />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
