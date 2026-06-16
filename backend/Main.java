import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Main entry point.
 * Starts a plain Java HTTP server on port 8080 with a single endpoint: POST /check
 *
 * Run:
 *   javac *.java
 *   java Main
 */
public class Main {

    public static void main(String[] args) throws IOException {
        // Read port from environment variable, default to 8080
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Register the single endpoint
        server.createContext("/check", Main::handleCheck);

        server.setExecutor(null); // use default executor
        server.start();
        System.out.println("Backend running at http://localhost:" + port);
    }

    // -----------------------------------------------------------------------
    // Handle POST /check
    // -----------------------------------------------------------------------
    private static void handleCheck(HttpExchange exchange) throws IOException {
        // Allow cross-origin requests from the React dev server
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        // Handle CORS preflight
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        try {
            // Read request body
            String body = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8
            );

            // Parse JSON manually (no external library)
            GraphRequest request = parseRequest(body);

            // Run DFS algorithm
            DFSService service  = new DFSService();
            GraphResponse result = service.checkConnectivity(request);

            // Serialize response to JSON manually
            String json = serializeResponse(result);

            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.getResponseBody().close();

        } catch (Exception e) {
            String err = "{\"error\":\"" + e.getMessage() + "\"}";
            byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(500, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.getResponseBody().close();
        }
    }

    // -----------------------------------------------------------------------
    // Minimal JSON parser for the expected request shape:
    // { "nodes": 6, "edges": [[1,2],[3,4]] }
    // -----------------------------------------------------------------------
    private static GraphRequest parseRequest(String json) {
        GraphRequest req = new GraphRequest();
        req.edges = new ArrayList<>();

        // Extract "nodes" value
        req.nodes = extractInt(json, "nodes");

        // Extract the "edges" array
        int edgesStart = json.indexOf("\"edges\"");
        if (edgesStart != -1) {
            int arrStart = json.indexOf('[', edgesStart + 7); // skip past "edges"
            int arrEnd   = json.lastIndexOf(']');

            // The content between the outer brackets
            String edgesContent = json.substring(arrStart + 1, arrEnd).trim();

            if (!edgesContent.isEmpty()) {
                // Split individual [u,v] pairs
                int i = 0;
                while (i < edgesContent.length()) {
                    int open  = edgesContent.indexOf('[', i);
                    int close = edgesContent.indexOf(']', open);
                    if (open == -1 || close == -1) break;

                    String pair = edgesContent.substring(open + 1, close);
                    String[] parts = pair.split(",");
                    int u = Integer.parseInt(parts[0].trim());
                    int v = Integer.parseInt(parts[1].trim());
                    req.edges.add(new int[]{u, v});

                    i = close + 1;
                }
            }
        }

        return req;
    }

    // Extract an integer value for a given JSON key
    private static int extractInt(String json, String key) {
        int idx = json.indexOf("\"" + key + "\"");
        if (idx == -1) return 0;
        int colon = json.indexOf(':', idx);
        int start = colon + 1;
        // skip whitespace
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        int end = start;
        while (end < json.length() && Character.isDigit(json.charAt(end))) end++;
        return Integer.parseInt(json.substring(start, end));
    }

    // -----------------------------------------------------------------------
    // Manual JSON serializer for GraphResponse
    // -----------------------------------------------------------------------
    private static String serializeResponse(GraphResponse r) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");

        sb.append("\"connected\":").append(r.connected).append(",");

        sb.append("\"visitedOrder\":").append(listToJson(r.visitedOrder)).append(",");

        sb.append("\"isolatedNodes\":").append(listToJson(r.isolatedNodes)).append(",");

        sb.append("\"adjacencyList\":{");
        boolean firstKey = true;
        for (Map.Entry<Integer, List<Integer>> entry : r.adjacencyList.entrySet()) {
            if (!firstKey) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":");
            sb.append(listToJson(entry.getValue()));
            firstKey = false;
        }
        sb.append("},");

        sb.append("\"timeComplexity\":\"").append(r.timeComplexity).append("\",");
        sb.append("\"spaceComplexity\":\"").append(r.spaceComplexity).append("\"");

        sb.append("}");
        return sb.toString();
    }

    private static String listToJson(List<Integer> list) {
        if (list == null || list.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(list.get(i));
        }
        sb.append("]");
        return sb.toString();
    }
}
