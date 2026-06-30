import Node from "./Node.js"
import Edge from "./Edge.js"

export default class Graph {
    constructor() {
        this.nodes = new Map()
        this.adjacencyList = new Map()
    }
    
    hasNode(name) { return this.nodes.has(name) }
    getNode(name) { return this.nodes.get(name) ?? null }
    getNodes() { return [...this.nodes.values()] }
    nodeCount() { return this.nodes.size }
    edgeCount() { return this.getEdges().length }

    addNode(name) {
        if (this.nodes.has(name)) return this.nodes.get(name)

        const node = new Node(name)    
        this.nodes.set(name, node)
        this.adjacencyList.set(name, [])

        return node
    }    

    addEdge(from, to, cost) {
        if (from === to) throw new Error("Self-loop edges are not allowed.")
        if (!this.hasNode(from)) this.addNode(from)
        if (!this.hasNode(to)) this.addNode(to)
        if (this.hasEdge(from, to)) return

        const edge1 = new Edge(from, to, cost)
        const edge2 = new Edge(to, from, cost)

        this.adjacencyList.get(from).push(edge1)
        this.adjacencyList.get(to).push(edge2)
    }

    hasEdge(from, to) {
        if (!this.hasNode(from)) return false

        return this.adjacencyList
            .get(from)
            .some(edge => edge.to === to)
    }

    getNeighbors(name) {
        if (!this.hasNode(name)) return []
        return [...this.adjacencyList.get(name)]
    }

    getDistance(from, to) {
        if (!this.hasNode(from)) return null

        const edge = this.adjacencyList
            .get(from)
            .find(edge => edge.to === to)

        return edge ? edge.cost : null
    }

    getEdges() {
        const edges = []
        const visited = new Set()

        for (const neighbors of this.adjacencyList.values()) {
            for (const edge of neighbors) {
                const key = [edge.from, edge.to]
                    .sort()
                    .join("|")

                if (visited.has(key)) continue

                visited.add(key)
                edges.push(edge)
            }
        }

        return edges
    }

    clear() {
        this.nodes.clear()
        this.adjacencyList.clear()
    }
}
