import axios from 'axios';

// Get backend URL from environment variable, default to localhost:8080
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/**
 * Send the graph to the Java backend and receive the DFS result.
 * @param {number}     nodes  - total node count
 * @param {number[][]} edges  - array of [u, v] pairs
 */
export async function runDFS(nodes, edges) {
  const response = await axios.post(`${BASE_URL}/check`, { nodes, edges });
  return response.data;
}
