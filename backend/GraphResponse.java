import java.util.List;
import java.util.Map;

// Represents the JSON response returned to the frontend after DFS
public class GraphResponse {
    public boolean connected;
    public List<Integer> visitedOrder;
    public List<Integer> isolatedNodes;
    public Map<Integer, List<Integer>> adjacencyList;
    public String timeComplexity;
    public String spaceComplexity;
}
