import axios from 'axios';

// Port 8090 — 8080 is reserved by Jenkins on this machine
const BASE_URL = 'http://localhost:8090';

/**
 * Send the graph to the Java backend and receive the DFS result.
 * @param {number}     nodes  - total node count
 * @param {number[][]} edges  - array of [u, v] pairs
 */
export async function runDFS(nodes, edges) {
  const response = await axios.post(`${BASE_URL}/check`, { nodes, edges });
  return response.data;
}
