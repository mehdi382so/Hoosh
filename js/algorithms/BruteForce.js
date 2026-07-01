import BaseAlgorithm from "./BaseAlgorithm.js"
import Distance from "../utils/Distance.js"

export default class BruteForce extends BaseAlgorithm {
    constructor(graph) {
        super(graph)
        this.name = "BruteForce"
        this.bestPath = null
        this.bestCost = Infinity
        this.allNodes = []
        this.stepCounter = 0
        this.totalValidPaths = 0
        this.totalInvalidPaths = 0
    }

    solve(startNode) {
        if (!startNode) throw new Error("Starting node is required.")
        if (!this.graph.hasNode(startNode)) throw new Error(`Node "${startNode}" does not exist in the graph.`)

        this.allNodes = this.getNodeNames()
        this.bestPath = null
        this.bestCost = Infinity
        this.stepCounter = 0
        this.totalValidPaths = 0
        this.totalInvalidPaths = 0

        this.stepCounter++
        this._recordStep("start", {
            path: [startNode],
            message: `Start : ${startNode}`,
            stepNumber: this.stepCounter
        })

        const initialPath = [startNode]
        const visited = new Set([startNode])

        this._search(initialPath, visited)

        if (!this.bestPath) {
            throw new Error("No valid TSP tour found")
        }

        this.stepCounter++
        this._recordStep("complete", {
            path: this.bestPath,
            cost: this.bestCost,
            message: `Best : ${this.bestPath.join(" → ")} → ${this.bestPath[0]} = ${this.bestCost}`,
            stepNumber: this.stepCounter
        })

        return {
            algorithm: this.getName(),
            startNode: startNode,
            path: this.bestPath,
            cost: this.bestCost,
            visitedNodes: this.bestPath.length,
            executionTime: 0,
            steps: this.useStepRecording ? this.stepRecorder.getAllSteps() : null,
            totalValidPaths: this.totalValidPaths,
            totalInvalidPaths: this.totalInvalidPaths
        }
    }

    _search(path, visited) {
        // ✅ استفاده از Distance.pathCost
        const currentCost = Distance.pathCost(this.graph, path)
        this.stepCounter++
        this._recordStep("path", {
            path: [...path],
            cost: currentCost,
            message: `path : ${path.join(" - ")}`,
            stepNumber: this.stepCounter
        })

        if (path.length === this.allNodes.length) {
            // ✅ استفاده از Distance.isValidTour
            const isValid = Distance.isValidTour(this.graph, path)
            
            if (isValid) {
                // ✅ استفاده از Distance.tourCost
                const fullCost = Distance.tourCost(this.graph, path)
                this.totalValidPaths++
                
                this.stepCounter++
                this._recordStep("full_valid", {
                    path: [...path],
                    cost: fullCost,
                    message: `Valid Path : ${[...path, path[0]].join(" - ")} = ${fullCost}`,
                    stepNumber: this.stepCounter
                })

                if (fullCost < this.bestCost) {
                    this.bestCost = fullCost
                    this.bestPath = [...path]
                    
                    this.stepCounter++
                    this._recordStep("better", {
                        path: [...path],
                        cost: fullCost,
                        message: `New best : ${[...path, path[0]].join(" - ")} = ${fullCost}`,
                        stepNumber: this.stepCounter
                    })
                }
            } else {
                this.totalInvalidPaths++
                
                this.stepCounter++
                this._recordStep("full_invalid", {
                    path: [...path],
                    message: `Invalid: No return edge from ${path[path.length-1]} to ${path[0]}`,
                    stepNumber: this.stepCounter
                })
            }
            return
        }

        const currentNode = path[path.length - 1]
        const neighbors = this.allNodes
            .filter(node => !visited.has(node))
            .map(node => ({
                node: node,
                cost: this.graph.getDistance(currentNode, node)
            }))
            .filter(neighbor => neighbor.cost !== null && neighbor.cost !== undefined)

        this.stepCounter++
        this._recordStep("exploring", {
            path: [...path],
            currentNode: currentNode,
            neighbors: neighbors.map(n => n.node),
            message: `valid neighbors of ${currentNode} : ${neighbors.map(n => n.node).join(" , ")}`,
            stepNumber: this.stepCounter
        })

        if (neighbors.length === 0 && path.length < this.allNodes.length) {
            this.stepCounter++
            this._recordStep("dead_end", {
                path: [...path],
                currentNode: currentNode,
                message: `Dead end from ${currentNode}`,
                stepNumber: this.stepCounter
            })
            return
        }

        for (const neighbor of neighbors) {
            const edgeExists = this.graph.getDistance(currentNode, neighbor.node) !== null
            
            if (!edgeExists) {
                this.stepCounter++
                this._recordStep("skip_no_edge", {
                    path: [...path],
                    from: currentNode,
                    to: neighbor.node,
                    message: `No edge: ${currentNode} → ${neighbor.node}`,
                    stepNumber: this.stepCounter
                })
                continue
            }

            this.stepCounter++
            this._recordStep("trying", {
                path: [...path],
                from: currentNode,
                to: neighbor.node,
                message: `Trying : ${currentNode} → ${neighbor.node}`,
                stepNumber: this.stepCounter
            })

            path.push(neighbor.node)
            visited.add(neighbor.node)

            this.stepCounter++
            this._recordStep("move", {
                path: [...path],
                from: currentNode,
                to: neighbor.node,
                message: `Move to : ${neighbor.node}`,
                stepNumber: this.stepCounter
            })

            this._search(path, visited)

            const removedNode = path.pop()
            visited.delete(removedNode)

            this.stepCounter++
            this._recordStep("backtrack", {
                path: [...path],
                node: removedNode,
                message: `Back from : ${removedNode}`,
                stepNumber: this.stepCounter
            })
        }
    }
}
