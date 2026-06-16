# Network Connectivity Checker

> An interactive DSA project demonstrating the **Depth First Search (DFS)** algorithm on graphs through a visual computer-network simulation.

---

## Overview

This project lets you visually build a computer network, run DFS on it, and instantly see:

- Whether the network is **Connected** or **Disconnected**
- The **DFS traversal order** animated step-by-step
- Which computers are **isolated** (unreachable from PC 1)
- The live **adjacency list**
- The algorithm's **Time and Space complexity**

---

## Features

- 6 draggable computer nodes rendered with React Flow
- Visual edge-drawing by pulling node handles (no manual typing)
- Duplicate edge and self-loop prevention
- Live adjacency list that updates as you connect nodes
- DFS traversal animation (500ms per node) with color coding:
  - 🟢 Green — visited
  - 🔵 Blue — currently active
  - ⚪ Gray — not yet visited
- Toast notifications for success / error states
- Responsive single-page layout

---

## Technologies

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 (Vite), Tailwind CSS v4    |
| Graph UI | React Flow                          |
| HTTP     | Axios                               |
| Icons    | Lucide React                        |
| Toasts   | React Hot Toast                     |
| Backend  | Plain Java — `com.sun.net.httpserver.HttpServer` |

---

## Folder Structure

```
Network-Connectivity-Checker/
├── frontend/
│   └── src/
│       ├── App.jsx          # Main page, state management, DFS animation
│       ├── GraphCanvas.jsx  # React Flow graph with custom ComputerNode
│       ├── ResultPanel.jsx  # Cards: status, traversal, adjacency, complexity
│       ├── api.js           # Axios POST /check helper
│       └── main.jsx         # React entry point
├── backend/
│   ├── Main.java            # HTTP server, JSON parse/serialize
│   ├── DFSService.java      # Core DFS algorithm
│   ├── GraphRequest.java    # Request POJO
│   └── GraphResponse.java   # Response POJO
└── README.md
```

---

## How to Run

### Backend (Java)

```bash
cd backend
javac *.java
java Main
# Server starts at http://localhost:8080
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

> Make sure the backend is running **before** clicking "Run DFS".

---

## Algorithm Explanation

### Depth First Search (DFS)

DFS explores a graph by going as deep as possible along each branch before backtracking.

**Steps:**
1. Start at node 1 (Computer 1).
2. Mark it as `visited` and record it in `traversalOrder`.
3. For each unvisited neighbour, recurse.
4. After DFS completes, count visited nodes.
5. If `visitedCount == totalNodes` → **Connected**, else → **Disconnected**.

**Implementation (Java):**

```java
void dfs(int node) {
    visited[node] = true;
    traversal.add(node);
    for (int neighbour : adj.get(node)) {
        if (!visited[neighbour]) {
            dfs(neighbour);
        }
    }
}
```

### Time Complexity

```
O(V + E)
```

- V = number of vertices (computers)
- E = number of edges (connections)
- Every vertex is visited once, every edge is traversed once.

### Space Complexity

```
O(V)
```

- `visited[]` array of size V
- Recursion call stack can go at most V levels deep.

---

## API

**POST** `http://localhost:8080/check`

**Request:**
```json
{
  "nodes": 6,
  "edges": [[1,2],[1,3],[2,4]]
}
```

**Response:**
```json
{
  "connected": false,
  "visitedOrder": [1, 2, 4, 3],
  "isolatedNodes": [5, 6],
  "adjacencyList": {
    "1": [2, 3],
    "2": [1, 4],
    "3": [1],
    "4": [2],
    "5": [],
    "6": []
  },
  "timeComplexity": "O(V + E)",
  "spaceComplexity": "O(V)"
}
```

---

## Screenshots

> *(Add screenshots here after running the project)*

---

## Future Improvements

- Add BFS traversal as an alternative algorithm
- Support for weighted edges and Dijkstra's shortest path
- Ability to add/remove nodes dynamically
- Export graph as image
- Step-by-step manual DFS mode for learning
