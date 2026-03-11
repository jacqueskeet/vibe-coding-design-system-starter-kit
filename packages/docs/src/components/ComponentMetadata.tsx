import React from 'react';

/**
 * ComponentMetadata — Renders structured `.meta.json` data as documentation blocks.
 *
 * Used automatically by the withComponentMetadata decorator when a story sets
 * `parameters.componentMetadata`. Can also be used directly in MDX docs.
 */

interface ComponentMetadataProps {
  metadata: Record<string, unknown>;
}

// ── Styles ────────────────────────────────────────────────────────────
// Inline styles to avoid dependency on the design system's own CSS in docs context.

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#1a1a2e',
    maxWidth: '800px',
  } as React.CSSProperties,
  section: {
    marginBottom: '24px',
    padding: '16px 20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#6c757d',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  purpose: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1a1a2e',
    marginBottom: '4px',
  } as React.CSSProperties,
  tagList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '8px',
  } as React.CSSProperties,
  tag: {
    display: 'inline-block',
    padding: '2px 10px',
    background: '#e9ecef',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#495057',
  } as React.CSSProperties,
  tagRequires: {
    background: '#d4edda',
    color: '#155724',
  } as React.CSSProperties,
  tagAllows: {
    background: '#cce5ff',
    color: '#004085',
  } as React.CSSProperties,
  tagForbids: {
    background: '#f8d7da',
    color: '#721c24',
  } as React.CSSProperties,
  variantCard: {
    padding: '12px 16px',
    marginBottom: '8px',
    background: '#fff',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
  } as React.CSSProperties,
  variantName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#1a1a2e',
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  } as React.CSSProperties,
  variantDetail: {
    fontSize: '13px',
    color: '#495057',
    margin: '4px 0 0',
  } as React.CSSProperties,
  label: {
    fontWeight: 600,
    color: '#6c757d',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  } as React.CSSProperties,
  link: {
    color: '#0366d6',
    textDecoration: 'none',
  } as React.CSSProperties,
  kbdTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
    marginTop: '8px',
  } as React.CSSProperties,
  kbdCell: {
    padding: '6px 12px',
    borderBottom: '1px solid #e9ecef',
    textAlign: 'left' as const,
  } as React.CSSProperties,
  kbd: {
    display: 'inline-block',
    padding: '2px 6px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '12px',
    boxShadow: '0 1px 0 rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  divider: {
    border: 'none',
    borderTop: '1px solid #e9ecef',
    margin: '24px 0',
  } as React.CSSProperties,
  heading: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 16px',
  } as React.CSSProperties,
};

// ── Sub-components ────────────────────────────────────────────────────

function TagList({ items, style }: { items: string[]; style?: React.CSSProperties }) {
  return (
    <div style={styles.tagList}>
      {items.map((item, i) => (
        <span key={i} style={{ ...styles.tag, ...style }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function LabeledTagList({ label, items, tagStyle }: { label: string; items: string[]; tagStyle?: React.CSSProperties }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: '8px' }}>
      <span style={styles.label}>{label}: </span>
      <TagList items={items} style={tagStyle} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function ComponentMetadata({ metadata }: ComponentMetadataProps) {
  const m = metadata as Record<string, any>;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Component Metadata</h3>

      {/* Intent */}
      {m.intent && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Intent & Purpose</div>
          {m.intent.purpose && <div style={styles.purpose}>{m.intent.purpose}</div>}
          {m.intent.task_context && (
            <LabeledTagList label="Task contexts" items={m.intent.task_context} />
          )}
          {m.intent.sentiment && (
            <LabeledTagList label="Sentiment" items={m.intent.sentiment} />
          )}
        </div>
      )}

      {/* Composition */}
      {m.composition && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Composition Rules</div>
          <LabeledTagList label="Requires" items={m.composition.requires} tagStyle={styles.tagRequires} />
          <LabeledTagList label="Allows" items={m.composition.allows} tagStyle={styles.tagAllows} />
          <LabeledTagList label="Forbids" items={m.composition.forbids} tagStyle={styles.tagForbids} />
        </div>
      )}

      {/* Variants */}
      {m.variants && Object.keys(m.variants).length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Variant Logic</div>
          {Object.entries(m.variants).map(([name, v]: [string, any]) => (
            <div key={name} style={styles.variantCard}>
              <div style={styles.variantName}>{name}</div>
              {v.use_when && (
                <p style={styles.variantDetail}>
                  <span style={styles.label}>Use when: </span>
                  {v.use_when}
                </p>
              )}
              {v.avoid_when && (
                <p style={styles.variantDetail}>
                  <span style={styles.label}>Avoid when: </span>
                  {v.avoid_when}
                </p>
              )}
              {v.pair_with && v.pair_with.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <span style={styles.label}>Pairs with: </span>
                  <TagList items={v.pair_with} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Context */}
      {m.context && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Context Signals</div>
          <LabeledTagList label="Density" items={m.context.density} />
          <LabeledTagList label="Modality" items={m.context.modality} />
          <LabeledTagList label="Mode" items={m.context.mode} />
        </div>
      )}

      {/* Relationships */}
      {m.relationships && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Relationships</div>
          <LabeledTagList label="Related" items={m.relationships.related} />
          <LabeledTagList label="Escalates to" items={m.relationships.escalates_to} />
          <LabeledTagList label="Degrades to" items={m.relationships.degrades_to} />
          <LabeledTagList label="Groups with" items={m.relationships.groups_with} />
        </div>
      )}

      {/* Observability */}
      {m.observability && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Observability</div>
          <LabeledTagList label="Track" items={m.observability.track} />
          <LabeledTagList label="Health" items={m.observability.health} />
        </div>
      )}

      {/* Accessibility */}
      {m.accessibility && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Accessibility</div>
          {m.accessibility.role && (
            <p style={styles.variantDetail}>
              <span style={styles.label}>Role: </span>
              <code style={styles.kbd}>{m.accessibility.role}</code>
            </p>
          )}
          {m.accessibility.wai_aria_pattern && (
            <p style={styles.variantDetail}>
              <span style={styles.label}>WAI-ARIA Pattern: </span>
              <a href={m.accessibility.wai_aria_pattern} style={styles.link} target="_blank" rel="noopener noreferrer">
                APG Reference
              </a>
            </p>
          )}
          {m.accessibility.keyboard && Object.keys(m.accessibility.keyboard).length > 0 && (
            <table style={styles.kbdTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.kbdCell, ...styles.label }}>Key</th>
                  <th style={{ ...styles.kbdCell, ...styles.label }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(m.accessibility.keyboard).map(([key, action]) => (
                  <tr key={key}>
                    <td style={styles.kbdCell}>
                      <kbd style={styles.kbd}>{key}</kbd>
                    </td>
                    <td style={styles.kbdCell}>{action as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {m.accessibility.announces && (
            <p style={{ ...styles.variantDetail, marginTop: '8px' }}>
              <span style={styles.label}>Announces: </span>
              {m.accessibility.announces}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ComponentMetadata;
