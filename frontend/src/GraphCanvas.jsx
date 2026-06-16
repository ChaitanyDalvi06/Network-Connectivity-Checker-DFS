import React, { useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Handle,
  Position,
  ConnectionMode,   // <-- Loose mode: source handles also act as targets
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Monitor } from 'lucide-react';

/* ─── Status color map ────────────────────────────────────────────────────── */
const STATUS = {
  default:   { border: '#8CBFAB', bg: '#ffffff', icon: '#8CBFAB', glow: 'none' },
  visited:   { border: '#8CBFAB', bg: '#C0E1D2', icon: '#2e3a30', glow: '0 0 0 4px rgba(192,225,210,0.5)' },
  current:   { border: '#DC9B9B', bg: '#fff0f0', icon: '#DC9B9B', glow: '0 0 0 5px rgba(220,155,155,0.4)' },
  unvisited: { border: '#d1d5db', bg: '#f9f9f9', icon: '#d1d5db', glow: 'none' },
};

/* ─── Handle dot style ────────────────────────────────────────────────────── */
const DOT = {
  width: 14,
  height: 14,
  background: '#DC9B9B',
  border: '2px solid #fff',
  borderRadius: '50%',
  cursor: 'crosshair',
  zIndex: 100,
  transition: 'transform 0.15s, background 0.15s, box-shadow 0.15s',
};

/* ─── Custom Computer Node ────────────────────────────────────────────────── */
/*
 * FIX: Only SOURCE handles — no invisible target handles at all.
 *
 * Why this fixes the "connects to top only" bug:
 *   Previously we had 8 handles (4 source + 4 invisible target).
 *   React Flow scans target handles in DOM order to resolve where to connect.
 *   The first target handle in the DOM was always "ht-t" (top), so every drag
 *   landed there regardless of actual drag direction.
 *
 * With ConnectionMode.Loose (set on <ReactFlow>):
 *   Every SOURCE handle can also RECEIVE a connection.
 *   React Flow picks the GEOMETRICALLY NEAREST source handle on the target node
 *   — so if you drag toward the bottom of a node it connects to the bottom dot,
 *   drag toward the right and it connects to the right dot. ✓
 */
function ComputerNode({ data }) {
  const c = STATUS[data.status] || STATUS.default;

  return (
    <div style={{ position: 'relative', width: 72, height: 72 }}>

      {/* 4 source handles — one per side, unique IDs required by React Flow */}
      <Handle id="top"    type="source" position={Position.Top}    style={DOT} />
      <Handle id="right"  type="source" position={Position.Right}  style={DOT} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={DOT} />
      <Handle id="left"   type="source" position={Position.Left}   style={DOT} />

      {/* Visual circle — pointerEvents:none so handles stay clickable */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: c.bg,
        border: `2.5px solid ${c.border}`,
        boxShadow: c.glow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        transition: 'all 0.3s ease',
        pointerEvents: 'none',  // ReactFlow wrapper owns drag; handles own connection
        userSelect: 'none',
      }}>
        <Monitor size={20} color={c.icon} strokeWidth={1.8} />
        <span style={{ fontSize: 10, fontWeight: 800, color: '#2e3a30', letterSpacing: 0.3 }}>
          PC {data.label}
        </span>
      </div>
    </div>
  );
}

/* Defined outside component — prevents React Flow "new nodeTypes object" warning */
const nodeTypes = { computer: ComputerNode };

/* ─── Circular layout ─────────────────────────────────────────────────────── */
function buildInitialNodes(count) {
  const cx = 260, cy = 170, r = 135;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      id: String(i + 1),
      type: 'computer',
      position: {
        x: Math.round(cx + r * Math.cos(angle) - 36),
        y: Math.round(cy + r * Math.sin(angle) - 36),
      },
      data: { label: String(i + 1), status: 'default' },
    };
  });
}

