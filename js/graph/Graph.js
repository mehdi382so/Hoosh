import Node from "./Node.js"
import Edge from "./Edge.js"

/**
 * Represents an undirected weighted graph.
 */
export default class Graph {
    constructor() {
        /**
         * Stores all graph nodes.
         * key   -> node name
         * value -> Node instance
         */
        this.nodes = new Map()

        /**
         * Adjacency list.
         *
         * key   -> node name
         * value -> Array<Edge>
         */
        this.adjacencyList = new Map()
    }

    /**
     * Add a node.
     *
     * @param {string} name
     * @returns {Node}
     */
    addNode(name) {
        if (this.nodes.has(name))
            return this.nodes.get(name)

        const node = new Node(name)
        this.nodes.set(name, node)
        this.adjacencyList.set(name, [])

        return node
    }

    /**
     * Check if node exists.
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasNode(name) {
        return this.nodes.has(name)
    }

    /**
     * Get a node.
     *
     * @param {string} name
     * @returns {Node|null}
     */
    getNode(name) {
        return this.nodes.get(name) ?? null
    }

    /**
     * Add an undirected edge.
     *
     * @param {string} from
     * @param {string} to
     * @param {number} cost
     */
    addEdge(from, to, cost) {
        if (from === to)
            throw new Error("Self-loop edges are not allowed.")

        if (!this.hasNode(from))
            this.addNode(from)

        if (!this.hasNode(to))
            this.addNode(to)

        if (this.hasEdge(from, to))
            return

        const edge1 = new Edge(from, to, cost)
        const edge2 = new Edge(to, from, cost)

        this.adjacencyList.get(from).push(edge1)
        this.adjacencyList.get(to).push(edge2)
    }

    /**
     * Check whether an edge exists.
     *
     * @param {string} from
     * @param {string} to
     * @returns {boolean}
     */
    hasEdge(from, to) {
        if (!this.hasNode(from))
            return false

        return this.adjacencyList
            .get(from)
            .some(edge => edge.to === to)
    }

    /**
     * Get neighbors of a node.
     *
     * @param {string} name
     * @returns {Edge[]}
     */
    getNeighbors(name) {
        if (!this.hasNode(name))
            return []

        return [...this.adjacencyList.get(name)]
    }

    /**
     * Get distance between two nodes.
     *
     * @param {string} from
     * @param {string} to
     * @returns {number|null}
     */
    getDistance(from, to) {
        if (!this.hasNode(from))
            return null

        const edge = this.adjacencyList
            .get(from)
            .find(edge => edge.to === to)

        return edge ? edge.cost : null
    }

    /**
     * Return all unique edges.
     *
     * @returns {Edge[]}
     */
    getEdges() {
        const edges = []
        const visited = new Set()

        for (const neighbors of this.adjacencyList.values()) {
            for (const edge of neighbors) {
                const key = [edge.from, edge.to]
                    .sort()
                    .join("|")

                if (visited.has(key))
                    continue

                visited.add(key)
                edges.push(edge)
            }
        }

        return edges
    }

    /**
     * Get all nodes.
     *
     * @returns {Node[]}
     */
    getNodes() {
        return [...this.nodes.values()]
    }

    /**
     * Total nodes.
     *
     * @returns {number}
     */
    nodeCount() {
        return this.nodes.size
    }

    /**
     * Total edges.
     *
     * @returns {number}
     */
    edgeCount() {
        return this.getEdges().length
    }

    /**
     * Remove everything.
     */
    clear() {
        this.nodes.clear()
        this.adjacencyList.clear()
    }
}
