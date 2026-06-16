# 🌐 Network Connectivity Checker
## *Interactive DFS Algorithm Visualizer with Real-time Network Simulation*

<div align="center">


[![Java](https://img.shields.io/badge/Java-ED8936?style=flat&logo=java&logoColor=white)](https://www.java.com/)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> 🚀 A powerful, interactive visualization tool for understanding **Depth First Search (DFS)** algorithms through an engaging computer network simulation experience.

</div>

<h2>Hosted Link : https://network-connectivity-checker-dfs.vercel.app/ </h2>

---

## 📋 Overview

Visualize and analyze graph connectivity in **real-time** with an intuitive drag-and-drop interface:

| 🔍 Detection | ⚡ Performance | 📊 Insights |
|:---:|:---:|:---:|
| **Connected** ↔️ **Disconnected** networks | Animated DFS traversal (500ms/step) | Live adjacency lists |
| Identify **isolated** computers | Step-by-step visualization | Complexity analysis |
| Interactive edge drawing | Color-coded node states | Real-time feedback |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Features
- ✅ 6 draggable computer nodes (React Flow)
- ✅ Visual edge-drawing (no typing!)
- ✅ Duplicate edge prevention
- ✅ Self-loop detection
- ✅ Live adjacency list updates
- ✅ Toast notifications

</td>
<td width="50%">

### 🎨 Visualization
- 🟢 **Green** = Visited nodes
- 🔵 **Blue** = Currently active
- ⚪ **Gray** = Unvisited nodes
- ⚡ Real-time animation
- 📱 Fully responsive UI
- 🎭 Smooth transitions

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<td><strong>🎨 Frontend</strong></td>
<td>React 18 (Vite), Tailwind CSS v4, React Flow</td>
</tr>
<tr>
<td><strong>💻 Backend</strong></td>
<td>Java (HttpServer, Clean Architecture)</td>
</tr>
<tr>
<td><strong>🔌 Communication</strong></td>
<td>Axios, REST API</td>
</tr>
<tr>
<td><strong>🎯 UI Components</strong></td>
<td>Lucide React Icons, React Hot Toast</td>
</tr>
</table>

---

## 📁 Project Structure

```
Network-Connectivity-Checker/
│
├── 📂 frontend/
│   ├── src/
│   │   ├── 🎨 App.jsx              # Main component & state management
│   │   ├── 📊 GraphCanvas.jsx      # React Flow graph visualization
│   │   ├── 📈 ResultPanel.jsx      # Results & complexity display
│   │   ├── 🔗 api.js               # Axios API calls
│   │   └── 🚀 main.jsx             # React entry point
│   ├── 🎯 index.html
│   ├── ⚙️  package.json
│   └── 🔧 vite.config.js
│
├── 📂 backend/
│   ├── 🖥️  Main.java               # HTTP server & JSON handling
│   ├── 🔍 DFSService.java          # Core DFS algorithm
│   ├── 📨 GraphRequest.java        # Request model
│   └── 📤 GraphResponse.java       # Response model
│
└── 📖 README.md
```

---

## 🚀 Quick Start

### Step 1️⃣ | Backend (Java)

```bash
cd backend
javac *.java
java Main
# ✅ Server running at http://localhost:8080
```

### Step 2️⃣ | Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# ✅ App available at http://localhost:5173
```

> ⚠️ **Important:** Start the backend **before** running DFS!

---

## 🧠 Algorithm Deep Dive

### 🔍 Depth First Search (DFS)

Explores a graph by traversing as deep as possible along each branch before backtracking.

#### ⚙️ How It Works

```
1️⃣  Start at node 1
2️⃣  Mark as visited → record in traversal order
3️⃣  Recursively visit unvisited neighbors
4️⃣  Backtrack & repeat for next branch
5️⃣  Count visited nodes
6️⃣  Connected? visitedCount == totalNodes
```

#### 💻 Java Implementation

```java
void dfs(int node) {
    visited[node] = true;
    traversal.add(node);
    
    for (int neighbour : adj.get(node)) {
        if (!visited[neighbour]) {
            dfs(neighbour);  // Recursive exploration
        }
    }
}
```

#### ⏱️ Complexity Analysis

| Metric | Value | Reason |
|--------|-------|--------|
| **Time** | **O(V + E)** | Each vertex & edge visited once |
| **Space** | **O(V)** | `visited[]` array + call stack depth |

Where:
- **V** = Number of vertices (computers)
- **E** = Number of edges (connections)

---

## 🔌 REST API Reference

### 📤 POST `/check`

**Endpoint:** `http://localhost:8080/check`

#### 📨 Request Body
```json
{
  "nodes": 6,
  "edges": [
    [1, 2],
    [1, 3],
    [2, 4]
  ]
}
```

#### 📬 Response Body
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

## 📸 Screenshots

> 🎬 Coming soon! Run the project and see the visualization in action.

---

## 🎯 Future Enhancements

<details>
<summary><strong>📋 Roadmap</strong></summary>

- 🔄 **BFS Algorithm** - Compare with DFS traversal
- 🗺️ **Dijkstra's Algorithm** - Shortest path visualization
- 🎚️ **Weighted Edges** - Distance-based connections
- ➕➖ **Dynamic Nodes** - Add/remove nodes at runtime
- 🖼️ **Export Graph** - Save as PNG/SVG
- 👓 **Tutorial Mode** - Manual step-by-step exploration
- 🎮 **Interactive Challenges** - Learn by doing
- 📊 **Performance Metrics** - Real-time statistics

</details>

---

## 📚 Learning Resources

This project demonstrates key **Data Structures & Algorithms** concepts:
- ✅ Graph representation (adjacency list)
- ✅ Recursive algorithms & backtracking
- ✅ Complexity analysis (Big O notation)
- ✅ Algorithm visualization & animation
- ✅ Full-stack development (Java + React)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests

---

<div align="center">

### ⭐ If you found this helpful, please give it a star!

Made with ❤️ by [Chaitanya Dalvi](https://github.com/ChaitanyDalvi06)

[⬆ Back to Top](#-network-connectivity-checker)

</div>
