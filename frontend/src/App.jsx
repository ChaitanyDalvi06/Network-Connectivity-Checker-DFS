import React, { useState, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Play, RotateCcw, Loader2, Minus, Plus, ListOrdered } from 'lucide-react';
import GraphCanvas from './GraphCanvas';
import ResultPanel from './ResultPanel';
import StepPanel from './StepPanel';
import { runDFS } from './api';

const MIN_PC = 2;
const MAX_PC = 12;

export default function App() {
  const canvasRef    = useRef(null);      // ref to GraphCanvas for reset()
  const intervalRef  = useRef(null);      // ref to active step-by-step interval
  const [pcCount, setPcCount]             = useState(6);
  const [edges, setEdges]                 = useState([]);
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);   // Run DFS spinner
  const [stepping, setStepping]           = useState(false);   // Step-by-Step spinner
  const [stepMode, setStepMode]           = useState(false);   // which mode last ran
  const [adjacencyList, setAdjacencyList] = useState({});
  const [highlightedNodes, setHighlightedNodes] = useState([]);

  // ── Build adjacency list locally for live display ─────────────────────────
  const buildAdjList = useCallback((edgePairs, count) => {
    const adj = {};
    for (let i = 1; i <= count; i++) adj[i] = [];
    for (const [u, v] of edgePairs) {
      adj[u]?.push(v);
      adj[v]?.push(u);
    }
    for (const k in adj) adj[k].sort((a, b) => a - b);
    return adj;
  }, []);

  // ── Sync edges from GraphCanvas ───────────────────────────────────────────
  const handleGraphChange = useCallback((edgePairs) => {
    setEdges(edgePairs);
    setAdjacencyList(buildAdjList(edgePairs, pcCount));
    setResult(null);
    setHighlightedNodes([]);
  }, [buildAdjList, pcCount]);

  // ── Change PC count ───────────────────────────────────────────────────────
  const changePcCount = (delta) => {
    const next = Math.min(MAX_PC, Math.max(MIN_PC, pcCount + delta));
    setPcCount(next);
    setResult(null);
    setHighlightedNodes([]);
    // edges filtered inside GraphCanvas via useEffect
  };

  // ── Shared: stop any running interval ────────────────────────────────────
  const stopAnimation = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  // ── Shared: call backend and return result (or null on error) ────────────
  const fetchDFS = async () => {
    if (edges.length === 0) {
      toast.error('Connect at least one computer first.');
      return null;
    }
    try {
      return await runDFS(pcCount, edges);
    } catch {
      toast.error('Cannot reach backend — is the Java server running on port 8090?');
      return null;
    }
  };

  // ── Run DFS — INSTANT (all visited nodes highlighted at once) ─────────────
  const handleRunDFS = async () => {
    stopAnimation();
    setLoading(true);
    setStepMode(false);
    setResult(null);
    setHighlightedNodes([]);
    const data = await fetchDFS();
    if (data) {
      setResult(data);
      setHighlightedNodes(data.visitedOrder);   // instant — no interval
      toast.success('DFS complete!');
      data.connected
        ? toast.success('Network is fully connected', { icon: '🟢' })
        : toast.error('Network is disconnected',      { icon: '🔴' });
    }
    setLoading(false);
  };

  // ── Show Step by Step — SLOW (1 200 ms per node, panel syncs live) ────────
  const handleStepByStep = async () => {
    stopAnimation();
    setStepping(true);
    setStepMode(true);
    setResult(null);
    setHighlightedNodes([]);
    const data = await fetchDFS();
    if (data) {
      setResult(data);
      toast.success('Step-by-step started — watch the panel on the right!');
      let step = 0;
      intervalRef.current = setInterval(() => {
        step++;
        setHighlightedNodes(data.visitedOrder.slice(0, step));
        if (step >= data.visitedOrder.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStepping(false);
          data.connected
            ? toast.success('Network is fully connected', { icon: '🟢' })
            : toast.error('Network is disconnected',      { icon: '🔴' });
        }
      }, 1200);
    } else {
      setStepping(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    stopAnimation();
    setStepping(false);
    setStepMode(false);
    canvasRef.current?.reset();
    setEdges([]);
    setResult(null);
    setAdjacencyList({});
    setHighlightedNodes([]);
  };

  const hasResults = result || Object.keys(adjacencyList).length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: 13,
            background: '#fff',
            border: '1px solid #e8e6db',
            color: '#2e3a30',
          },
        }}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        background: '#fff',
        borderBottom: '1.5px solid #e0ddd3',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo — globe with two connected monitors (SVG, always crisp) */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <NetworkLogo />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#2e3a30', letterSpacing: -0.3, margin: 0 }}>
              Network Connectivity Checker
            </h1>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginTop: 1 }}>
              Depth First Search (DFS) · Graph Algorithm Visualizer
            </p>
          </div>
        </div>

        {/* PC count stepper in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Computers</span>
          <div className="pc-stepper">
            <button onClick={() => changePcCount(-1)} disabled={pcCount <= MIN_PC}>−</button>
            <span>{pcCount}</span>
            <button onClick={() => changePcCount(+1)} disabled={pcCount >= MAX_PC}>+</button>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          background: '#fff',
          borderRadius: 14,
          padding: '13px 18px',
          border: '1.5px solid #e0ddd3',
          flexWrap: 'wrap',
        }}>
          <p style={{ flex: 1, fontSize: 13, color: 'var(--muted)', margin: 0, minWidth: 160 }}>
            <strong style={{ color: 'var(--ink)' }}>Tip:</strong> Drag from a pink dot on any PC to another PC to connect them.
          </p>

          {/* Run DFS — instant result */}
          <button
            className="btn-primary"
            onClick={handleRunDFS}
            disabled={loading || stepping}
            title="Show the final DFS result instantly"
          >
            {loading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
              : <><Play size={14} /> Run DFS</>}
          </button>

          {/* Show Step by Step — slow, panel syncs */}
          <button
            className="btn-step"
            onClick={handleStepByStep}
            disabled={loading || stepping}
            title="Animate DFS one node at a time (1.2 s per step)"
          >
            {stepping
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Stepping…</>
              : <><ListOrdered size={14} /> Step by Step</>}
          </button>

          {/* Reset */}
          <button className="btn-ghost" onClick={handleReset} disabled={loading || stepping}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>


        {/* Graph Canvas + Step Panel — side by side */}
        <section>
          <Label>Graph Canvas — {pcCount} computers</Label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Canvas column */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <GraphCanvas
                ref={canvasRef}
                pcCount={pcCount}
                highlightedNodes={highlightedNodes}
                onGraphChange={handleGraphChange}
              />
              {/* Legend */}
              <div style={{ display: 'flex', gap: 18, marginTop: 10, paddingLeft: 4, flexWrap: 'wrap' }}>
                {[
                  { color: '#8CBFAB', label: 'Default' },
                  { color: '#C0E1D2', label: 'Visited', fill: true },
                  { color: '#DC9B9B', label: 'Current (active)' },
                  { color: '#d1d5db', label: 'Unvisited' },
                ].map(({ color, label, fill }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 13, height: 13, borderRadius: '50%',
                      border: `2px solid ${color}`,
                      background: fill ? color : 'transparent',
                    }} />
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-step panel — right side */}
            <StepPanel
              result={result}
              adjacencyList={adjacencyList}
              highlightedNodes={highlightedNodes}
              pcCount={pcCount}
            />
          </div>
        </section>

        {/* Results */}
        <section>
          <Label>Results</Label>
          {hasResults ? (
            <ResultPanel
              result={result}
              adjacencyList={adjacencyList}
              pcCount={pcCount}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
              padding: '36px 0',
              background: '#fff',
              borderRadius: 16,
              border: '1.5px dashed #d6e8df',
            }}>
              Connect some computers, then click <strong style={{ color: 'var(--ink)' }}>Run DFS</strong> to see the result.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10.5,
      fontWeight: 800,
      color: 'var(--muted)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

