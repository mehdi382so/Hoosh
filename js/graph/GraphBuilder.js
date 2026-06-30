import Graph from "./Graph.js"

/**
 * Builds a Graph instance from edge data.
 */
export default class GraphBuilder {
    static build(edges) {
        if (!Array.isArray(edges)) throw new TypeError("Edges must be an array.")

        const graph = new Graph()
        for (const edge of edges)
            graph.addEdge(edge.from, edge.to, edge.cost)

        return graph
    }
}
