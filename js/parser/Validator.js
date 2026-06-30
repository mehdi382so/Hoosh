/**
 * Validates parsed graph data for TSP.
 * 
 * Ensures the input meets all requirements:
 * - Non-empty array of edges
 * - Valid node names
 * - No self-loops
 * - Positive distances
 * - No duplicate edges
 * - At least 3 unique cities
 */
export default class Validator {
    static validate(edges) {

        if (!Array.isArray(edges)) throw new TypeError("Edges must be an array.")
        if (edges.length === 0) throw new Error("Input is empty. Please provide at least one edge.")

        const visitedEdges = new Set()
        const uniqueNodes = new Set()

        for (const edge of edges) {
            const { from, to, cost } = edge;

            if (!from || !to) throw new Error("Node name cannot be empty. " + `Found: from="${from}", to="${to}"`)
            if (from === to) throw new Error(`Self-loop detected: "${from}" cannot connect to itself.`)
            if (typeof cost !== "number" || Number.isNaN(cost)) 
                throw new Error(`Invalid distance between "${from}" and "${to}". ` + `Expected a number, got: ${cost}`)

            if (cost <= 0) throw new Error(`Distance must be greater than zero. ` + `Got ${cost} for "${from}" ↔ "${to}".`)

            const key = [from, to].sort().join("|")
            if (visitedEdges.has(key)) throw new Error(`Duplicate edge detected: "${from}" ↔ "${to}" ` + `already exists.`)

            visitedEdges.add(key)
            uniqueNodes.add(from)
            uniqueNodes.add(to)
        }

        if (uniqueNodes.size < 3)
            throw new Error(`At least 3 cities are required for a TSP tour. ` + `Found only ${uniqueNodes.size}: ${[...uniqueNodes].join(", ")}`)

        return true
    }
}
