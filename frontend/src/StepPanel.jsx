import React, { useState, useEffect, useRef } from 'react';

/* ─── Generate human-readable DFS steps from backend result ──────────────── */
function generateDFSSteps(result) {
  if (!result) return [];
  const { visitedOrder, adjacencyList } = result;
  const steps = [];

  for (let i = 0; i < visitedOrder.length; i++) {
    const node       = visitedOrder[i];
    const neighbors  = adjacencyList[String(node)] || [];
    const visitedSoFar = new Set(visitedOrder.slice(0, i)); // visited BEFORE this step

    // Find parent: the most recently visited adjacent node (last call-stack entry)
    let parent = null;
    for (let j = i - 1; j >= 0; j--) {
      if (neighbors.includes(visitedOrder[j])) { parent = visitedOrder[j]; break; }
    }

    const unvisited = neighbors.filter(n => !visitedSoFar.has(n));
    const done      = neighbors.filter(n =>  visitedSoFar.has(n));

    steps.push({ stepNum: i + 1, node, parent, neighbors, unvisited, done, isStart: i === 0 });
  }
  return steps;
}

/* ─── Tiny badge ─────────────────────────────────────────────────────────── */
function Badge({ children, color = '#8CBFAB', bg = '#E5EEE4' }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color,
      border: `1px solid ${color}`,
      borderRadius: 5,
      fontSize: 10,
      fontWeight: 700,
      padding: '1px 6px',
      marginRight: 2,
      letterSpacing: 0.2,
    }}>
      {children}
    </span>
  );
}

