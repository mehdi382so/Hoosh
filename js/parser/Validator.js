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
    /**
     * Validate parsed edges.
     *
     * @param {Array<Object>} edges - Array of { from, to, cost }
     * @throws {TypeError} If edges is not an array
     * @throws {Error} If validation fails for any reason
     */
    static validate(edges) {
        
        // 1. Type check
        if (!Array.isArray(edges))
            throw new TypeError("Edges must be an array.")

        // 2. Empty check
        if (edges.length === 0)
            throw new Error("Input is empty. Please provide at least one edge.")

        const visitedEdges = new Set()
        const uniqueNodes = new Set()

        // 3. Per-edge validation
        for (const edge of edges) {
            const { from, to, cost } = edge;

            // ── 3a. Node names must not be empty ──
            if (!from || !to) 
                throw new Error("Node name cannot be empty. " + `Found: from="${from}", to="${to}"`)

            // ── 3b. No self-loop allowed ──
            if (from === to)
                throw new Error(`Self-loop detected: "${from}" cannot connect to itself.`)

            // ── 3c. Cost must be a valid number ──
            if (typeof cost !== "number" || Number.isNaN(cost))
                throw new Error(`Invalid distance between "${from}" and "${to}". ` + `Expected a number, got: ${cost}`)

            // ── 3d. Cost must be positive ──
            if (cost <= 0)
                throw new Error(`Distance must be greater than zero. ` + `Got ${cost} for "${from}" ↔ "${to}".`)

            // ── 3e. Duplicate edge detection (undirected graph) ──
            const key = [from, to].sort().join("|")

            if (visitedEdges.has(key))
                throw new Error(`Duplicate edge detected: "${from}" ↔ "${to}" ` + `already exists.`)

            visitedEdges.add(key)

            // ── 3f. Collect unique nodes ──
            uniqueNodes.add(from)
            uniqueNodes.add(to)
        }

        // 4. Minimum cities check (TSP requires ≥ 3)
        if (uniqueNodes.size < 3)
            throw new Error(`At least 3 cities are required for a TSP tour. ` + `Found only ${uniqueNodes.size}: ${[...uniqueNodes].join(", ")}`)

        // ✅ All checks passed
        return true
    }
}
