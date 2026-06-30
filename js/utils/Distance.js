/**
 * Distance Utility
 * Provides helper methods for working with graph distances.
 */
export default class Distance {
    /**
     * Get the distance between two nodes.
     *
     * @param {Graph} graph
     * @param {string} from
     * @param {string} to
     * @returns {number|null}
     */
    static between(graph, from, to) { return graph.getDistance(from, to) }

    /**
     * Calculate the total cost of a path.
     *
     * Example:
     * ["A", "B", "C", "D"]
     *
     * Returns:
     * A->B + B->C + C->D
     *
     * @param {Graph} graph
     * @param {string[]} path
     * @returns {number}
     */
    static pathCost(graph, path) {
        if (!Array.isArray(path))
            throw new TypeError("Path must be an array.")

        if (path.length < 2)
            return 0

        let totalCost = 0

        for (let i = 0; i < path.length - 1; i++) {
            const cost = graph.getDistance(path[i], path[i + 1])

            if (cost === null)
                throw new Error(`No edge between "${path[i]}" and "${path[i + 1]}".`)

            totalCost += cost
        }

        return totalCost
    }

    /**
     * Calculate a complete TSP tour cost.
     *
     * Example:
     * A -> B -> C -> D -> A
     *
     * @param {Graph} graph
     * @param {string[]} path
     * @returns {number}
     */
    static tourCost(graph, path) {
        if (!Array.isArray(path))
            throw new TypeError("Path must be an array.")

        if (path.length < 2)
            return 0

        const completePath = [...path, path[0]]
        return this.pathCost(graph, completePath)
    }

    /**
     * Check whether a path is a valid TSP tour.
     * Conditions:
     * - Visits every node exactly once.
     * - Contains all graph nodes.
     *
     * @param {Graph} graph
     * @param {string[]} path
     * @returns {boolean}
     */
    static isValidTour(graph, path) {
        if (!Array.isArray(path)) return false

        const nodes = graph
            .getNodes()
            .map(node => node.name)

        if (path.length !== nodes.length) return false

        const visited = new Set(path)
        if (visited.size !== nodes.length) return false

        for (const node of nodes) {
            if (!visited.has(node)) return false
        }

        return true
    }
}