/* ─── Logo SVG — globe with two connected monitors ───────────────────────── */
function NetworkLogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Globe ── */}
      {/* Outer circle */}
      <circle cx="24" cy="22" r="18" fill="#2e3a30" />

      {/* Latitude lines */}
      <ellipse cx="24" cy="22" rx="18" ry="7"  stroke="#C0E1D2" strokeWidth="1.4" fill="none" />
      <line x1="6"  y1="22" x2="42" y2="22" stroke="#C0E1D2" strokeWidth="1.4" />
      <line x1="7"  y1="13" x2="41" y2="13" stroke="#C0E1D2" strokeWidth="1.0" />
      <line x1="7"  y1="31" x2="41" y2="31" stroke="#C0E1D2" strokeWidth="1.0" />

      {/* Longitude lines */}
      <ellipse cx="24" cy="22" rx="9"  ry="18" stroke="#C0E1D2" strokeWidth="1.4" fill="none" />
      <line x1="24" y1="4"  x2="24" y2="40" stroke="#C0E1D2" strokeWidth="1.4" />

      {/* ── Connection line from globe to monitors ── */}
      {/* Horizontal arm from globe bottom-right to monitor junction */}
      <line x1="38" y1="30" x2="48" y2="30" stroke="#2e3a30" strokeWidth="2.5" strokeLinecap="round" />
      {/* Vertical split */}
      <line x1="48" y1="22" x2="48" y2="38" stroke="#2e3a30" strokeWidth="2.5" strokeLinecap="round" />

      {/* ── Monitor 1 (top-right) ── */}
      <rect x="49" y="17" width="12" height="9" rx="1.5" fill="#2e3a30" />
      <line x1="55" y1="26" x2="55" y2="29" stroke="#2e3a30" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="29" x2="58" y2="29" stroke="#2e3a30" strokeWidth="2" strokeLinecap="round" />

      {/* ── Monitor 2 (bottom-right) ── */}
      <rect x="49" y="33" width="12" height="9" rx="1.5" fill="#2e3a30" />
      <line x1="55" y1="42" x2="55" y2="45" stroke="#2e3a30" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="45" x2="58" y2="45" stroke="#2e3a30" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

