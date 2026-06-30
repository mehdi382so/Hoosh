// js/algorithms/Greedy.js

import BaseAlgorithm from "./BaseAlgorithm.js"

/**
 * Greedy TSP Solver
 * Strategy: Nearest Neighbor
 */
export default class Greedy extends BaseAlgorithm {

    constructor(graph) {
        super(graph)
        this.name = "Greedy"
        this.stepCounter = 0
    }

    solve(startNode) {

        // 1. Validation
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
        this.stepCounter = 0

        // Step 1: Start Node
        this.stepCounter++
        this._recordStep('start', {
            message: `Start Node: ${startNode}`,
            path: [startNode],
            visitedNodes: [startNode],
            currentNode: startNode,
            stepNumber: this.stepCounter
        })

        visited.add(current)
        path.push(current)

        // 3. Main loop - Nearest Neighbor
        while (visited.size < totalNodes) {

            const neighbors = this.graph.getNeighbors(current)
            let bestNode = null
            let bestDistance = Infinity

            // Get available unvisited neighbors
            const availableNeighbors = neighbors
                .filter(edge => !visited.has(edge.to))
                .map(edge => ({ node: edge.to, cost: edge.cost }))

            // Step: Considering neighbors
            this.stepCounter++
            this._recordStep('considering', {
                message: `Node ${current}: Considering ${availableNeighbors.length} Neighbors`,
                path: [...path],
                visitedNodes: [...visited],
                currentNode: current,
                availableNeighbors: availableNeighbors,
                stepNumber: this.stepCounter
            })

            for (const edge of neighbors) {
                if (visited.has(edge.to)) continue
                if (edge.cost < bestDistance) {
                    bestDistance = edge.cost
                    bestNode = edge.to
                }
            }

            if (bestNode === null) {
                this._recordStep('error', {
                    message: `Cannot complete tour from "${current}"`,
                    path: [...path],
                    visitedNodes: [...visited],
                    stepNumber: this.stepCounter + 1
                })
                throw new Error(
                    `Cannot complete tour. ` +
                    `No unvisited neighbor from "${current}".`
                )
            }

            // Step: Selected Node
            this.stepCounter++
            this._recordStep('choose', {
                message: `Selected Node: ${bestNode} (${bestDistance})`,
                path: [...path],
                visitedNodes: [...visited],
                currentNode: current,
                selectedNode: bestNode,
                selectedCost: bestDistance,
                stepNumber: this.stepCounter
            })

            // Move to next node
            visited.add(bestNode)
            path.push(bestNode)
            current = bestNode

            // Step: Moved to new node
            this.stepCounter++
            this._recordStep('move', {
                message: `Node ${current}: ${visited.size}/${totalNodes} visited`,
                path: [...path],
                visitedNodes: [...visited],
                currentNode: current,
                progress: visited.size / totalNodes,
                stepNumber: this.stepCounter
            })
        }

        // 4. Calculate cost
        const cost = this.calculateCost(path)

        // Final step: Tour Complete
        this.stepCounter++
        this._recordStep('complete', {
            message: `✅ Tour Complete! Cost: ${cost}`,
            path: [...path],
            visitedNodes: [...visited],
            cost: cost,isComplete: true,
            stepNumber: this.stepCounter
        })

        return {
            algorithm: this.getName(),
            startNode: startNode,
            path: path,
            cost: cost,
            visitedNodes: visited.size,
            executionTime: 0,
            steps: this.useStepRecording ? this.stepRecorder.getAllSteps() : null
        }
    }
}