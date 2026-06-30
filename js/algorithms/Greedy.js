import BaseAlgorithm from "./BaseAlgorithm.js"

/**
 * Greedy TSP Solver
 * Strategy: Nearest Neighbor
 * - Begin from start node
 * - In each level, the nearest unvisited neighbor gets chosen
 * - until visit all nodes
 * - Tour cost will be calculated
 */
export default class Greedy extends BaseAlgorithm {

    constructor(graph) {
        super(graph)
        this.name = "Greedy"
    }

    /**
     * Solve TSP by starting from one node
     * 
     * @param {string} startNode - Start Node
     * @returns {{ algorithm: string, startNode: string, path: string[], cost: number, visitedNodes: number, executionTime: number }}
     */
    solve(startNode) {

        // 1. Vallidation
        if (!startNode) {
            throw new Error("Starting node is required.")
        }

        if (!this.graph.hasNode(startNode)) {
            throw new Error(`Node "${startNode}" does not exist in the graph.`)
        }

        // 2. Init
        const totalNodes = this.graph.nodeCount()
        const visited = new Set()
        const path = []
        let current = startNode

        visited.add(current)
        path.push(current)

        // 3. Main loop - Nearest Neighbor
        while (visited.size < totalNodes) {

            const neighbors = this.graph.getNeighbors(current)

            let bestNode = null
            let bestDistance = Infinity

            for (const edge of neighbors) {
                // Skip visited nodes
                if (visited.has(edge.to))
                    continue

                // Choose nearest
                if (edge.cost < bestDistance) {
                    bestDistance = edge.cost
                    bestNode = edge.to
                }
            }

            // Graph is not complete - Tour cannot be made
            if (bestNode === null) {
                throw new Error(
                    `Cannot complete tour. ` +
                    `No unvisited neighbor from "${current}". ` +
                    `The graph must be fully connected.`
                )
            }

            // Move to next node
            visited.add(bestNode)
            path.push(bestNode)
            current = bestNode
        }

        // 4. Calculate cost - Back to start node
        const cost = this.calculateCost(path)

        return {
            algorithm: this.getName(),
            startNode: startNode,
            path: path,
            cost: cost,
            visitedNodes: visited.size,
            executionTime: 0
        }
    }
}