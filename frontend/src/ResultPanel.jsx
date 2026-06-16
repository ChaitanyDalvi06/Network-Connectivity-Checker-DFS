import React from 'react';
import { CheckCircle2, XCircle, Monitor, GitBranch, Clock, Database } from 'lucide-react';

// ─── Reusable result card ────────────────────────────────────────────────────
function Card({ title, icon: Icon, accent, children }) {
  return (
    <div className="card fade-in" style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <span style={{
          background: accent || '#E5EEE4',
          borderRadius: 8,
          padding: '6px 7px',
          display: 'inline-flex',
        }}>
          <Icon size={15} color={accent ? '#fff' : '#8CBFAB'} strokeWidth={2.2} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 12.5, color: '#2e3a30', letterSpacing: 0.1 }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Pill chip ───────────────────────────────────────────────────────────────
function Chip({ children, color = 'sage' }) {
  const styles = {
    sage: { bg: '#E5EEE4', border: '#C0E1D2', text: '#2e3a30' },
    rose: { bg: '#fdf0f0', border: '#DC9B9B', text: '#9b3a3a' },
  };
  const s = styles[color];
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      borderRadius: 7,
      padding: '3px 11px',
      fontWeight: 700,
      fontSize: 13,
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

// ─── ResultPanel ─────────────────────────────────────────────────────────────
export default function ResultPanel({ result, adjacencyList, pcCount }) {
  const adjEntries = Object.entries(adjacencyList);
  const hasAdj = adjEntries.length > 0;

  if (!result && !hasAdj) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Live Adjacency List */}
      {hasAdj && (
        <div className="card fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <span style={{ background: '#E5EEE4', borderRadius: 8, padding: '6px 7px', display: 'inline-flex' }}>
              <GitBranch size={15} color="#8CBFAB" strokeWidth={2.2} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 12.5, color: '#2e3a30' }}>Adjacency List</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7a8c7e', background: '#E5EEE4', borderRadius: 6, padding: '2px 8px' }}>
              live
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '8px 16px',
          }}>
            {adjEntries.map(([node, neighbours]) => (
              <div key={node} style={{ fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 800, color: '#DC9B9B' }}>{node}</span>
                <span style={{ color: '#aaa' }}> → </span>
                <span style={{ color: '#2e3a30' }}>
                  {neighbours.length > 0 ? neighbours.join(', ') : <span style={{ color: '#ccc' }}>—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DFS results */}
      {result && (
        <>
          {/* Network Status Banner */}
          <div
            className="fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: result.connected ? '#E5EEE4' : '#fdf0f0',
              border: `1.5px solid ${result.connected ? '#C0E1D2' : '#DC9B9B'}`,
              borderRadius: 16,
              padding: '18px 24px',
            }}
          >
            {result.connected
              ? <CheckCircle2 size={34} color="#8CBFAB" strokeWidth={1.8} />
              : <XCircle     size={34} color="#DC9B9B" strokeWidth={1.8} />}
            <div>
              <div style={{
                fontWeight: 800, fontSize: 22,
                color: result.connected ? '#2e5c44' : '#9b3a3a',
                letterSpacing: -0.3,
              }}>
                {result.connected ? '✓ Network Connected' : '✗ Network Disconnected'}
              </div>
              <div style={{ fontSize: 12.5, color: '#7a8c7e', marginTop: 3 }}>
                {result.connected
                  ? 'All computers are reachable from PC 1 via DFS.'
                  : 'Some computers cannot be reached from PC 1.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {/* DFS Traversal */}
            <Card title="DFS Traversal Order" icon={GitBranch}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                {result.visitedOrder.map((node, i) => (
                  <React.Fragment key={node}>
                    <Chip color="sage">{node}</Chip>
                    {i < result.visitedOrder.length - 1 && (
                      <span style={{ color: '#C0E1D2', fontWeight: 800, fontSize: 16 }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Card>

            {/* Isolated Computers */}
            <Card title="Isolated Computers" icon={Monitor}>
              {result.isolatedNodes.length === 0 ? (
                <span style={{ fontSize: 13, color: '#8CBFAB', fontWeight: 600 }}>
                  None — all reachable ✓
                </span>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.isolatedNodes.map(n => <Chip key={n} color="rose">PC {n}</Chip>)}
                </div>
              )}
            </Card>
          </div>

          {/* Complexity */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Card title="Time Complexity" icon={Clock} accent="#8CBFAB">
              <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, color: '#2e5c44', marginTop: 4 }}>
                {result.timeComplexity}
              </div>
              <div style={{ fontSize: 11, color: '#7a8c7e', marginTop: 4 }}>
                Visit every vertex V and edge E once
              </div>
            </Card>
            <Card title="Space Complexity" icon={Database} accent="#DC9B9B">
              <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, color: '#9b3a3a', marginTop: 4 }}>
                {result.spaceComplexity}
              </div>
              <div style={{ fontSize: 11, color: '#7a8c7e', marginTop: 4 }}>
                Visited array + recursion call stack
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