/* ─── StepPanel ──────────────────────────────────────────────────────────── */
export default function StepPanel({ result, adjacencyList, highlightedNodes, pcCount, stepMode, stepping }) {
  const [activeTab, setActiveTab] = useState('dfs'); // 'dfs' | 'adj'
  const activeRef  = useRef(null);
  const scrollRef  = useRef(null);

  const dfsSteps   = generateDFSSteps(result);
  const currentIdx = highlightedNodes.length - 1; // index of the last animated node
  const totalSteps = result ? result.visitedOrder.length : 0;

  // Auto-scroll the active step into view during step-by-step mode
  useEffect(() => {
    if (stepMode && activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIdx, stepMode]);

  /* ── shared style tokens ─────────────────────────────────────────────── */
  const panel = {
    width: 300,
    minWidth: 280,
    height: 430,
    background: '#fff',
    border: '1.5px solid #e0ddd3',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  };

  const tabBar = {
    display: 'flex',
    borderBottom: '1.5px solid #e8e6db',
    background: '#faf9f4',
    flexShrink: 0,
  };

  const tab = (key) => ({
    flex: 1,
    padding: '10px 0',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    background: activeTab === key ? '#fff' : 'transparent',
    color: activeTab === key ? '#2e3a30' : '#7a8c7e',
    borderBottom: activeTab === key ? '2.5px solid #DC9B9B' : '2.5px solid transparent',
    transition: 'all 0.18s ease',
  });

  /* ── DFS Steps tab ───────────────────────────────────────────────────── */
  const DFSTab = () => {
    if (!result) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 10 }}>
          <div style={{ fontSize: 28 }}>🔍</div>
          <p style={{ fontSize: 12.5, color: '#7a8c7e', margin: 0, lineHeight: 1.6 }}>
            Connect computers on the canvas,<br />then click <strong style={{ color: '#2e3a30' }}>Run DFS</strong> to see the step-by-step trace.
          </p>
        </div>
      );
    }

    return (
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        {/* Summary banner */}
        <div style={{
          background: result.connected ? '#e8f5f0' : '#fdf0f0',
          border: `1px solid ${result.connected ? '#8CBFAB' : '#DC9B9B'}`,
          borderRadius: 8,
          padding: '7px 10px',
          fontSize: 11.5,
          fontWeight: 700,
          color: result.connected ? '#2e6b54' : '#a04040',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>{result.connected ? '🟢' : '🔴'}</span>
          {result.connected
            ? `All ${pcCount} PCs reachable from PC 1`
            : `${result.isolatedNodes?.length || 0} isolated PC(s) found`}
        </div>

        {dfsSteps.map((step, idx) => {
          const isDone    = idx < highlightedNodes.length;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={step.stepNum}
              ref={isCurrent ? activeRef : null}
              style={{
                borderRadius: 10,
                border: isCurrent
                  ? '2px solid #DC9B9B'
                  : isDone
                    ? '1.5px solid #C0E1D2'
                    : '1.5px solid #ece9e0',
                background: isCurrent ? '#fff8f8' : isDone ? '#f4fbf8' : '#faf9f4',
                padding: '8px 10px',
                transition: 'all 0.3s ease',
                opacity: !isDone && !isCurrent ? 0.55 : 1,
              }}
            >
              {/* Step header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: isCurrent ? '#DC9B9B' : isDone ? '#8CBFAB' : '#d6e0da',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {isDone && !isCurrent ? '✓' : step.stepNum}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: isCurrent ? '#DC9B9B' : '#2e3a30' }}>
                  {step.isStart ? `🚀 Start — PC ${step.node}` : `Visit PC ${step.node}`}
                </span>
                {isCurrent && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#DC9B9B', background: '#fce8e8', borderRadius: 4, padding: '1px 5px' }}>
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Step body */}
              <div style={{ fontSize: 11, color: '#4a5c4e', lineHeight: 1.7, paddingLeft: 26 }}>
                {step.isStart ? (
                  <span>DFS begins here. Call <code style={codeStyle}>dfs({step.node})</code></span>
                ) : (
                  <span>
                    Called from <code style={codeStyle}>dfs({step.parent})</code> →{' '}
                    <code style={codeStyle}>dfs({step.node})</code>
                  </span>
                )}
                <div style={{ marginTop: 3 }}>
                  <span style={{ color: '#7a8c7e' }}>Neighbors: </span>
                  {step.neighbors.length === 0
                    ? <span style={{ color: '#aaa' }}>none</span>
                    : step.neighbors.map(n => (
                        <Badge
                          key={n}
                          color={step.done.includes(n) ? '#8CBFAB' : '#2e3a30'}
                          bg={step.done.includes(n) ? '#E5EEE4' : '#f0f0f0'}
                        >
                          PC {n}{step.done.includes(n) ? ' ✓' : ''}
                        </Badge>
                      ))}
                </div>
                {step.unvisited.length > 0 && (
                  <div style={{ marginTop: 2, color: '#6a8870', fontSize: 10.5 }}>
                    ↳ Recurse into: {step.unvisited.map(n => `PC ${n}`).join(', ')}
                  </div>
                )}
                {step.unvisited.length === 0 && !step.isStart && (
                  <div style={{ marginTop: 2, color: '#a07070', fontSize: 10.5 }}>
                    ↳ All neighbors visited — backtrack
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Isolated nodes note */}
        {result.isolatedNodes?.length > 0 && (
          <div style={{
            marginTop: 4,
            padding: '7px 10px',
            background: '#fdf0f0',
            border: '1px solid #f0c0c0',
            borderRadius: 8,
            fontSize: 11,
            color: '#a05050',
          }}>
            ⚠️ Not reachable from PC 1:{' '}
            {result.isolatedNodes.map(n => `PC ${n}`).join(', ')}
          </div>
        )}
      </div>
    );
  };

  /* ── Adjacency List tab ───────────────────────────────────────────────── */
  const AdjTab = () => {
    const keys = Object.keys(adjacencyList).map(Number).sort((a, b) => a - b);

    if (keys.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 10 }}>
          <div style={{ fontSize: 28 }}>🔗</div>
          <p style={{ fontSize: 12.5, color: '#7a8c7e', margin: 0, lineHeight: 1.6 }}>
            Connect computers on the canvas<br />to see the adjacency list build live.
          </p>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* Header info */}
        <div style={{ fontSize: 11, color: '#7a8c7e', marginBottom: 6, lineHeight: 1.6 }}>
          <strong style={{ color: '#2e3a30' }}>Adjacency List</strong> — undirected graph.<br />
          Each PC lists its direct neighbors.
        </div>

        {/* Each row */}
        {keys.map(k => {
          const neighbors = adjacencyList[k] || [];
          const isVisited = result && result.visitedOrder?.includes(k) && highlightedNodes.includes(k);
          const isCurrent = highlightedNodes.length > 0 && highlightedNodes[highlightedNodes.length - 1] === k;

          return (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                background: isCurrent ? '#fff8f8' : isVisited ? '#f4fbf8' : '#faf9f4',
                border: isCurrent ? '1.5px solid #DC9B9B' : isVisited ? '1.5px solid #C0E1D2' : '1.5px solid #ece9e0',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Node label */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: isCurrent ? '#DC9B9B' : isVisited ? '#C0E1D2' : '#e8e6db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                color: isCurrent ? '#fff' : isVisited ? '#2e3a30' : '#7a8c7e',
              }}>
                {k}
              </div>

              {/* Arrow */}
              <span style={{ fontSize: 13, color: '#aaa', fontWeight: 700 }}>→</span>

              {/* Neighbors */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {neighbors.length === 0 ? (
                  <span style={{ fontSize: 11, color: '#bbb', fontStyle: 'italic' }}>isolated</span>
                ) : (
                  neighbors.map(n => {
                    const nVisited = result && highlightedNodes.includes(n);
                    return (
                      <Badge
                        key={n}
                        color={nVisited ? '#2e6b54' : '#4a5c4e'}
                        bg={nVisited ? '#C0E1D2' : '#e8ede9'}
                      >
                        PC {n}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Complexity footer */}
        {result && (
          <div style={{ marginTop: 8, padding: '6px 10px', background: '#F6F4E8', borderRadius: 8, fontSize: 10.5, color: '#7a8c7e', border: '1px solid #e8e6db' }}>
            <span style={{ fontWeight: 700, color: '#2e3a30' }}>Time: </span>{result.timeComplexity}&nbsp;&nbsp;
            <span style={{ fontWeight: 700, color: '#2e3a30' }}>Space: </span>{result.spaceComplexity}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={panel}>

      {/* Header — title + mode badge */}
      <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#7a8c7e', margin: 0 }}>
            Step-by-Step
          </p>

          {/* Mode badge */}
          {result && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 0.5,
              padding: '2px 7px',
              borderRadius: 6,
              background: stepMode ? '#E5EEE4' : '#fce8e8',
              color:       stepMode ? '#2e6b54' : '#a04040',
              border:      `1px solid ${stepMode ? '#8CBFAB' : '#DC9B9B'}`,
            }}>
              {stepMode ? '🐢 STEP MODE' : '⚡ INSTANT'}
            </span>
          )}
        </div>

        {/* Progress bar — only visible during slow step-by-step animation */}
        {stepMode && totalSteps > 0 && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#7a8c7e', marginBottom: 3 }}>
              <span>Progress</span>
              <span style={{ fontWeight: 700, color: '#2e3a30' }}>
                {highlightedNodes.length} / {totalSteps} nodes
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: '#eee', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(highlightedNodes.length / totalSteps) * 100}%`,
                background: stepping ? '#DC9B9B' : '#8CBFAB',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            {stepping && (
              <p style={{ fontSize: 9.5, color: '#DC9B9B', margin: '3px 0 0', fontWeight: 700 }}>
                ⏳ Animating… next step in 1.2 s
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={tabBar}>
        <button style={tab('dfs')} onClick={() => setActiveTab('dfs')}>DFS Trace</button>
        <button style={tab('adj')} onClick={() => setActiveTab('adj')}>Adj. List</button>
      </div>

      {/* Tab content */}
      {activeTab === 'dfs' ? <DFSTab /> : <AdjTab />}
    </div>
  );
}

/* ── Inline code style ──────────────────────────────────────────────────── */
const codeStyle = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 10.5,
  background: '#f0ede6',
  padding: '1px 4px',
  borderRadius: 4,
  color: '#2e3a30',
};
