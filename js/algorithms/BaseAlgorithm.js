import Distance from "../utils/Distance.js"

/**
 * Base class for all TSP algorithms.
 * Every algorithm should extend this class.
 */
export default class BaseAlgorithm {
    /**
     * @param {Graph} graph
     */
    constructor(graph) {

        if (!graph)
            throw new Error("Graph is required.")

        /**
         * Graph instance.
         * @protected
         */
        this.graph = graph

        /**
         * Algorithm name.
         * @protected
         */
        this.name = "Base Algorithm"
    }

    /**
     * Return algorithm name.
     *
     * @returns {string}
     */
    getName() {
        return this.name
    }

    /**
     * Return graph.
     *
     * @returns {Graph}
     */
    getGraph() {
        return this.graph
    }

    /**
     * Calculate tour cost.
     *
     * @param {string[]} path
     * @returns {number}
     */
    calculateCost(path) {
        return Distance.tourCost(
            this.graph,
            path
        )
    }

    /**
     * Return all node names.
     *
     * @returns {string[]}
     */
    getNodeNames() {
        return this.graph
            .getNodes()
            .map(node => node.name)
    }

    /**
     * Check whether a tour is valid.
     *
     * @param {string[]} path
     * @returns {boolean}
     */
    isValid(path) {
        return Distance.isValidTour(
            this.graph,
            path
        )
    }

    /**
     * Solve TSP.
     *
     * Every algorithm must override this method.
     *
     * @returns {Object}
     */
    solve() {
        throw new Error(
            `${this.getName()} must implement solve().`
        )
    }
}