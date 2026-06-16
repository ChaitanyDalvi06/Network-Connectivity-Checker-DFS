import java.util.List;

// Represents the JSON body sent from the frontend: { "nodes": 6, "edges": [[1,2],[1,3],...] }
public class GraphRequest {
    public int nodes;
    public List<int[]> edges;
}
