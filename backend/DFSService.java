import java.util.*;

/**
 * DFSService contains all the core DFS algorithm logic.
 * Time Complexity:  O(V + E) - we visit every vertex and traverse every edge once.
 * Space Complexity: O(V)     - visited array + recursion call stack depth.
 */
public class DFSService {

    private int totalNodes;
    private List<List<Integer>> adj; // adjacency list (1-indexed, index 0 unused)
    private boolean[] visited;
    private List<Integer> traversal;

    // -----------------------------------------------------------------------
    // Build an adjacency list from the raw edge list sent by the frontend
    // -----------------------------------------------------------------------
    public void buildAdjacencyList(int nodes, List<int[]> edges) {
        this.totalNodes = nodes;
        adj = new ArrayList<>();

        // index 0 is unused; indices 1..nodes represent the computers
        for (int i = 0; i <= nodes; i++) {
            adj.add(new ArrayList<>());
        }

        for (int[] edge : edges) {
            int u = edge[0];
            int v = edge[1];
            // undirected graph: add both directions
            adj.get(u).add(v);
            adj.get(v).add(u);
        }

        // sort neighbour lists so traversal is deterministic (ascending order)
        for (int i = 1; i <= nodes; i++) {
            Collections.sort(adj.get(i));
        }
    }

    // -----------------------------------------------------------------------
    // Recursive DFS starting from 'node'
    // -----------------------------------------------------------------------
    public void dfs(int node) {
        visited[node] = true;       // mark current node as visited
        traversal.add(node);        // record traversal order

        for (int neighbour : adj.get(node)) {
            if (!visited[neighbour]) {
                dfs(neighbour);     // recurse into unvisited neighbours
            }
        }
    }

    // -----------------------------------------------------------------------
    // Run DFS from node 1 and determine connectivity
    // -----------------------------------------------------------------------
    public GraphResponse checkConnectivity(GraphRequest request) {
        buildAdjacencyList(request.nodes, request.edges);

        visited  = new boolean[totalNodes + 1]; // index 0 unused
        traversal = new ArrayList<>();

        // Start DFS from computer 1
        dfs(1);

        // Count how many nodes were visited
        int visitedCount = 0;
        List<Integer> isolated = new ArrayList<>();
        for (int i = 1; i <= totalNodes; i++) {
            if (visited[i]) {
                visitedCount++;
            } else {
                isolated.add(i); // nodes not reachable from node 1
            }
        }

        // Build the adjacency list map for the response (keys are integers)
        Map<Integer, List<Integer>> adjMap = new LinkedHashMap<>();
        for (int i = 1; i <= totalNodes; i++) {
            adjMap.put(i, new ArrayList<>(adj.get(i)));
        }

        // Assemble the response object
        GraphResponse response = new GraphResponse();
        response.connected      = (visitedCount == totalNodes);
        response.visitedOrder   = new ArrayList<>(traversal);
        response.isolatedNodes  = isolated;
        response.adjacencyList  = adjMap;
        response.timeComplexity  = "O(V + E)";
        response.spaceComplexity = "O(V)";

        return response;
    }
}