/* ─── GraphCanvas ─────────────────────────────────────────────────────────── */
const GraphCanvas = forwardRef(function GraphCanvas(
  { pcCount, highlightedNodes, onGraphChange },
  ref
) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes(pcCount));
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /* Expose reset() to parent via ref */
  useImperativeHandle(ref, () => ({
    reset() {
      setEdges([]);
      setNodes(buildInitialNodes(pcCount));
      onGraphChange([]);
    },
  }), [pcCount, onGraphChange, setEdges, setNodes]);

  /* Rebuild nodes and prune stale edges when PC count changes */
  useEffect(() => {
    setNodes(buildInitialNodes(pcCount));
    setEdges(prev => {
      const valid = prev.filter(
        e => Number(e.source) <= pcCount && Number(e.target) <= pcCount
      );
      onGraphChange(valid.map(e => [Number(e.source), Number(e.target)]));
      return valid;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pcCount]);

  /* DFS animation: colour nodes step by step */
  useEffect(() => {
    if (!highlightedNodes || highlightedNodes.length === 0) {
      setNodes(ns => ns.map(n => ({ ...n, data: { ...n.data, status: 'default' } })));
      return;
    }
    setNodes(ns =>
      ns.map(n => {
        const nid = Number(n.id);
        const idx = highlightedNodes.indexOf(nid);
        if (idx === highlightedNodes.length - 1) return { ...n, data: { ...n.data, status: 'current'   } };
        if (idx !== -1)                           return { ...n, data: { ...n.data, status: 'visited'   } };
        return                                           { ...n, data: { ...n.data, status: 'unvisited' } };
      })
    );
  }, [highlightedNodes, setNodes]);

  /* Connect handler — block self-loops and duplicates */
  const onConnect = useCallback(params => {
    const { source, target } = params;
    if (!source || !target || source === target) return;

    // Treat (u→v) and (v→u) as the same undirected edge
    const isDuplicate = edges.some(
      e =>
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
    );
    if (isDuplicate) return;

    const newEdges = addEdge(
      {
        ...params,                  // keep sourceHandle + targetHandle (nearest dot)
        type: 'default',
        style: { stroke: '#8CBFAB', strokeWidth: 2.5 },
      },
      edges
    );
    setEdges(newEdges);
    onGraphChange(newEdges.map(e => [Number(e.source), Number(e.target)]));
  }, [edges, setEdges, onGraphChange]);

  /* Sync edge deletions (select edge → Delete key) to parent */
  const handleEdgesChange = useCallback(changes => {
    onEdgesChange(changes);
    setTimeout(() => {
      setEdges(cur => {
        onGraphChange(cur.map(e => [Number(e.source), Number(e.target)]));
        return cur;
      });
    }, 0);
  }, [onEdgesChange, setEdges, onGraphChange]);

  return (
    <div style={{
      width: '100%',
      height: 430,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1.5px solid #c8dfd5',
      background: '#F6F4E8',
    }}>
      <style>{`
        /* Handle hover glow — clear affordance for "drag from here" */
        .react-flow__handle:hover {
          background: #b85c5c !important;
          box-shadow: 0 0 0 6px rgba(220,155,155,0.35) !important;
          transform: scale(1.45) !important;
        }

        /* Remove React Flow's default node chrome */
        .react-flow__node {
          padding: 0 !important;
          border: none !important;
          background: none !important;
        }

        /* Remove edge arrow markers */
        .react-flow__arrowhead { display: none !important; }

        /* Highlight edge on hover */
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #DC9B9B !important;
          stroke-width: 3.5px !important;
        }

        /* Controls panel */
        .react-flow__controls {
          background: #fff !important;
          border: 1px solid #c8dfd5 !important;
          border-radius: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
        }
        .react-flow__controls-button {
          border-bottom: 1px solid #e8e6db !important;
          fill: #2e3a30 !important;
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}   /* ← KEY: nearest handle wins */
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        defaultEdgeOptions={{
          type: 'default',
          style: { stroke: '#8CBFAB', strokeWidth: 2.5 },
        }}
      >
        <Background color="#c8dfd5" gap={24} size={1} variant="dots" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
});

export default GraphCanvas;
