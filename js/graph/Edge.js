/**
 * Graph Edge
 *
 * Represents an undirected weighted edge.
 */
export default class Edge {
    /**
     * Create an edge.
     *
     * @param {string} from
     * @param {string} to
     * @param {number} cost
     */
    constructor(from, to, cost) {
        if (typeof from !== "string" || typeof to !== "string")
            throw new TypeError("Node names must be strings.")

        if (typeof cost !== "number" || Number.isNaN(cost))
            throw new TypeError("Edge cost must be a valid number.")

        this.from = from.trim()
        this.to = to.trim()
        this.cost = cost
    }

    /**
     * Check whether this edge connects two nodes.
     * Order does not matter because the graph is undirected.
     *
     * @param {string} nodeA
     * @param {string} nodeB
     * @returns {boolean}
     */
    connects(nodeA, nodeB) {
        return (
            (this.from === nodeA && this.to === nodeB) ||
            (this.from === nodeB && this.to === nodeA)
        )
    }

    /**
     * Convert edge to JSON object.
     *
     * @returns {Object}
     */
    toJSON() {
        return {
            from: this.from,
            to: this.to,
            cost: this.cost
        }
    }

    /**
     * Clone this edge.
     *
     * @returns {Edge}
     */
    clone() {
        return new Edge(
            this.from,
            this.to,
            this.cost
        )
    }
}