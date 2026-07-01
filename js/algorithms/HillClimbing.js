import BaseAlgorithm from './BaseAlgorithm.js'
import Distance from '../utils/Distance.js'

export default class HillClimbing extends BaseAlgorithm {
    constructor(graph) {
        super(graph)
        this.name = 'HillClimbing'
        this.bestPath = null
        this.bestCost = Infinity
        this.iterations = 0
        this.improvements = 0
        this.stepCounter = 0
    }

    solve(startNode) {
        if (!startNode) throw new Error("Starting node is required.")
        if (!this.graph.hasNode(startNode)) throw new Error(`Node "${startNode}" does not exist in the graph.`)

        const nodeCount = this.graph.nodeCount()
        const edgeCount = this.graph.edgeCount()
        const expectedEdges = (nodeCount * (nodeCount - 1)) / 2


        if(edgeCount !== expectedEdges)
            throw new Error('Graph is not complete!')

        this.bestPath = null
        this.bestCost = Infinity
        this.iterations = 0
        this.improvements = 0
        this.stepCounter = 0

        const initialPath = this._generateRandomPath(startNode)
        const initialCost = Distance.tourCost(this.graph, initialPath)

        this.bestPath = initialPath
        this.bestCost = initialCost

        this.stepCounter = 0
        this._recordStep("initial_path", {
            stepNumber: this.stepCounter,
            path: initialPath,
            cost: initialCost,
            message: `Initial random path : ${[...initialPath, initialPath[0]].join(" → ")} = ${initialCost}`
        })

        let currentPath = [...initialPath]
        let currentCost = initialCost
        let improved = true

        while(improved) {
            improved = false
            this.iterations++

            this.stepCounter++
            this._recordStep(`iteration_${this.iterations}_start`, {
                stepNumber: this.stepCounter,
                path: currentPath,
                cost: currentCost,
                message: `Starting iteration ${this.iterations} : evaluating neighbors of current path with cost ${currentCost}`
            })

            const neighbors = this._getNeighbors(currentPath)
            console.log(neighbors);

            let bestNeighbor = null
            let bestNeighborCost = Infinity

            for(const neighbor of neighbors) {
                if(neighbor.cost < bestNeighborCost) {
                    bestNeighborCost = neighbor.cost
                    bestNeighbor = neighbor
                }
            }

            // For reporting only: detect which two nodes were swapped
            let swappedNodes = null
            if(bestNeighbor) {
                const swappedIndices = []
                for(let k = 0; k < currentPath.length; k++) {
                    if(currentPath[k] !== bestNeighbor.path[k]) swappedIndices.push(k)
                }
                if(swappedIndices.length === 2) {
                    swappedNodes = [currentPath[swappedIndices[0]], currentPath[swappedIndices[1]]]
                }
            }

            this.stepCounter++
            this._recordStep(`iteration_${this.iterations}_neighbors_evaluated`, {
                stepNumber: this.stepCounter,
                path: currentPath,
                cost: currentCost,
                neighbors_count: neighbors.length,
                best_neighbor_cost: bestNeighborCost,
                best_neighbor_path: bestNeighbor ? bestNeighbor.path : null,
                swapped_nodes: swappedNodes,
                message: swappedNodes
                    ? `Out of ${neighbors.length} neighbors, the best one swaps nodes "${swappedNodes[0]}" and "${swappedNodes[1]}" : cost = ${bestNeighborCost}`
                    : `Out of ${neighbors.length} neighbors, best cost = ${bestNeighborCost}`
            })

            this.stepCounter++
            this._recordStep(`iteration_${this.iterations}`, {
                stepNumber: this.stepCounter,
                path: currentPath,
                cost: currentCost,
                neighbors_count: neighbors.length,
                best_neighbor_cost: bestNeighborCost,
                message: `Iteration ${this.iterations}: current cost = ${currentCost}, best neighbor = ${bestNeighborCost}`
            })

            if(bestNeighbor && bestNeighborCost < currentCost) {
                currentPath = bestNeighbor.path
                currentCost = bestNeighborCost

                improved = true
                this.improvements++
                if(currentCost < this.bestCost) {
                    this.bestPath = [...currentPath]
                    this.bestCost = currentCost
                }

                this.stepCounter++
                this._recordStep(`improvement_${this.improvements}`, {
                    stepNumber: this.stepCounter,
                    path: currentPath,
                    cost: currentCost,
                    swapped_nodes: swappedNodes,
                    message: `Improvement found : ${[...currentPath, currentPath[0]].join(" → ")} = ${currentCost}`
                })
            }
            else {
                this.stepCounter++
                this._recordStep(`local_optimum`, {
                    stepNumber: this.stepCounter,
                    path: currentPath,
                    cost: currentCost,
                    message: `Local optimum reached after ${this.iterations} iterations, ${this.improvements} improvements`
                })
            }
        }

        this.stepCounter++
        this._recordStep(`complete`, {
            stepNumber: this.stepCounter,
            path: this.bestPath,
            cost: this.bestCost,
            message: `Final best : ${[...this.bestPath, this.bestPath[0]].join(" → ")} = ${this.bestCost}`
        })

        return {
            algorithm: this.getName(),
            startNode: startNode,
            path: this.bestPath,
            cost: this.bestCost,
            visitedNodes: this.bestPath.length,
            executionTime: 0,
            steps: this.useStepRecording ? this.stepRecorder.getAllSteps() : null,
            iterations: this.iterations,
            improvements: this.improvements
        }
    }

    _generateRandomPath(startNode) {
        const allNodes = this.getNodeNames()
        const otherNodes = allNodes.filter(node => node !== startNode)

        for(let i = otherNodes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherNodes[i], otherNodes[j]] = [otherNodes[j], otherNodes[i]];
        }

        return [startNode, ...otherNodes]
    }

    _getNeighbors(path) {
        const neighbors = []
        const n = path.length

        for(let i = 1; i < n - 1; i++) {
            for(let j = i + 1; j < n; j++) {
                const newPath = [...path]
                newPath[i] = path[j]
                newPath[j] = path[i]

                const cost = Distance.tourCost(this.graph, newPath)

                neighbors.push({
                    path: newPath,
                    cost: cost
                })
            }
        }
        return neighbors
    }
}