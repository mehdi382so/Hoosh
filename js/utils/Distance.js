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
     * Check whether a path is valid (all edges exist).
     *
     * @param {Graph} graph
     * @param {string[]} path
     * @returns {boolean}
     */
    static isValidPath(graph, path) {
        if (!Array.isArray(path)) return false
    
        const nodes = graph.getNodes().map(node => node.name)
    
        // شرط 1: تعداد گره‌ها باید برابر باشد
        if (path.length !== nodes.length) return false
    
        // شرط 2: همه گره‌ها دقیقاً یک بار دیده شده‌اند
        const visited = new Set(path)
        if (visited.size !== nodes.length) return false
    
        for (const node of nodes) {
            if (!visited.has(node)) return false
        }
    
        // شرط 3: همه یال‌های بین گره‌های متوالی باید وجود داشته باشند
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const to = path[i + 1]
            const distance = graph.getDistance(from, to)
            
            if (distance === null) return false  // یال وجود ندارد
        }

        return true
    }

    /**
     * Check whether a path is a valid TSP tour.
     * Conditions:
     * 1. Visits every node exactly once
     * 2. Contains all graph nodes
     * 3. Every consecutive pair has an edge in the graph
     * 4. Last node connects back to first node
     *
     * @param {Graph} graph
     * @param {string[]} path
     * @returns {boolean}
     */
    static isValidTour(graph, path) {
        if (!Array.isArray(path)) return false
    
        const nodes = graph.getNodes().map(node => node.name)
    
        // شرط 1: تعداد گره‌ها باید برابر باشد
        if (path.length !== nodes.length) return false
    
        // شرط 2: همه گره‌ها دقیقاً یک بار دیده شده‌اند
        const visited = new Set(path)
        if (visited.size !== nodes.length) return false
    
        for (const node of nodes) {
            if (!visited.has(node)) return false
        }
    
        // شرط 3: همه یال‌های بین گره‌های متوالی باید وجود داشته باشند
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const to = path[i + 1]
            const distance = graph.getDistance(from, to)
            
            if (distance === null) return false  // یال وجود ندارد
        }
    
        // شرط 4: یال برگشت از آخرین به اولین گره باید وجود داشته باشد
        const lastNode = path[path.length - 1]
        const firstNode = path[0]
        const returnEdge = graph.getDistance(lastNode, firstNode)
        
        if (returnEdge === null) return false  // یال برگشت وجود ندارد
    
        return true
    }
}
